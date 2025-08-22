import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Não autorizado.", { status: 401 });
    const isOwner = user.emailAddresses[0]?.emailAddress === "saimonscheibler1999@gmail.com";
    if (!isOwner) return new NextResponse("Apenas o dono.", { status: 403 });

    const requests = await db.rewardPayoutRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { profile: true },
    });

    const profileIds = requests.map((r) => r.profileId);
    const progresses = await db.rewardProgress.findMany({ where: { profileId: { in: profileIds } } });
    const progressMap = new Map(progresses.map((p) => [p.profileId, p]));

    const payload = requests.map((r) => ({
      id: r.id,
      profileId: r.profileId,
      nick: (r.profile as any)?.customNickname || r.profile.name,
      email: r.profile.email,
      pixKey: r.pixKey,
      requestedCents: r.amountCents,
      availableCents: progressMap.get(r.profileId)?.availableCents ?? 0,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(payload);
  } catch (e) {
    console.error("[PAYOUT_REQUESTS_GET]", e);
    return new NextResponse("Erro interno.", { status: 500 });
  }
}


