"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MemberRole } from "@prisma/client";
import axios from "axios";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash, CheckCircle, Zap, SmilePlus, Pin, MessageSquarePlus, Crown, Users, Star, Heart } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import qs from "query-string";
import { type ElementRef, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import type { SerializedMember } from "@/types";

import { ActionTooltip } from "../action-tooltip";
import { UserAvatar } from "../user-avatar";

type ChatItemProps = {
  id: string;
  content: string;
  member: SerializedMember;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: SerializedMember;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
};

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
  OWNER: <Crown className="h-4 w-4 ml-2 text-yellow-500" />,
  MEMBER: <Users className="h-4 w-4 ml-2 text-blue-500" />,
  VIP: <Star className="h-4 w-4 ml-2 text-orange-500" />,
  FRIEND: <Heart className="h-4 w-4 ml-2 text-pink-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const inputRef = useRef<ElementRef<"input">>(null);
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const onMemberClick = () => {
    if (member.id === currentMember.id) return;

    // Abrir modal de perfil em vez de ir para conversa
    onOpen("userProfile", { profile: member.profile });
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content,
    },
  });

  useEffect(() => form.reset({ content }), [content, form]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        console.log("Escape");
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fileType = fileUrl?.split(".").pop();

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const isVerifiedUser = member.profile.email === "saimonscheibler1999@gmail.com";
  const isSaimon = isVerifiedUser || (member.profile.name?.replace(/^@/, "").toUpperCase() === "SAIMON");
  const hasNitro = member.profile.isNitro;
  const nitroPlan = (member.profile as any).nitroPlan || (hasNitro ? 'FLUX' : undefined);
  const displayName = isSaimon ? 'SAIMON' : (member.profile.name || '').replace(/^@/, '');

  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;

  const isPDF = fileUrl && fileType === "pdf";
  const isImage = fileUrl && !isPDF;

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    // carregar reações da mensagem (socketQuery não carrega isso; buscar sob demanda)
    (async () => {
      try {
        const res = await axios.get(`/api/messages?channelId=${socketQuery.channelId}`);
        const msg = (res.data.items || []).find((m: any) => m.id === id);
        const counts: Record<string, number> = {};
        (msg?.reactions || []).forEach((r: any) => {
          counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        });
        setReactions(counts);
      } catch {}
    })();
  }, [id, socketQuery.channelId]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await axios.patch(url, values);

      form.reset();
      setIsEditing(false);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isEditing) {
      form.setFocus("content");
    }
  }, [isEditing, form.setFocus, form]);

  return (
    <div className="relative group flex items-center hover:bg-black/5 px-4 py-2 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <button
          onClick={onMemberClick}
          className="cursor-pointer hover:drop-shadow-md transition rounded-full"
        >
          <UserAvatar src={member.profile.imageUrl} alt={member.profile.name} allowGif={member.profile.isNitro || member.profile.email === "saimonscheibler1999@gmail.com"} />
        </button>

        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <button
                onClick={onMemberClick}
                className={cn(
                  "font-semibold text-sm hover:underline cursor-pointer px-1 rounded",
                  isVerifiedUser && "text-blue-500 font-bold",
                  isSaimon && "text-red-500 font-extrabold bg-red-500/10 border border-red-500/30"
                )}
              >
                <span
                  className={cn(
                    nitroPlan === 'FLUX' && 'text-yellow-400',
                    nitroPlan === 'NEBULA' && 'text-blue-400',
                    nitroPlan === 'QUANTUM' && 'text-fuchsia-400',
                  )}
                  title={
                    nitroPlan === 'FLUX' ? 'Nitro Flux ⚡' :
                    nitroPlan === 'NEBULA' ? 'Nitro Nebula 🌌' :
                    nitroPlan === 'QUANTUM' ? 'Nitro Quantum ⚛️' : undefined
                  }
                >
                  {displayName}
                </span>
              </button>

              {isVerifiedUser && (
                <ActionTooltip label="Verificado" side="top">
                  <CheckCircle className="h-4 w-4 ml-1 text-blue-500" />
                </ActionTooltip>
              )}

              {nitroPlan === 'FLUX' && (
                <ActionTooltip label="Nitro Flux ⚡" side="top">
                  <Zap className="h-4 w-4 ml-1 text-yellow-500" />
                </ActionTooltip>
              )}
              {nitroPlan === 'NEBULA' && (
                <ActionTooltip label="Nitro Nebula 🌌" side="top">
                  <Zap className="h-4 w-4 ml-1 text-blue-500" />
                </ActionTooltip>
              )}
              {nitroPlan === 'QUANTUM' && (
                <ActionTooltip label="Nitro Quantum ⚛️" side="top">
                  <Zap className="h-4 w-4 ml-1 text-fuchsia-500" />
                </ActionTooltip>
              )}

              <ActionTooltip label={nitroPlan ? 'NITRO' : member.role}>
                {!nitroPlan && roleIconMap[member.role as MemberRole]}
              </ActionTooltip>
            </div>

            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>

          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="relative rounded-md mt-2 overflow-hidden border flex items-center bg-secondary max-w-xs"
            >
              <Image
                src={fileUrl}
                alt={content}
                width={200}
                height={200}
                className="object-cover rounded-md"
              />
            </a>
          )}

          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-zinc-100 dark:bg-zinc-900">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                Arquivo PDF
              </a>
            </div>
          )}

          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-sm mt-1",
              )}
            >
              {content}{" "}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (editado)
                </span>
              )}
            </p>
          )}

          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            aria-disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  disabled={isLoading}
                  aria-disabled={isLoading}
                  size="sm"
                  variant="primary"
                >
                  Save
                </Button>
              </form>

              <span className="text-[10px] mt-1 text-zinc-400">
                Press escape to cancel, enter to save
              </span>
            </Form>
          )}
        </div>
      </div>

      {canDeleteMessage && (
        <div className="md:hidden md:group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          <ActionTooltip label="Reagir">
            <SmilePlus
              onClick={async () => {
                const emoji = prompt("Emoji (ex: 😀)") || "";
                if (!emoji) return;
                await axios.post(`/api/messages/${id}/react`, { emoji });
                setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
              }}
              className="cursor-pointer ml-auto mb-2 md:mb-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Fixar">
            <Pin
              onClick={async () => {
                await axios.patch(`/api/messages/${id}/pin`, { pinned: true });
                alert("Mensagem fixada");
              }}
              className="cursor-pointer ml-auto mb-2 md:mb-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Criar thread">
            <MessageSquarePlus
              onClick={async () => {
                try {
                  const channelId = socketQuery.channelId;
                  const { data } = await axios.post(`/api/threads`, { channelId, rootMessageId: id });
                  onOpen("thread", { threadId: data.id, member: currentMember });
                } catch (e) {}
              }}
              className="cursor-pointer ml-auto mb-2 md:mb-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing((prevIsEditing) => !prevIsEditing)}
                className="cursor-pointer ml-auto mb-2 md:mb-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}

          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  apiUrl: `${socketUrl}/${id}`,
                  query: socketQuery,
                })
              }
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}

      {!!Object.keys(reactions).length && (
        <div className="flex gap-2 mt-2 ml-[56px]">
          {Object.entries(reactions).map(([emoji, count]) => (
            <span key={emoji} className="px-2 py-0.5 text-xs rounded-full bg-zinc-700/40 text-zinc-200">
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
