import type { NextApiRequest } from "next";
import { NextApiResponse } from "next";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { type NextApiResponseServerIO } from "@/types";
import { moderationStore } from "@/lib/moderation-store";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed." });

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!profile) return res.status(401).json({ error: "Unauthorized." });
    if (!serverId)
      return res.status(400).json({ error: "Server ID is missing." });
    if (!channelId)
      return res.status(400).json({ error: "Channel ID is missing." });
    if (!content) return res.status(400).json({ error: "Content is missing." });

    // Filtro simples de palavrões/links proibidos
    const lowered = String(content).toLowerCase();
    const bannedWords = ["http://", "https://", "porn", "xxx", "viagra"];
    if (bannedWords.some((w) => lowered.includes(w))) {
      return res.status(400).json({ error: "Conteúdo bloqueado pelas regras do servidor." });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) return res.status(404).json({ message: "Server not found." });

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel)
      return res.status(404).json({ message: "Channel not found." });

    const member = server.members.find(
      (member) => member.profileId === profile.id,
    );

    if (!member) return res.status(404).json({ message: "Member not found." });

    // bloqueio por mute/ban
    const banned = moderationStore.isBanned(serverId as string, member.profileId);
    if (banned) return res.status(403).json({ error: "Banned from this server." });
    const muted = moderationStore.isMuted(serverId as string, member.profileId);
    if (muted) return res.status(403).json({ error: "Muted." });

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channelId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    // XP e Level básico com cooldown de 60s
    try {
      const now = new Date();
      const last = member.lastMessageAt ? new Date(member.lastMessageAt) : null;
      const canGain = !last || now.getTime() - last.getTime() > 60000;
      if (canGain) {
        const newXp = member.xp + 10;
        const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);
        await db.member.update({ where: { id: member.id }, data: { xp: newXp, level: newLevel, lastMessageAt: now } });
      } else {
        await db.member.update({ where: { id: member.id }, data: { lastMessageAt: now } });
      }
    } catch {}

    const channelKey = `chat:${channelId}:messages`;

    // Serializar mensagem para emitir via Socket.io
    const serializedMessageForSocket = {
      id: message.id,
      content: message.content,
      fileUrl: message.fileUrl,
      deleted: message.deleted,
      channelId: message.channelId,
      memberId: message.memberId,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      member: {
        id: message.member.id,
        role: message.member.role,
        profileId: message.member.profileId,
        serverId: message.member.serverId,
        createdAt: message.member.createdAt.toISOString(),
        updatedAt: message.member.updatedAt.toISOString(),
        profile: {
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
          createdAt: message.member.profile.createdAt.toISOString(),
          updatedAt: message.member.profile.updatedAt.toISOString(),
        },
      },
    };

    res?.socket?.server?.io?.emit(channelKey, serializedMessageForSocket);

    // Serializar mensagem para evitar erro de objetos complexos
    const serializedMessage = {
      id: message.id,
      content: message.content,
      fileUrl: message.fileUrl,
      deleted: message.deleted,
      channelId: message.channelId,
      memberId: message.memberId,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      member: {
        id: message.member.id,
        role: message.member.role,
        profileId: message.member.profileId,
        serverId: message.member.serverId,
        createdAt: message.member.createdAt.toISOString(),
        updatedAt: message.member.updatedAt.toISOString(),
        profile: {
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
          createdAt: message.member.profile.createdAt.toISOString(),
          updatedAt: message.member.profile.updatedAt.toISOString(),
        },
      },
    };

    return res.status(200).json(serializedMessage);
  } catch (error: unknown) {
    console.error("[MESSAGES_POST]: ", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}
