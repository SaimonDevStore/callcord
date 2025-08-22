import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useSocket } from "@/components/providers/socket-provider";
import type { Member, Message, Profile } from "@prisma/client";
import { MessageWithMemberWithProfile } from "@/types";
import { playMessageSound } from "@/lib/sounds";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
  currentProfileId?: string;
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
  currentProfileId,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0)
          return oldData;

        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (item.id === message.id) return message;

              return item;
            }),
          };
        });

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    const deleteKey = addKey.replace(":messages", ":messages:delete");
    socket.on(deleteKey, (payload: { id: string }) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0)
          return oldData;

        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.filter((item: any) => item.id !== payload.id),
          };
        });

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      try {
        if (!currentProfileId || message.member.profileId !== currentProfileId) {
          playMessageSound();
        }
      } catch {}
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
      const deleteKey = addKey.replace(":messages", ":messages:delete");
      socket.off(deleteKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};
