import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { serializeMessage } from "@/lib/serialize";
import type { Message, Member, Profile, Reaction } from "@prisma/client";

type MessageWithMember = Message & {
  member: Member & {
    profile: Profile;
  };
  reactions: Reaction[];
};

const MESSAGES_BATCH = 10;

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!profile) return new NextResponse("Não autorizado.", { status: 401 });
    if (!channelId)
      return new NextResponse("ID do canal está ausente.", { status: 401 });

    let messages: MessageWithMember[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
          deleted: false,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
          reactions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: {
          channelId,
          deleted: false,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
          reactions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH)
      nextCursor = messages[MESSAGES_BATCH - 1].id;

    // Serializar mensagens usando função utilitária
    const serializedMessages = messages.map(serializeMessage);

    return NextResponse.json({
      items: serializedMessages,
      nextCursor,
    });
  } catch (error: unknown) {
    console.error("[MESSAGES_GET]: ", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
