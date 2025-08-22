import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized.", { status: 401 });

    const { serverId } = await params;

    const server = await db.server.findFirst({ where: { id: serverId } });
    if (!server) return new NextResponse("Not found.", { status: 404 });

    const isSaimon = (profile.email || "").toLowerCase() === "saimonscheibler1999@gmail.com";
    if (!isSaimon && server.profileId !== profile.id)
      return new NextResponse("Forbidden.", { status: 403 });

    try {
      const updated = await db.server.update({ where: { id: server.id }, data: { isVerified: true } });
      return NextResponse.json(updated);
    } catch (e: unknown) {
      // Fallback automático: cria a coluna e atualiza via SQL bruto se o client/schema não estiver migrado
      try {
        await db.$executeRawUnsafe('ALTER TABLE "Server" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false');
        await db.$executeRaw`UPDATE "Server" SET "isVerified" = true WHERE id = ${server.id}`;
        const updated = await db.server.findFirst({ where: { id: server.id } });
        return NextResponse.json(updated);
      } catch (e2: unknown) {
        console.error('[SERVER_VERIFY_FALLBACK]', e2);
        throw e2;
      }
    }
  } catch (error: unknown) {
    console.error("[SERVER_VERIFY_PATCH]", error);
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}


