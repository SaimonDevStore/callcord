import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    if (!channelId) return new NextResponse("Missing channelId.", { status: 400 });

    try {
      const items = await db.message.findMany({
        where: { channelId, pinned: true, deleted: false },
        include: { member: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ items });
    } catch (e) {
      await db.$executeRawUnsafe('ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false');
      const items = await db.$queryRaw`SELECT * FROM "Message" WHERE "channelId" = ${channelId} AND pinned = true AND deleted = false ORDER BY "createdAt" DESC`;
      return NextResponse.json({ items });
    }
  } catch (error: unknown) {
    console.error("[MESSAGES_PINNED_GET]", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}  
