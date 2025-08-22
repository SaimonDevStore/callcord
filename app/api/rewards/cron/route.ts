import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Endpoint idempotente para consolidar tempo e validar dias (pode ser chamado 1x/dia por CRON externo)
export async function POST() {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate()+1);

    // Considerar apenas sessões do canal de voz "Call"
    const callChannel = await db.channel.findFirst({ where: { name: "Call", type: "AUDIO" } });
    const callRoomId = callChannel?.id || null;

    const profiles = await db.profile.findMany({ select: { id: true } });

    for (const p of profiles) {
      const sessions = await db.rewardSession.findMany({ where: { profileId: p.id, ...(callRoomId ? { roomId: callRoomId } : {}) } });
      let secondsToday = 0;
      const overlap = (s: Date, e: Date | null) => {
        const sMs = s.getTime();
        const eMs = (e?.getTime() ?? Date.now());
        const a = Math.max(sMs, today.getTime());
        const b = Math.min(eMs, tomorrow.getTime());
        return Math.max(0, Math.floor((b - a)/1000));
      };
      for (const s of sessions) secondsToday += overlap(s.startedAt as any, s.endedAt as any);

      const FIVE_HOURS = 5 * 3600;
      const isValid = secondsToday >= FIVE_HOURS;

      // upsert RewardDay - primeiro verificar se já existe
      let day = await db.rewardDay.findFirst({
        where: { 
          profileId: p.id, 
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      if (day) {
        // Atualizar dia existente
        day = await db.rewardDay.update({
          where: { id: day.id },
          data: { seconds: secondsToday, isValid }
        });
      } else {
        // Criar novo dia
        day = await db.rewardDay.create({
          data: { 
            profileId: p.id, 
            date: today, 
            seconds: secondsToday, 
            isValid 
          }
        });
      }

      // Update progress
      let progress = await db.rewardProgress.findUnique({ where: { profileId: p.id } });
      if (!progress) progress = await db.rewardProgress.create({ data: { profileId: p.id } });

      // Regras: dias não precisam ser consecutivos; contador reinicia se ficar 5 dias sem completar 5h
      // Simplificação: se nos últimos 5 dias não houve dia válido, zera validDays acumulados do período (mantemos totalEarnedCents)
      const last5 = await db.rewardDay.findMany({ where: { profileId: p.id, date: { gte: new Date(today.getTime() - 4*86400000) } }, orderBy: { date: 'desc' } });
      const hasAnyValid = last5.some(d => d.isValid);
      let newValidDays = progress.validDays;
      if (!hasAnyValid) newValidDays = 0;
      if (isValid) newValidDays += 1;

      // calcular recompensas liberadas
      const tiers = [ { d:5, c:100 }, { d:15, c:500 }, { d:30, c:1500 }, { d:60, c:4000 }, { d:100, c:10000 } ];
      let addCents = 0;
      for (const t of tiers) if (progress.validDays < t.d && newValidDays >= t.d) addCents += t.c;

      await db.rewardProgress.update({ where: { profileId: p.id }, data: {
        validDays: newValidDays,
        availableCents: progress.availableCents + addCents,
        totalEarnedCents: progress.totalEarnedCents + addCents,
        lastQualifiedDate: isValid ? today : progress.lastQualifiedDate,
      }});
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[REWARDS_CRON]', e);
    return new NextResponse('Erro interno.', { status: 500 });
  }
}


