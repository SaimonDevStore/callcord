import type { NextApiRequest } from "next";
import { NextApiResponse } from "next";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { type NextApiResponseServerIO } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed." });

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!profile) return res.status(401).json({ error: "Unauthorized." });
    if (!conversationId)
      return res.status(400).json({ error: "Conversation ID is missing." });

    if (!content) return res.status(400).json({ error: "Content is missing." });

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found." });

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) return res.status(404).json({ message: "Member not found." });

    const message = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversationId as string,
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

    const channelKey = `chat:${conversationId}:messages`;

    // Serializar mensagem para emitir via Socket.io
    const serializedMessageForSocket = {
      id: message.id,
      content: message.content,
      fileUrl: message.fileUrl,
      deleted: message.deleted,
      conversationId: message.conversationId,
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

    // Notificar destinatário na dock de notificações
    const targetProfileId = conversation.memberOne.profileId === profile.id ? conversation.memberTwo.profileId : conversation.memberOne.profileId;
    const fromName = conversation.memberOne.profileId === profile.id ? (conversation.memberOne.profile.name || 'Usuário') : (conversation.memberTwo.profile.name || 'Usuário');
    const notifyKey = `dm:notify:${targetProfileId}`;
    res?.socket?.server?.io?.emit(notifyKey, { fromName, fromProfileId: profile.id, serverId: conversation.memberOne.serverId || conversation.memberTwo.serverId });

    // Serializar mensagem direta para evitar erro de objetos complexos
    const serializedMessage = {
      id: message.id,
      content: message.content,
      fileUrl: message.fileUrl,
      deleted: message.deleted,
      conversationId: message.conversationId,
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
    console.error("[DIRECT_MESSAGES_POST]: ", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}
