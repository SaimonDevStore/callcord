import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Não autorizado.", { status: 401 });

    // Buscar todas as amizades do usuário
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { profileId: profile.id },
          { friendId: profile.id },
        ],
      },
      include: { 
        profile: true, 
        friend: true 
      },
      orderBy: { updatedAt: "desc" },
    });

    // Separar amigos aceitos de solicitações pendentes
    const acceptedFriends = friendships.filter(f => f.status === "ACCEPTED");
    const pendingRequests = friendships.filter(f => f.status === "PENDING");

    // Para amigos aceitos, determinar quem é o outro usuário
    const friends = acceptedFriends.map(friendship => {
      const isRequester = friendship.profileId === profile.id;
      const otherUser = isRequester ? friendship.friend : friendship.profile;
      return {
        id: friendship.id,
        friend: otherUser,
        status: friendship.status,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
      };
    });

    // Para solicitações pendentes, determinar se é enviada ou recebida
    const requests = pendingRequests.map(friendship => {
      const isRequester = friendship.profileId === profile.id;
      const otherUser = isRequester ? friendship.friend : friendship.profile;
      const isReceived = friendship.friendId === profile.id;
      
      return {
        id: friendship.id,
        friend: otherUser,
        status: friendship.status,
        isReceived, // true se recebeu a solicitação, false se enviou
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
      };
    });

    return NextResponse.json({
      friends,
      requests,
      totalFriends: friends.length,
      pendingRequests: requests.filter(r => r.isReceived).length,
      sentRequests: requests.filter(r => !r.isReceived).length,
    });
  } catch (e) {
    console.error("[FRIENDS_GET]", e);
    return new NextResponse("Erro interno.", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Não autorizado.", { status: 401 });
    const { requestId, action } = await req.json();
    if (!requestId || !action) return new NextResponse("Dados inválidos.", { status: 400 });

    const request = await db.friendship.findUnique({ 
      where: { id: requestId },
      include: { profile: true, friend: true }
    });
    
    if (!request) return new NextResponse("Solicitação não encontrada.", { status: 404 });
    if (request.profileId !== profile.id && request.friendId !== profile.id) return new NextResponse("Não autorizado.", { status: 401 });

    if (action === "accept") {
      const updated = await db.friendship.update({ 
        where: { id: requestId }, 
        data: { status: "ACCEPTED" },
        include: { profile: true, friend: true }
      });
      return NextResponse.json(updated);
    }
    if (action === "decline") {
      const updated = await db.friendship.update({ 
        where: { id: requestId }, 
        data: { status: "DECLINED" },
        include: { profile: true, friend: true }
      });
      return NextResponse.json(updated);
    }

    return new NextResponse("Ação inválida.", { status: 400 });
  } catch (e) {
    console.error("[FRIENDS_POST]", e);
    return new NextResponse("Erro interno.", { status: 500 });
  }
}  
