import { AccessToken } from "livekit-server-sdk";
import { type NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");
  const avatar = req.nextUrl.searchParams.get("avatar");
  if (!room) {
    return NextResponse.json(
      { error: 'Parâmetro "room" ausente' },
      { status: 400 },
    );
  } else if (!username) {
    return NextResponse.json(
      { error: 'Parâmetro "username" ausente' },
      { status: 400 },
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Servidor mal configurado" },
      { status: 500 },
    );
  }

  // Padronizar identidade do LiveKit para profile.id (estável) e enviar avatar via metadata
  let identity = username || "guest";
  let displayName = username || "Usuário";
  let userId = "";
  
  try {
    const user = await currentUser();
    if (user) {
      userId = user.id;
      const profile = await db.profile.findUnique({ where: { userId: user.id } });
      if (profile) {
        identity = profile.id;
        displayName = profile.name || displayName;
      }
    }
  } catch (error) {
    console.error("[LIVEKIT] Error getting user:", error);
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: displayName,
    metadata: JSON.stringify({ 
      avatarUrl: avatar || "", 
      profileId: identity, 
      displayName,
      userId: userId
    }),
  });

  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  return NextResponse.json({ token: await at.toJwt() });
}
