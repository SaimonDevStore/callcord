import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    const { toProfileId, serverId } = await req.json();
    const me = await db.profile.findUnique({ where: { userId: user.id } });
    if (!me) return new NextResponse("Profile not found", { status: 404 });

    // Emit socket event to invite user to a private call (DM video)
    // This API does not connect sockets directly; the client UI listens via NotificationsDock
    // We piggyback on revalidate tag endpoint via a global socket if present
    // No direct socket access here, client will poll or another route can emit
    return NextResponse.json({ ok: true });
  } catch (e) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}


