import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse, type NextRequest } from "next/server";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const { serverId } = await params;

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: { some: { profileId: profile.id } },
      },
    });

    if (!server) return new NextResponse("Not found.", { status: 404 });
    return NextResponse.json(server);
  } catch (error: unknown) {
    console.error("[SERVER_ID_GET]: ", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const profile = await currentProfile();
    const { name, imageUrl, bannerUrl, rulesText, requireRules } = await req.json();

    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const { serverId } = await params;

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
        // campos opcionais (tolerar antes da migração)
        bannerUrl,
        rulesText,
        requireRules,
      },
    });

    return NextResponse.json(server);
  } catch (error: unknown) {
    console.error("[SERVER_ID_PATCH]: ", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const { serverId } = await params;

    const server = await db.server.delete({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });

    return NextResponse.json(server);
  } catch (error: unknown) {
    console.error("[SERVER_ID_DELETE]: ", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}
