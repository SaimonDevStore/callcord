import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    const { bio } = await req.json();

    if (!user) {
      return new NextResponse("Não autorizado.", { status: 401 });
    }

    // Atualizar a bio do perfil
    const profile = await db.profile.update({
      where: {
        userId: user.id,
      },
      data: {
        bio: bio,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_BIO_UPDATE]", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
