import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Não autorizado.", { status: 401 });

    const { serverId } = await params;

    const server = await db.server.findUnique({
      where: { id: serverId },
      include: {
        members: {
          include: { profile: true },
          orderBy: { role: "asc" },
        },
      },
    });

    if (!server) return new NextResponse("Servidor não encontrado.", { status: 404 });

    // Garantir que o usuário é membro do servidor
    const isMember = server.members.some((m) => m.profileId === profile.id);
    if (!isMember) return new NextResponse("Proibido.", { status: 403 });

    // Retornar membros com dados essenciais
    const members = server.members.map((m) => ({
      id: m.id,
      role: m.profileId === server.profileId ? 'OWNER' : m.role,
      profile: {
        id: m.profile.id,
        name: m.profile.name,
        imageUrl: m.profile.imageUrl,
        email: m.profile.email,
        // incluir mais campos usados no modal de perfil
        bannerUrl: (m.profile as any).bannerUrl ?? null,
        bio: (m.profile as any).bio ?? null,
        isNitro: (m.profile as any).isNitro ?? undefined,
        nitroPlan: (m.profile as any).nitroPlan ?? undefined,
      },
    }));

    const viewerRole = server.members.find((m) => m.profileId === profile.id)?.role || null;

    return NextResponse.json({ members, viewerRole, ownerProfileId: server.profileId });
  } catch (error) {
    console.error("[SERVER_MEMBERS]", error);
    return new NextResponse("Erro interno.", { status: 500 });
  }
}


