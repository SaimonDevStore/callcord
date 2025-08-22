import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { moderationStore } from "@/lib/moderation-store";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      memberId: string;
    }>;
  },
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { role, customRole, roleColor, action } = await req.json();
    const serverId = searchParams.get("serverId");

    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });
    if (!serverId)
      return new NextResponse("Server ID is missing.", { status: 400 });
    
    const { memberId } = await params;
    
    if (!memberId)
      return new NextResponse("Member ID is missing.", { status: 400 });

    // Verificar se o usuário é dono do servidor
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      include: {
        members: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!server) {
      return new NextResponse("Server not found or unauthorized.", { status: 404 });
    }

    // Ações rápidas de moderação
    if (action === "mute:1m") {
      // Somente dono
      if (server.profileId !== profile.id) return new NextResponse("Unauthorized.", { status: 401 });
      const target = server.members.find((m) => m.id === memberId);
      if (target) moderationStore.mute(serverId, target.profileId, 60_000);
      return NextResponse.json({ success: true });
    }
    if (action === "ban") {
      if (server.profileId !== profile.id) return new NextResponse("Unauthorized.", { status: 401 });
      const target = server.members.find((m) => m.id === memberId);
      if (target) moderationStore.ban(serverId, target.profileId);
      return NextResponse.json({ success: true });
    }
    if (action === "unmute") {
      if (server.profileId !== profile.id) return new NextResponse("Unauthorized.", { status: 401 });
      const target = server.members.find((m) => m.id === memberId);
      if (target) moderationStore.unmute(serverId, target.profileId);
      return NextResponse.json({ success: true });
    }
    if (action === "unban") {
      if (server.profileId !== profile.id) return new NextResponse("Unauthorized.", { status: 401 });
      const target = server.members.find((m) => m.id === memberId);
      if (target) moderationStore.unban(serverId, target.profileId);
      return NextResponse.json({ success: true });
    }

    // Atualizar o membro
    const updatedMember = await db.member.update({
      where: {
        id: memberId,
        serverId: serverId,
      },
      data: {
        role,
        customRole,
        roleColor,
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error: unknown) {
    console.error("[MEMBERS_ID_PATCH]: ", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });
    if (!serverId)
      return new NextResponse("Server ID is missing.", { status: 400 });
    
    const { memberId } = await params;
    
    if (!memberId)
      return new NextResponse("Member ID is missing.", { status: 400 });

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: { profile: true },
          orderBy: { role: "asc" },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error: unknown) {
    console.error("[MEMBER_ID_DELETE]: ", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}
