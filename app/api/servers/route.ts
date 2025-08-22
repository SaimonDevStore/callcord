import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuid } from "uuid";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, imageUrl } = await req.json();

    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuid(),
        channels: {
          create: [{ name: "general", profileId: profile.id }],
        },
        members: {
          create: [{ profileId: profile.id, role: MemberRole.OWNER }],
        },
      },
    });

    return NextResponse.json(server);
  } catch (error: unknown) {
    console.error("[SERVERS_POST]: ", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}

// Verify server: called after successful payment or free bypass for Saimon on official server
export async function PATCH(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const { serverId, officialOnlyBypass } = await req.json();

    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const server = await db.server.findFirst({ where: { id: serverId } });
    if (!server) return new NextResponse("Not found.", { status: 404 });

    const isSaimon = (profile.email || "").toLowerCase() === "saimonscheibler1999@gmail.com";
    if (isSaimon) {
      // Dono Saimon pode verificar qualquer servidor (inclui oficial/gratuito)
      const updated = await db.server.update({ where: { id: server.id }, data: { isVerified: true } });
      return NextResponse.json(updated);
    }

    // Demais usuários: somente o dono do servidor pode ativar (ex.: após pagamento)
    if (server.profileId !== profile.id) return new NextResponse("Forbidden.", { status: 403 });

    const updated = await db.server.update({ where: { id: server.id }, data: { isVerified: true } });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[SERVERS_PATCH_VERIFY]: ", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}
