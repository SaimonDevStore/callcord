import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const { friendId } = await req.json();

    if (!profile) {
      return new NextResponse("Não autorizado.", { status: 401 });
    }

    if (!friendId) {
      return new NextResponse("ID do amigo é obrigatório.", { status: 400 });
    }

    // Verificar se já existe uma amizade
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { profileId: profile.id, friendId },
          { profileId: friendId, friendId: profile.id },
        ],
      },
    });

    if (existingFriendship) {
      return new NextResponse("Amizade já existe ou está pendente.", { status: 400 });
    }

    // Verificar se não está tentando adicionar a si mesmo
    if (profile.id === friendId) {
      return new NextResponse("Não é possível adicionar a si mesmo.", { status: 400 });
    }

    // Criar solicitação de amizade
    const friendship = await db.friendship.create({
      data: {
        profileId: profile.id,
        friendId,
        status: "PENDING",
        requestedById: profile.id, // Campo obrigatório
      },
      include: {
        profile: true,
        friend: true,
      },
    });

    // Serializar amizade para evitar erro de objetos complexos
    const serializedFriendship = {
      id: friendship.id,
      profileId: friendship.profileId,
      friendId: friendship.friendId,
      status: friendship.status,
      requestedById: friendship.requestedById,
      createdAt: friendship.createdAt.toISOString(),
      updatedAt: friendship.updatedAt.toISOString(),
      profile: {
        id: friendship.profile.id,
        userId: friendship.profile.userId,
        name: friendship.profile.name,
        imageUrl: friendship.profile.imageUrl,
        bannerUrl: friendship.profile.bannerUrl,
        email: friendship.profile.email,
        bio: friendship.profile.bio,
        isNitro: friendship.profile.isNitro,
        nitroExpiresAt: friendship.profile.nitroExpiresAt?.toISOString() || null,
        customNickname: friendship.profile.customNickname,
        nitroPlan: friendship.profile.nitroPlan,
        createdAt: friendship.profile.createdAt.toISOString(),
        updatedAt: friendship.profile.updatedAt.toISOString(),
      },
      friend: {
        id: friendship.friend.id,
        userId: friendship.friend.userId,
        name: friendship.friend.name,
        imageUrl: friendship.friend.imageUrl,
        bannerUrl: friendship.friend.bannerUrl,
        email: friendship.friend.email,
        bio: friendship.friend.bio,
        isNitro: friendship.friend.isNitro,
        nitroExpiresAt: friendship.friend.nitroExpiresAt?.toISOString() || null,
        customNickname: friendship.friend.customNickname,
        nitroPlan: friendship.friend.nitroPlan,
        createdAt: friendship.friend.createdAt.toISOString(),
        updatedAt: friendship.friend.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(serializedFriendship);
  } catch (error) {
    console.error("[FRIENDS_ADD_POST]", error);
    return new NextResponse("Erro interno.", { status: 500 });
  }
}
