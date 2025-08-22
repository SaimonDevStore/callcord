import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const { threadId } = await params;

    try {
      const items = await db.message.findMany({
        where: { threadId: threadId, deleted: false },
        include: { member: { include: { profile: true } }, reactions: true },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ items });
    } catch (e) {
      const items = await db.$queryRaw`SELECT * FROM "Message" WHERE "threadId" = ${threadId} AND deleted = false ORDER BY "createdAt" ASC`;
      return NextResponse.json({ items });
    }
  } catch (error: unknown) {
    console.error("[THREAD_MESSAGES_GET]", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });
    const { content, fileUrl, memberId } = await req.json();
    if (!content && !fileUrl) return new NextResponse("Content missing.", { status: 400 });

    const { threadId } = await params;

    try {
      const message = await db.message.create({
        data: {
          content: content || "",
          fileUrl,
          memberId,
          channelId: (await db.thread.findFirst({ where: { id: threadId } }))!.channelId,
          threadId: threadId,
        },
        include: { member: { include: { profile: true } }, reactions: true },
      });
      return NextResponse.json(message);
    } catch (e) {
      const thread = (await db.$queryRaw`SELECT * FROM "Thread" WHERE id = ${threadId} LIMIT 1`) as any[];
      const channelId = thread?.[0]?.channelId as string;
      await db.$executeRaw`INSERT INTO "Message" (id, content, "fileUrl", "memberId", "channelId", "threadId", "deleted", "createdAt", "updatedAt") VALUES (gen_random_uuid(), ${content || ""}, ${fileUrl}, ${memberId}, ${channelId}, ${threadId}, false, now(), now())`;
      const created = await db.$queryRaw`SELECT * FROM "Message" WHERE "threadId" = ${threadId} ORDER BY "createdAt" DESC LIMIT 1`;
      return NextResponse.json((created as any)?.[0] ?? {});
    }
  } catch (error: unknown) {
    console.error("[THREAD_MESSAGES_POST]", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}


