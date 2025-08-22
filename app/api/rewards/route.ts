import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Não autorizado.", { status: 401 });
    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return new NextResponse("Perfil não encontrado.", { status: 404 });

    let progress = await db.rewardProgress.findUnique({ where: { profileId: profile.id } });

    // calcular todaySeconds (soma sessions que cruzam hoje)
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate()+1);
    // Buscar o canal "Call" (apenas ele conta)
    const callChannel = await db.channel.findFirst({ where: { name: "Call", type: "AUDIO" } });
    if (!callChannel) {
      return NextResponse.json({
        validDays: progress?.validDays ?? 0,
        availableCents: progress?.availableCents ?? 0,
        todaySeconds: 0,
        hasAgreed: !!progress,
        isInCall: false
      });
    }
    const callChannelId = callChannel.id;
    
    // Buscar todas as sessões do usuário hoje na call "Call"
    const sessions = await db.rewardSession.findMany({ 
      where: { 
        profileId: profile.id,
        roomId: callChannelId
      },
      orderBy: { startedAt: 'desc' }
    });
    
    // Debug: verificar se há sessões
    if (sessions.length === 0) {
      console.log(`[REWARDS] No sessions found for room (${callChannelId}). User not in call.`);
      return NextResponse.json({
        validDays: progress?.validDays ?? 0,
        availableCents: progress?.availableCents ?? 0,
        todaySeconds: 0,
        hasAgreed: !!progress,
        isInCall: false
      });
    }
    
    // Calcular tempo das sessões fechadas do dia
    let todaySeconds = 0;
    let isInCall = false;
    
    // Função para calcular overlap de uma sessão com hoje
    const calculateOverlap = (sessionStart: Date, sessionEnd: Date | null) => {
      const startMs = start.getTime();
      const endMs = end.getTime();
      const sessionStartMs = sessionStart.getTime();
      const sessionEndMs = sessionEnd ? sessionEnd.getTime() : Date.now();
      
      const overlapStart = Math.max(startMs, sessionStartMs);
      const overlapEnd = Math.min(endMs, sessionEndMs);
      
      return Math.max(0, Math.floor((overlapEnd - overlapStart) / 1000));
    };
    
    // Calcular tempo de todas as sessões fechadas de hoje
    for (const session of sessions) {
      if (session.endedAt) { // Só sessões fechadas
        const sessionStart = new Date(session.startedAt);
        const sessionEnd = new Date(session.endedAt);
        
        const sessionSeconds = calculateOverlap(sessionStart, sessionEnd);
        todaySeconds += sessionSeconds;
        
        console.log(`[REWARDS] Session ${session.id}: ${sessionSeconds}s (${sessionStart.toLocaleTimeString()} - ${sessionEnd.toLocaleTimeString()})`);
      }
    }
    // Verificar se há uma sessão ativa (sem endDate)
    const activeSession = sessions.find(s => !s.endedAt);
    if (!activeSession) {
      // Não está na call agora: retorna tempo fechado acumulado
      return NextResponse.json({
        validDays: progress?.validDays ?? 0,
        availableCents: progress?.availableCents ?? 0,
        todaySeconds,
        hasAgreed: !!progress,
        isInCall: false
      });
    }

    console.log(`[REWARDS] Active session found: ${activeSession.id}, Started: ${activeSession.startedAt}`);

    // Adicionar tempo da sessão ativa atual (se houver)
    if (activeSession) {
      // Verificar presença real no LiveKit (por profileId)
      try {
        // Em produção, usar URL absoluta baseada no host da requisição
        let url: string;
        if (process.env.NODE_ENV === 'production') {
          // Em produção, usar o host da requisição atual
          const host = req.headers.get('host') || req.headers.get('x-forwarded-host');
          const protocol = req.headers.get('x-forwarded-proto') || 'https';
          url = `${protocol}://${host}/api/livekit/connected-users/${callChannelId}`;
        } else {
          url = `http://localhost:3000/api/livekit/connected-users/${callChannelId}`;
        }
        
        console.log(`[REWARDS] Checking LiveKit presence at: ${url}`);
        console.log(`[REWARDS] Profile ID: ${profile.id}, User ID: ${profile.userId}`);
        console.log(`[REWARDS] Environment: ${process.env.NODE_ENV}`);
        console.log(`[REWARDS] Host: ${req.headers.get('host')}`);
        
        const lkRes = await fetch(url, { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (lkRes.ok) {
          const responseData = await lkRes.json();
          console.log(`[REWARDS] LiveKit API response:`, responseData);
          
          const { connectedUsers } = responseData;
          console.log(`[REWARDS] LiveKit connected users count: ${connectedUsers?.length || 0}`);
          
          if (Array.isArray(connectedUsers)) {
            // Verificar se o usuário está conectado comparando com o userId do Clerk
            isInCall = connectedUsers.some((u: any) => {
              try {
                if (u.metadata) {
                  const metadata = JSON.parse(u.metadata);
                  console.log(`[REWARDS] Checking participant: ${u.identity}, metadata:`, metadata);
                  
                  // Verificar por userId (mais confiável)
                  if (metadata.userId === profile.userId) {
                    console.log(`[REWARDS] ✅ Found user by userId: ${profile.userId}`);
                    return true;
                  }
                  
                  // Verificar por profileId como fallback
                  if (metadata.profileId === profile.id) {
                    console.log(`[REWARDS] ✅ Found user by profileId: ${profile.id}`);
                    return true;
                  }
                  
                  // Verificar por identity como último fallback
                  if (u.identity === profile.id) {
                    console.log(`[REWARDS] ✅ Found user by identity: ${profile.id}`);
                    return true;
                  }
                }
              } catch (error) {
                console.error(`[REWARDS] Error parsing metadata for ${u.identity}:`, error);
              }
              return false;
            });
          } else {
            console.log(`[REWARDS] connectedUsers is not an array:`, typeof connectedUsers, connectedUsers);
          }
          
          console.log(`[REWARDS] Final result - User in call: ${isInCall}`);
        } else {
          console.error(`[REWARDS] LiveKit API returned status: ${lkRes.status}`);
          const errorText = await lkRes.text();
          console.error(`[REWARDS] LiveKit API error response:`, errorText);
          
          // Em caso de erro, tentar uma abordagem alternativa
          console.log(`[REWARDS] Trying alternative approach - assuming user is in call if session is active`);
          isInCall = true; // Fallback: se há sessão ativa, assumir que está na call
        }
      } catch (error) {
        console.error(`[REWARDS] Error checking LiveKit presence:`, error);
      }

      if (isInCall) {
        const activeSessionStart = new Date(activeSession.startedAt);
        const activeSessionSeconds = calculateOverlap(activeSessionStart, null);
        todaySeconds += activeSessionSeconds;
      } else {
        // garantir não deixar sessão aberta
        await db.rewardSession.updateMany({ where: { profileId: profile.id, endedAt: null, roomId: callChannelId }, data: { endedAt: new Date() } });
      }
    }
    
    console.log(`[REWARDS] Total time today: ${todaySeconds}s`);

    // Debug: log para verificar se está funcionando
    console.log(`[REWARDS] User: ${profile.name}, Today seconds: ${todaySeconds}, Sessions: ${sessions.length}, Room: Call`);
    console.log(`[REWARDS] Debug: Profile ID: ${profile.id}, Room ID filter: 2fc68e16-dbca-4b2a-bc2b-32cb3cfb6f42`);
    
    // Log todas as sessões para debug
    const allSessions = await db.rewardSession.findMany({ 
      where: { profileId: profile.id },
      orderBy: { startedAt: 'desc' }
    });
    console.log(`[REWARDS] All sessions for user: ${allSessions.length}`);
    allSessions.forEach(sess => {
      console.log(`[REWARDS] Session: ${sess.id}, Room: ${sess.roomId}, Started: ${sess.startedAt}, Ended: ${sess.endedAt}`);
    });

    return NextResponse.json({
      validDays: progress?.validDays ?? 0,
      availableCents: progress?.availableCents ?? 0,
      todaySeconds,
      hasAgreed: !!progress, // true se já concordou (tem progresso)
      isInCall
    });
  } catch (e) {
    return new NextResponse("Erro interno.", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Não autorizado.", { status: 401 });
    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return new NextResponse("Perfil não encontrado.", { status: 404 });
    const { action, roomId, pixKey, amountCents } = await req.json();

    if (action === "agree") {
      const progress = await db.rewardProgress.upsert({
        where: { profileId: profile.id },
        update: {},
        create: { profileId: profile.id },
      });
      return NextResponse.json(progress);
    }

    if (action === "startSession") {
      // Fechar quaisquer sessões abertas em outras salas para evitar duplicidade
      await db.rewardSession.updateMany({
        where: { profileId: profile.id, endedAt: null, NOT: { roomId } },
        data: { endedAt: new Date() },
      });

      // Se já houver uma sessão aberta para esta sala, apenas retorne-a
      const openExisting = await db.rewardSession.findFirst({ where: { profileId: profile.id, roomId, endedAt: null } });
      if (openExisting) return NextResponse.json(openExisting);

      const session = await db.rewardSession.create({ data: { profileId: profile.id, roomId } });
      return NextResponse.json(session);
    }

    if (action === "endSession") {
      // Encerrar TODAS as sessões abertas do usuário para garantir limpeza
      await db.rewardSession.updateMany({ where: { profileId: profile.id, endedAt: null }, data: { endedAt: new Date() } });
      return NextResponse.json({ ok: true });
    }

    if (action === "requestPix") {
      const reqP = await db.rewardPayoutRequest.create({ data: { profileId: profile.id, amountCents, pixKey } });
      
      // Enviar DM para o Saimon sobre o pedido de PIX
      try {
        // Buscar o perfil do Saimon (owner)
        const saimonProfile = await db.profile.findFirst({
          where: { name: "SAIMON" }
        });
        
        if (saimonProfile) {
          // Buscar ou criar conversa entre o usuário e Saimon
          let conversation = await db.conversation.findFirst({
            where: {
              OR: [
                {
                  memberOne: { profileId: profile.id },
                  memberTwo: { profileId: saimonProfile.id }
                },
                {
                  memberOne: { profileId: saimonProfile.id },
                  memberTwo: { profileId: profile.id }
                }
              ]
            }
          });
          
          if (!conversation) {
            // Criar conversa se não existir
            const member1 = await db.member.findFirst({ where: { profileId: profile.id } });
            const member2 = await db.member.findFirst({ where: { profileId: saimonProfile.id } });
            
            if (member1 && member2) {
              conversation = await db.conversation.create({
                data: {
                  memberOneId: member1.id,
                  memberTwoId: member2.id
                }
              });
            }
          }
          
          if (conversation) {
            // Buscar o member do usuário atual
            const member = await db.member.findFirst({
              where: {
                profileId: profile.id
              }
            });
            
            if (member) {
              // Criar a mensagem de pedido de PIX
              const message = await db.directMessage.create({
                data: {
                  content: `💰 **PEDIDO DE PIX**\n\n👤 **Usuário:** ${profile.name}\n💳 **Chave Pix:** ${pixKey}\n💵 **Valor:** R$ ${(amountCents / 100).toFixed(2)}\n📅 **Data:** ${new Date().toLocaleString('pt-BR')}\n\n✅ Pedido registrado no sistema de recompensas.`,
                  conversationId: conversation.id,
                  memberId: member.id
                }
              });
              
              // Emitir via socket para atualização em tempo real
              // (isso seria feito via socket.io se estivesse configurado)
            }
          }
        }
      } catch (error) {
        console.error('Erro ao enviar DM para Saimon:', error);
        // Não falhar o pedido se a DM não conseguir ser enviada
      }
      
      return NextResponse.json(reqP);
    }

    return new NextResponse("Ação inválida.", { status: 400 });
  } catch (e) {
    return new NextResponse("Erro interno.", { status: 500 });
  }
}


