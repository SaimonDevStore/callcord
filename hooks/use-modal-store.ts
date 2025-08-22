import type { Channel, ChannelType, Server, Profile } from "@prisma/client";
import { create } from "zustand";
import type { SerializedServer, SerializedChannel, SerializedMember } from "@/types";

export type ModalType =
  | "createServer"
  | "invite"
  | "editServer"
  | "members"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile"
  | "deleteMessage"
  | "userProfile"
  | "kickMember"
  | "manageRoles"
  | "editBio"
  | "nitroInfo"
  | "rewards"
  | "rewardsProgress"
  | "pix"
  | "thread"
  | "addFriend"
  | "rewardsLeaderboard"
  | "updates"
  | "ownerPayouts"
  | "globalAnnouncement";

type ModalData = {
  server?: Server | SerializedServer;
  channel?: Channel | SerializedChannel;
  channelType?: ChannelType;
  apiUrl?: string;
  query?: Record<string, any>;
  profile?: Profile | SerializedMember['profile'];
  member?: any | SerializedMember;
  serverId?: string;
  threadId?: string;
  joinedAt?: any;
};

type ModalStore = {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
};

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null, data: {} }),
}));
