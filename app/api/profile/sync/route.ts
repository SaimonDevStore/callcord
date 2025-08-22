import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateImageUsage } from "@/lib/utils";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Não autorizado.", { status: 401 });
    }

    // Buscar perfil existente
    const existingProfile = await db.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    // Gerar nome de exibição válido
    let displayName = "Usuário";
    
    const firstName = user.firstName?.trim();
    const lastName = user.lastName?.trim();
    const username = user.username?.trim();
    
    if (firstName && lastName) {
      displayName = `${firstName} ${lastName}`;
    } else if (firstName) {
      displayName = firstName;
    } else if (lastName) {
      displayName = lastName;
    } else if (username) {
      displayName = username;
    } else if (user.emailAddresses && user.emailAddresses[0]) {
      const emailPrefix = user.emailAddresses[0].emailAddress.split('@')[0];
      displayName = emailPrefix || "Usuário";
    }

    // Garantir que o nome não seja "null null" ou similar
    if (displayName.includes("null") || displayName.trim() === "") {
      displayName = "Usuário";
    }

    // Remover prefixo @ para exibir apenas o nick
    displayName = displayName.replace(/^@+/, "");

    let profile;

    const rawImageUrl = user.imageUrl;
    const isGif = typeof rawImageUrl === 'string' && rawImageUrl.toLowerCase().endsWith('.gif');
    const isSaimon = user.emailAddresses && user.emailAddresses[0]?.emailAddress === "saimonscheibler1999@gmail.com";
    const allowGif = isSaimon || !!existingProfile?.isNitro;
    let effectiveImageUrl = rawImageUrl;
    if (isGif && !allowGif) {
      if (existingProfile?.imageUrl && !existingProfile.imageUrl.toLowerCase().endsWith('.gif')) {
        effectiveImageUrl = existingProfile.imageUrl;
      } else {
        effectiveImageUrl = "/iconoficial.png";
      }
    }

    if (existingProfile) {
      // Atualizar perfil existente
      profile = await db.profile.update({
        where: {
          userId: user.id,
        },
        data: {
          name: displayName,
          imageUrl: effectiveImageUrl,
          email: user.emailAddresses[0].emailAddress,
        },
      });
    } else {
      // Criar novo perfil
      profile = await db.profile.create({
        data: {
          userId: user.id,
          name: displayName,
          imageUrl: effectiveImageUrl,
          email: user.emailAddresses[0].emailAddress,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_SYNC]", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Não autorizado.", { status: 401 });

    const { imageUrl, bannerUrl } = await req.json();

    // Buscar perfil atual para validação
    const existingProfile = await db.profile.findUnique({
      where: { userId: user.id }
    });

    if (!existingProfile) {
      return new NextResponse("Perfil não encontrado.", { status: 404 });
    }

    // Validar se as imagens podem ser usadas
    let validatedImageUrl = imageUrl;
    let validatedBannerUrl = bannerUrl;

    if (imageUrl) {
      const validation = validateImageUsage(imageUrl, existingProfile.isNitro, existingProfile.email);
      
      if (!validation.isValid) {
        // Se não pode usar GIF, usar imagem padrão ou manter a atual
        if (existingProfile.imageUrl && !existingProfile.imageUrl.toLowerCase().endsWith('.gif')) {
          validatedImageUrl = existingProfile.imageUrl;
        } else {
          validatedImageUrl = "/iconoficial.png";
        }
        
        console.log(`GIF blocked for user ${user.id} in imageUrl: ${validation.error}`);
      }
    }

    if (bannerUrl) {
      const validation = validateImageUsage(bannerUrl, existingProfile.isNitro, existingProfile.email);
      
      if (!validation.isValid) {
        // Se não pode usar GIF, usar banner padrão ou manter o atual
        if (existingProfile.bannerUrl && !existingProfile.bannerUrl.toLowerCase().endsWith('.gif')) {
          validatedBannerUrl = existingProfile.bannerUrl;
        } else {
          validatedBannerUrl = null; // Sem banner
        }
        
        console.log(`GIF blocked for user ${user.id} in bannerUrl: ${validation.error}`);
      }
    }

    // Atualizar perfil com as imagens validadas
    const profile = await db.profile.update({
      where: { userId: user.id },
      data: {
        imageUrl: validatedImageUrl,
        bannerUrl: validatedBannerUrl,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_SYNC_UPDATE]", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
