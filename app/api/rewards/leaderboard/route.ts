import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Contabilizar apenas a sala de call principal (mesma regra do progresso)
    const callChannel = await db.channel.findFirst({ where: { name: "Call", type: "AUDIO" } });
    if (!callChannel) {
      return NextResponse.json({ items: [] });
    }

    // Buscar TODAS as sessões (fechadas e abertas) dessa sala
    const sessions = await db.rewardSession.findMany({
      where: { roomId: callChannel.id },
      select: { profileId: true, startedAt: true, endedAt: true },
    });

    const map = new Map<string, number>();
    for (const s of sessions) {
      const startedAt = new Date(s.startedAt as Date);
      const endedAt = s.endedAt ? new Date(s.endedAt as Date) : new Date(); // incluir sessão ativa até agora
      const sec = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000));
      map.set(s.profileId, (map.get(s.profileId) || 0) + sec);
    }

    // Buscar ganhos atuais na tabela rewardProgress
    const progresses = await db.rewardProgress.findMany({ select: { profileId: true, availableCents: true } });
    const centsByProfile = new Map(progresses.map(p => [p.profileId, p.availableCents] as const));

    // Buscar nomes
    const profiles = await db.profile.findMany({ select: { id: true, name: true } });
    const nameById = new Map(profiles.map(p => [p.id, p.name || "Usuário"] as const));

    const rows = Array.from(map.entries())
      .map(([profileId, seconds]) => ({
        profileId,
        seconds,
        amountCents: centsByProfile.get(profileId) || 0,
        name: nameById.get(profileId) || "Usuário",
      }))
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 10)
      .map((r, idx) => ({ rank: idx + 1, name: r.name, seconds: r.seconds, amountCents: r.amountCents }));

    return NextResponse.json({ items: rows });
  } catch (e) {
    return new NextResponse("Erro interno.", { status: 500 });
  }
}


