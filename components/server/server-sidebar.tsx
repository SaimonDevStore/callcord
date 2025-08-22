import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video, Crown, Users, Star, Heart } from "lucide-react";
import { redirect } from "next/navigation";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { ServerChannel } from "./server-channel";
import { ServerHeader } from "./server-header";
import { ServerMember } from "./server-member";
import { ServerSearch } from "./server-search";
import { ServerSection } from "./server-section";
import { FriendsList } from "../friends-list";
import { FixedUserProfile } from "@/components/fixed-user-profile";
import { RewardsButton } from "@/components/rewards-button";

type ServerSidebarProps = {
  serverId: string;
};

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.OWNER]: <Crown className="h-4 w-4 ml-2 text-yellow-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  [MemberRole.MEMBER]: <Users className="h-4 w-4 ml-2 text-blue-500" />,
  [MemberRole.VIP]: <Star className="h-4 w-4 ml-2 text-orange-500" />,
  [MemberRole.FRIEND]: <Heart className="h-4 w-4 ml-2 text-pink-500" />,
  [MemberRole.GUEST]: <Users className="h-4 w-4 ml-2 text-gray-500" />,
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) redirect("/");

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  if (!server) redirect("/");

  const textChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.TEXT,
  );
  const audioChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO,
  );
  const videoChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO,
  );
  const members = server?.members.filter(
    (member) => member.profileId !== profile.id,
  );

  // Normaliza o papel do dono: se o profileId do servidor for o usuário atual, força OWNER
  const currentMembership = server.members.find((member) => member.profileId === profile.id);
  const role = server.profileId === profile.id ? MemberRole.OWNER : currentMembership?.role;

  // Serializar objetos complexos para objetos simples
  const serializedServer = {
    id: server.id,
    name: server.name,
    imageUrl: server.imageUrl,
    inviteCode: server.inviteCode,
    profileId: server.profileId,
    createdAt: server.createdAt.toISOString(),
    updatedAt: server.updatedAt.toISOString(),
    requireRules: (server as any).requireRules || false,
  };

  const serializedTextChannels = textChannels?.map((channel) => ({
    id: channel.id,
    name: channel.name,
    type: channel.type,
    profileId: channel.profileId,
    serverId: channel.serverId,
    categoryId: channel.categoryId,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString(),
  }));

  const serializedAudioChannels = audioChannels?.map((channel) => ({
    id: channel.id,
    name: channel.name,
    type: channel.type,
    profileId: channel.profileId,
    serverId: channel.serverId,
    categoryId: channel.categoryId,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString(),
  }));

  const serializedVideoChannels = videoChannels?.map((channel) => ({
    id: channel.id,
    name: channel.name,
    type: channel.type,
    profileId: channel.profileId,
    serverId: channel.serverId,
    categoryId: channel.categoryId,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString(),
  }));

  const serializedMembers = members?.map((member) => ({
    id: member.id,
    role: member.role,
    profileId: member.profileId,
    serverId: member.serverId,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
    profile: {
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
      createdAt: member.profile.createdAt.toISOString(),
      updatedAt: member.profile.updatedAt.toISOString(),
    },
  }));

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={serializedServer} role={role} />
      <ScrollArea className="flex-1 px-4">
        <div className="mt-2">
          {/* Regras com aceite */}
          {!!(server as any).requireRules && !(server.members.find(m => m.profileId === profile.id) as any)?.acceptedRulesAt && (
            <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-600 rounded">
              <div className="text-sm text-yellow-200">Você precisa aceitar as regras para participar.</div>
              <form action={`/api/servers/${server.id}/rules-accept`} method="post" className="mt-2">
                <button className="px-3 py-1 bg-yellow-600 text-white rounded text-xs">Aceitar Regras</button>
              </form>
            </div>
          )}
          {/* Botão Recompensas - apenas no servidor oficial por inviteCode */}
          {server.inviteCode === "5f1b2a06-1850-4d85-93c9-27a7d01c5fcd" && (
            <div className="mb-3">
              <RewardsButton />
            </div>
          )}
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: serializedTextChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: serializedAudioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: serializedVideoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: serializedMembers?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />

          <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />

          {!!serializedTextChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType={ChannelType.TEXT}
                role={role}
                label="Canais de Texto"
              />

              <div className="space-y-[2px]">
                {serializedTextChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    role={role}
                    server={serializedServer}
                  />
                ))}
              </div>
            </div>
          )}

          {!!serializedAudioChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType={ChannelType.AUDIO}
                role={role}
                label="Canais de Voz"
              />

              <div className="space-y-[2px]">
                {serializedAudioChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    role={role}
                    server={serializedServer}
                  />
                ))}
              </div>
            </div>
          )}

          {!!serializedVideoChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType={ChannelType.VIDEO}
                role={role}
                label="Canais de Vídeo"
              />

              <div className="space-y-[2px]">
                {serializedVideoChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    role={role}
                    server={serializedServer}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lista de Amigos */}
          <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-3" />
          <div className="space-y-4">
            <FriendsList />
          </div>
        </div>
      </ScrollArea>

      {/* Perfil fixo do usuário – sempre visível no rodapé da barra lateral */}
      <div className="px-4 pb-3 pt-2 border-t border-zinc-700/60 bg-[#2B2D31]">
        <FixedUserProfile profileName={profile.name} profileImageUrl={profile.imageUrl} />
      </div>
    </div>
  );
};
