import { currentUser, redirectToSignIn } from "@clerk/nextjs";

import { db } from "./db";

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user) return redirectToSignIn();

  // Sempre sincronizar com o Clerk para garantir dados atualizados
  const profile = await db.profile.findUnique({
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

  // Adicionar @ se não tiver
  if (!displayName.startsWith("@")) {
    displayName = `@${displayName}`;
  }

  if (profile) {
    // Atualizar perfil existente se os dados do Clerk mudaram
    const updatedProfile = await db.profile.update({
      where: {
        userId: user.id,
      },
      data: {
        name: displayName,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return updatedProfile;
  }

  // Criar novo perfil se não existir (com proteção contra corrida)
  try {
    const newProfile = await db.profile.create({
      data: {
        userId: user.id,
        name: displayName,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return newProfile;
  } catch {
    const existing = await db.profile.findUnique({ where: { userId: user.id } });
    if (existing) return existing;
    throw new Error("Failed to create or fetch profile");
  }
};
