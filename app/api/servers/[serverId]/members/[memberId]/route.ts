import { MemberRole } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string; memberId: string }> }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Não autorizado.", { status: 401 });
    }

    const { serverId, memberId } = await params;

    if (!serverId) {
      return new NextResponse("ID do servidor está ausente.", { status: 400 });
    }

    if (!memberId) {
      return new NextResponse("ID do membro está ausente.", { status: 400 });
    }

    // Verificar se o usuário atual é o dono do servidor
    const server = await db.server.findUnique({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });

    if (!server) {
      return new NextResponse("Apenas o dono do servidor pode expulsar membros.", { status: 403 });
    }

    // Verificar se o membro existe
    const member = await db.member.findUnique({
      where: {
        id: memberId,
        serverId: serverId,
      },
    });

    if (!member) {
      return new NextResponse("Membro não encontrado.", { status: 404 });
    }

    // Não permitir expulsar o dono do servidor
    if (member.profileId === profile.id) {
      return new NextResponse("Você não pode expulsar a si mesmo.", { status: 400 });
    }

    // Expulsar o membro
    await db.member.delete({
      where: {
        id: memberId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MEMBER_DELETE]", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
