import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });
    const { pinned } = await req.json();

    const { messageId } = await params;

    try {
      const updated = await db.message.update({ where: { id: messageId }, data: { pinned: Boolean(pinned) } });
      return NextResponse.json(updated);
    } catch (e) {
      // Fallback: ensure column exists
      await db.$executeRawUnsafe('ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false');
      await db.$executeRaw`UPDATE "Message" SET "pinned" = ${Boolean(pinned)} WHERE id = ${messageId}`;
      const msg = await db.message.findFirst({ where: { id: messageId } });
      return NextResponse.json(msg);
    }
  } catch (error: unknown) {
    console.error("[MESSAGE_PIN_PATCH]", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}


