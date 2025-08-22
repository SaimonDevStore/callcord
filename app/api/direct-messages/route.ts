import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { serializeMessage } from "@/lib/serialize";
import type { DirectMessage, Member, Profile } from "@prisma/client";

type DirectMessageWithMember = DirectMessage & {
  member: Member & {
    profile: Profile;
  };
};

const MESSAGES_BATCH = 10;

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) return new NextResponse("Não autorizado.", { status: 401 });
    if (!conversationId)
      return new NextResponse("ID da conversa está ausente.", { status: 401 });

    let messages: DirectMessageWithMember[] = [];

    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId,
          deleted: false,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId,
          deleted: false,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH)
      nextCursor = messages[MESSAGES_BATCH - 1].id;

    // Serializar mensagens diretas para evitar erro de objetos complexos
    // Serializar mensagens usando função utilitária
    const serializedMessages = messages.map(serializeMessage);

    return NextResponse.json({
      items: serializedMessages,
      nextCursor,
    });
  } catch (error: unknown) {
    console.error("[DIRECT_MESSAGES_GET]: ", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
