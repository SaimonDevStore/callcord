import type { Member, Message, Profile, Server, Reaction } from "@prisma/client";
import type { Server as NetServer, Socket } from "net";
import type { NextApiResponse } from "next";
import type { Server as SocketIOServer } from "socket.io";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
};

export type MessageWithMemberWithProfile = Message & {
  member: SerializedMember;
};

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// Tipos serializados para evitar erro de objetos complexos em Client Components
export type SerializedServer = {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
  requireRules?: boolean;
};

export type SerializedChannel = {
  id: string;
  name: string;
  type: string;
  profileId: string;
  serverId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedMember = {
  id: string;
  role: string;
  profileId: string;
  serverId: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    id: string;
    userId: string;
    name: string;
    imageUrl: string;
    bannerUrl: string | null;
    email: string;
    bio: string | null;
    isNitro: boolean;
    nitroExpiresAt: string | null;
    customNickname: string | null;
    nitroPlan: string | null;
    createdAt: string;
    updatedAt: string;
  };
};
