import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) return new NextResponse("Não autorizado.", { status: 401 });
    if (!serverId)
      return new NextResponse("ID do servidor está ausente.", { status: 400 });
    if (name === "general")
      return new NextResponse('Nome não pode ser "general".', { status: 400 });

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error: unknown) {
    console.error("[CHANNELS_POST]: ", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
