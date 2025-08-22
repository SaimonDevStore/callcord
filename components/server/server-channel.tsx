"use client";

import {
  ChannelType,
  MemberRole,
} from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ActionTooltip } from "@/components/action-tooltip";
import { type ModalType, useModal } from "@/hooks/use-modal-store";
import { useLiveKitUsers } from "@/hooks/use-livekit-users";
import { cn } from "@/lib/utils";
import type { SerializedChannel, SerializedServer } from "@/types";

type ServerChannelProps = {
  channel: SerializedChannel;
  server: SerializedServer;
  role?: MemberRole;
};

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};

export const ServerChannel = ({
  channel,
  server,
  role,
}: ServerChannelProps) => {
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();
  
  const Icon = iconMap[channel.type as ChannelType];

  // Obter usuários conectados em tempo real do LiveKit
  const connectedUsers = useLiveKitUsers(
    (channel.type === ChannelType.AUDIO || channel.type === ChannelType.VIDEO) 
      ? channel.id 
      : ""
  );

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
  };

  const onAction = (e: React.MouseEvent, action: ModalType) => {
    e.stopPropagation();
    onOpen(action, { channel, server });
  };

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
          params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
        )}
      >
        <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        <p
          className={cn(
            "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
            params?.channelId === channel.id &&
              "text-primary dark:text-zinc-200 dark:group-hover:text-white"
          )}
        >
          {channel.name}
        </p>
        {connectedUsers.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <Users className="h-3 w-3 text-zinc-500" />
            <span className="text-xs text-zinc-500">{connectedUsers.length}</span>
          </div>
        )}
        {role !== MemberRole.GUEST && role !== MemberRole.MEMBER && (
          <div className="ml-auto flex items-center gap-x-2">
            <ActionTooltip label="Edit">
              <Edit
                onClick={(e) => onAction(e, "editChannel")}
                className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}
        {role === MemberRole.OWNER && (
          <ActionTooltip label="Delete">
            <Trash
              onClick={(e) => onAction(e, "deleteChannel")}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        )}
      </button>
    </>
  );
};
