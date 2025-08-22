import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const { serverId } = await params;

    const member = await db.member.findFirst({ where: { serverId: serverId, profileId: profile.id } });
    if (!member) return new NextResponse("Not found.", { status: 404 });

    try {
      await db.member.update({ where: { id: member.id }, data: { acceptedRulesAt: new Date() } });
    } catch {
      await db.$executeRawUnsafe('ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "acceptedRulesAt" timestamp');
      await db.$executeRaw`UPDATE "Member" SET "acceptedRulesAt" = now() WHERE id = ${member.id}`;
    }
    return NextResponse.redirect(new URL(`/servers/${serverId}`, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (e) {
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}


