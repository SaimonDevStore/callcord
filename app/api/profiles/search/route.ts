import { NextResponse, type NextRequest } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log(`[PROFILES_SEARCH] Iniciando busca...`);

    const profile = await currentProfile();
    console.log(`[PROFILES_SEARCH] Profile obtido:`, profile ? { id: profile.id, email: profile.email } : 'null');

    if (!profile) {
      console.log(`[PROFILES_SEARCH] Usuário não autenticado`);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    console.log(`[PROFILES_SEARCH] Parâmetro de busca: "${search}"`);

    if (!search) {
      console.log(`[PROFILES_SEARCH] Termo de busca ausente`);
      return new NextResponse("Search term missing", { status: 400 });
    }

    console.log(`[PROFILES_SEARCH] Iniciando consulta ao banco...`);

    // Busca mais flexível - primeiro tenta busca exata, depois parcial
    let profiles = await db.profile.findMany({
      where: {
        OR: [
          {
            name: {
              equals: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              equals: search,
              mode: "insensitive",
            },
          },
        ],
        NOT: {
          id: profile.id, // Excluir o próprio usuário
        },
      },
      include: {
        // Incluir informações de amizade para mostrar status
        friendships: {
          where: {
            OR: [
              { profileId: profile.id },
              { friendId: profile.id },
            ],
          },
        },
        friendsOf: {
          where: {
            OR: [
              { profileId: profile.id },
              { friendId: profile.id },
            ],
          },
        },
      },
      take: 10,
    });

    console.log(`[PROFILES_SEARCH] Busca exata retornou ${profiles.length} resultados`);

    // Se não encontrou busca exata, tenta busca parcial
    if (profiles.length === 0) {
      console.log(`[PROFILES_SEARCH] Busca exata não encontrou resultados, tentando busca parcial...`);

      try {
        profiles = await db.profile.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
            NOT: {
              id: profile.id, // Excluir o próprio usuário
            },
          },
          include: {
            // Incluir informações de amizade para mostrar status
            friendships: {
              where: {
                OR: [
                  { profileId: profile.id },
                  { friendId: profile.id },
                ],
              },
            },
            friendsOf: {
              where: {
                OR: [
                  { profileId: profile.id },
                  { friendId: profile.id },
                ],
              },
            },
          },
          take: 10,
        });
        console.log(`[PROFILES_SEARCH] Busca parcial retornou ${profiles.length} resultados`);
      } catch (dbError) {
        console.error(`[PROFILES_SEARCH] Erro na busca parcial:`, dbError);
        throw dbError;
      }
    }

    console.log(`[PROFILES_SEARCH] Resultados encontrados: ${profiles.length}`);
    if (profiles.length > 0) {
      console.log(`[PROFILES_SEARCH] Primeiro resultado: ${profiles[0].name} (${profiles[0].email})`);
    }

    console.log(`[PROFILES_SEARCH] Processando resultados...`);

    // Processar resultados para incluir status de amizade
    const processedProfiles = profiles.map(profile => {
      try {
        const allFriendships = [...profile.friendships, ...profile.friendsOf];
        let friendshipStatus = null;

        if (allFriendships.length > 0) {
          const friendship = allFriendships[0];
          friendshipStatus = {
            id: friendship.id,
            status: friendship.status,
            isReceived: friendship.friendId === profile.id,
          };
        }

        return {
          id: profile.id,
          name: profile.name,
          imageUrl: profile.imageUrl,
          email: profile.email,
          isNitro: profile.isNitro,
          nitroPlan: profile.nitroPlan,
          friendshipStatus,
        };
      } catch (processError) {
        console.error(`[PROFILES_SEARCH] Erro ao processar perfil ${profile.id}:`, processError);
        // Retornar perfil básico se houver erro no processamento
        return {
          id: profile.id,
          name: profile.name,
          imageUrl: profile.imageUrl,
          email: profile.email,
          isNitro: profile.isNitro,
          nitroPlan: profile.nitroPlan,
          friendshipStatus: null,
        };
      }
    });

    console.log(`[PROFILES_SEARCH] Processamento concluído. Retornando ${processedProfiles.length} perfis`);

    return NextResponse.json(processedProfiles);
  } catch (error) {
    console.error("[PROFILES_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
