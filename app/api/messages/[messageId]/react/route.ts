import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });
    const { emoji } = await req.json();
    if (!emoji) return new NextResponse("Emoji missing.", { status: 400 });

    const { messageId } = await params;

    try {
      const reaction = await db.reaction.upsert({
        where: {
          messageId_profileId_emoji: {
            messageId: messageId,
            profileId: profile.id,
            emoji,
          },
        },
        create: { messageId: messageId, profileId: profile.id, emoji },
        update: {},
      });
      return NextResponse.json(reaction);
    } catch (e) {
      // Fallback: create tables/constraints if missing
      await db.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS "Reaction" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "emoji" text NOT NULL, "messageId" uuid NOT NULL, "profileId" uuid NOT NULL, "createdAt" timestamp DEFAULT now())');
      await db.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS reaction_unique ON "Reaction" ("messageId", "profileId", "emoji")');
      await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS reaction_msg_idx ON "Reaction" ("messageId")');
      await db.$executeRaw`INSERT INTO "Reaction" ("emoji", "messageId", "profileId") VALUES (${emoji}, ${messageId}, ${profile.id}) ON CONFLICT DO NOTHING`;
      const reaction = await db.$queryRaw`SELECT * FROM "Reaction" WHERE "messageId" = ${messageId} AND "profileId" = ${profile.id} AND "emoji" = ${emoji} LIMIT 1`;
      return NextResponse.json((reaction as any)?.[0] ?? {});
    }
  } catch (error: unknown) {
    console.error("[MESSAGE_REACT_POST]", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });
    const { searchParams } = new URL(req.url);
    const emoji = searchParams.get("emoji");
    if (!emoji) return new NextResponse("Emoji missing.", { status: 400 });

    const { messageId } = await params;

    try {
      await db.reaction.delete({
        where: {
          messageId_profileId_emoji: {
            messageId: messageId,
            profileId: profile.id,
            emoji,
          },
        },
      });
      return NextResponse.json({ ok: true });
    } catch (e) {
      await db.$executeRaw`DELETE FROM "Reaction" WHERE "messageId" = ${messageId} AND "profileId" = ${profile.id} AND "emoji" = ${emoji}`;
      return NextResponse.json({ ok: true });
    }
  } catch (error: unknown) {
    console.error("[MESSAGE_REACT_DELETE]", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}


