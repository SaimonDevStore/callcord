import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { validateImageUsage } from "@/lib/utils";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Não autorizado.", { status: 401 });

    const currentProfile = await db.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!currentProfile) {
      return new NextResponse("Perfil não encontrado.", { status: 404 });
    }

    // Serializar perfil para evitar erro de objetos complexos
    const serializedProfile = {
      id: currentProfile.id,
      userId: currentProfile.userId,
      name: currentProfile.name,
      imageUrl: currentProfile.imageUrl,
      bannerUrl: currentProfile.bannerUrl,
      email: currentProfile.email,
      bio: currentProfile.bio,
      isNitro: currentProfile.isNitro,
      nitroExpiresAt: currentProfile.nitroExpiresAt?.toISOString() || null,
      customNickname: currentProfile.customNickname,
      nitroPlan: currentProfile.nitroPlan,
      createdAt: currentProfile.createdAt.toISOString(),
      updatedAt: currentProfile.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedProfile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Não autorizado.", { status: 401 });

    const { name, imageUrl, bannerUrl } = await req.json();

    if (!name) return new NextResponse("Nome é obrigatório.", { status: 400 });

    const currentProfile = await db.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!currentProfile) {
      return new NextResponse("Perfil não encontrado.", { status: 404 });
    }

    // Validar uso de imagens baseado no plano Nitro
    const validation = validateImageUsage(bannerUrl, currentProfile.isNitro, currentProfile.email);

    if (!validation.isValid) {
      return new NextResponse(validation.error || "Validação falhou", { status: 400 });
    }

    const updatedProfile = await db.profile.update({
      where: {
        userId: user.id,
      },
      data: {
        name,
        imageUrl,
        bannerUrl,
      },
    });

    // Serializar perfil atualizado para evitar erro de objetos complexos
    const serializedUpdatedProfile = {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      name: updatedProfile.name,
      imageUrl: updatedProfile.imageUrl,
      bannerUrl: updatedProfile.bannerUrl,
      email: updatedProfile.email,
      bio: updatedProfile.bio,
      isNitro: updatedProfile.isNitro,
      nitroExpiresAt: updatedProfile.nitroExpiresAt?.toISOString() || null,
      customNickname: updatedProfile.customNickname,
      nitroPlan: updatedProfile.nitroPlan,
      createdAt: updatedProfile.createdAt.toISOString(),
      updatedAt: updatedProfile.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedUpdatedProfile);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}  
