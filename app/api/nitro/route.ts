import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const { action, targetUserId, targetProfileId, days, customNickname, plan } = await req.json();

    if (!user) {
      return new NextResponse("Não autorizado.", { status: 401 });
    }

    // Verificar se o usuário é o dono do site (Saimon)
    const isOwner = user.emailAddresses[0]?.emailAddress === "saimonscheibler1999@gmail.com";
    if (!isOwner) {
      return new NextResponse("Apenas o dono pode gerenciar Nitro.", { status: 403 });
    }

    if (action === "grant") {
      if ((!targetUserId && !targetProfileId) || !days) {
        return new NextResponse("Dados incompletos. Necessário targetUserId ou targetProfileId e days.", { status: 400 });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      // Determinar o where clause baseado no que foi fornecido
      const whereClause = targetProfileId 
        ? { id: targetProfileId } 
        : { userId: targetUserId };

      try {
        const profile = await db.profile.update({
          where: whereClause,
          data: {
            isNitro: true,
            nitroExpiresAt: expiresAt,
            customNickname: customNickname || null,
            nitroPlan: plan || 'FLUX',
          },
        });
        return NextResponse.json(profile);
      } catch (e) {
        console.error("[NITRO_API] Erro na atualização com nitroPlan:", e);
        // Fallback quando a coluna nitroPlan ainda não existe (migração pendente)
        const profile = await db.profile.update({
          where: whereClause,
          data: {
            isNitro: true,
            nitroExpiresAt: expiresAt,
            customNickname: customNickname || null,
          },
        });
        return NextResponse.json(profile);
      }
    }

    if (action === "revoke") {
      if (!targetUserId && !targetProfileId) {
        return new NextResponse("ID do usuário ou perfil necessário.", { status: 400 });
      }

      // Determinar o where clause baseado no que foi fornecido
      const whereClause = targetProfileId 
        ? { id: targetProfileId } 
        : { userId: targetUserId };

      try {
        const profile = await db.profile.update({
          where: whereClause,
          data: {
            isNitro: false,
            nitroExpiresAt: null,
            customNickname: null,
            nitroPlan: null,
          },
        });
        return NextResponse.json(profile);
      } catch (e) {
        console.error("[NITRO_API] Erro na revogação com nitroPlan:", e);
        const profile = await db.profile.update({
          where: whereClause,
          data: {
            isNitro: false,
            nitroExpiresAt: null,
            customNickname: null,
          },
        });
        return NextResponse.json(profile);
      }
    }

    return new NextResponse("Ação inválida.", { status: 400 });
  } catch (error) {
    console.error("[NITRO_API]", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Não autorizado.", { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!profile) {
      return new NextResponse("Perfil não encontrado.", { status: 404 });
    }

    // Verificar se o Nitro expirou
    if (profile.isNitro && profile.nitroExpiresAt && profile.nitroExpiresAt < new Date()) {
      await db.profile.update({
        where: {
          userId: user.id,
        },
        data: {
          isNitro: false,
          nitroExpiresAt: null,
          customNickname: null,
        },
      });

      return NextResponse.json({
        isNitro: false,
        nitroExpiresAt: null,
        customNickname: null,
      });
    }

    return NextResponse.json({
      isNitro: profile.isNitro,
      nitroExpiresAt: profile.nitroExpiresAt,
      customNickname: profile.customNickname,
      nitroPlan: (profile as any).nitroPlan ?? null,
    });
  } catch (error) {
    console.error("[NITRO_API]", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
