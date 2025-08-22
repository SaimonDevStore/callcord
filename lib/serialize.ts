// Função utilitária para serializar objetos Prisma
export function serializeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeObject);
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeObject(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
}

// Função específica para serializar mensagens
export function serializeMessage(message: any) {
  return {
    id: message.id,
    content: message.content,
    fileUrl: message.fileUrl,
    deleted: message.deleted,
    channelId: message.channelId,
    conversationId: message.conversationId,
    memberId: message.memberId,
    createdAt: message.createdAt?.toISOString(),
    updatedAt: message.updatedAt?.toISOString(),
    member: message.member ? {
      id: message.member.id,
      role: message.member.role,
      profileId: message.member.profileId,
      serverId: message.member.serverId,
      createdAt: message.member.createdAt?.toISOString(),
      updatedAt: message.member.updatedAt?.toISOString(),
      profile: message.member.profile ? {
        id: message.member.profile.id,
        userId: message.member.profile.userId,
        name: message.member.profile.name,
        imageUrl: message.member.profile.imageUrl,
        bannerUrl: message.member.profile.bannerUrl,
        email: message.member.profile.email,
        bio: message.member.profile.bio,
        isNitro: message.member.profile.isNitro,
        nitroExpiresAt: message.member.profile.nitroExpiresAt?.toISOString() || null,
        customNickname: message.member.profile.customNickname,
        nitroPlan: message.member.profile.nitroPlan,
        createdAt: message.member.profile.createdAt?.toISOString(),
        updatedAt: message.member.profile.updatedAt?.toISOString(),
      } : null,
    } : null,
    reactions: message.reactions ? message.reactions.map((reaction: any) => ({
      id: reaction.id,
      emoji: reaction.emoji,
      messageId: reaction.messageId,
      profileId: reaction.profileId,
      createdAt: reaction.createdAt?.toISOString(),
    })) : [],
  };
}

// Função específica para serializar membros
export function serializeMember(member: any) {
  return {
    id: member.id,
    role: member.role,
    profileId: member.profileId,
    serverId: member.serverId,
    createdAt: member.createdAt?.toISOString(),
    updatedAt: member.updatedAt?.toISOString(),
    profile: member.profile ? {
      id: member.profile.id,
      userId: member.profile.userId,
      name: member.profile.name,
      imageUrl: member.profile.imageUrl,
      bannerUrl: member.profile.bannerUrl,
      email: member.profile.email,
      bio: member.profile.bio,
      isNitro: member.profile.isNitro,
      nitroExpiresAt: member.profile.nitroExpiresAt?.toISOString() || null,
      customNickname: member.profile.customNickname,
      nitroPlan: member.profile.nitroPlan,
      createdAt: member.profile.createdAt?.toISOString(),
      updatedAt: member.profile.updatedAt?.toISOString(),
    } : null,
  };
}

// Função específica para serializar servidores
export function serializeServer(server: any) {
  return {
    id: server.id,
    name: server.name,
    imageUrl: server.imageUrl,
    inviteCode: server.inviteCode,
    profileId: server.profileId,
    createdAt: server.createdAt?.toISOString(),
    updatedAt: server.updatedAt?.toISOString(),
    requireRules: server.requireRules || false,
  };
}

// Função específica para serializar canais
export function serializeChannel(channel: any) {
  return {
    id: channel.id,
    name: channel.name,
    type: channel.type,
    profileId: channel.profileId,
    serverId: channel.serverId,
    categoryId: channel.categoryId,
    createdAt: channel.createdAt?.toISOString(),
    updatedAt: channel.updatedAt?.toISOString(),
  };
}
