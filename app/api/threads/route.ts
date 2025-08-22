import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const { channelId, rootMessageId } = await req.json();
    if (!channelId || !rootMessageId) return new NextResponse("Missing fields.", { status: 400 });

    try {
      const thread = await db.thread.create({ data: { channelId, rootMessageId } });
      await db.message.update({ where: { id: rootMessageId }, data: { threadId: thread.id } });
      return NextResponse.json(thread);
    } catch (e) {
      // Fallback: create tables
      await db.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS "Thread" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "channelId" uuid NOT NULL, "rootMessageId" uuid NOT NULL, "createdAt" timestamp DEFAULT now(), "updatedAt" timestamp DEFAULT now())');
      await db.$executeRawUnsafe('ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "threadId" uuid');
      await db.$executeRaw`INSERT INTO "Thread" ("channelId", "rootMessageId") VALUES (${channelId}, ${rootMessageId})`;
      const created = await db.$queryRaw`SELECT * FROM "Thread" WHERE "rootMessageId" = ${rootMessageId} ORDER BY "createdAt" DESC LIMIT 1`;
      const threadId = (created as any)?.[0]?.id as string;
      if (threadId) await db.$executeRaw`UPDATE "Message" SET "threadId" = ${threadId} WHERE id = ${rootMessageId}`;
      return NextResponse.json((created as any)?.[0] ?? {});
    }
  } catch (error: unknown) {
    console.error("[THREADS_POST]", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}  
