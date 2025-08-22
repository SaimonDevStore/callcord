import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { MemberList } from "@/components/chat/member-list";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";

type ChannelIdPageProps = {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
};

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const profile = await currentProfile();
  if (!profile) return redirectToSignIn();

  const { serverId, channelId } = await params;

  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!channel || !member) redirect("/");

  // Serializar objetos complexos para evitar erro de objetos complexos
  const serializedChannel = {
    id: channel.id,
    name: channel.name,
    type: channel.type,
    profileId: channel.profileId,
    serverId: channel.serverId,
    categoryId: channel.categoryId,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString(),
  };

  const serializedMember = {
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
  };

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={serializedChannel.name}
        serverId={serializedChannel.serverId}
        type="channel"
      />

      <div className="flex flex-1 h-full">
        <div className="flex-1 flex flex-col">
          {serializedChannel.type === ChannelType.TEXT && (
            <>
              <ChatMessages
                member={serializedMember}
                name={serializedChannel.name}
                chatId={serializedChannel.id}
                type="channel"
                apiUrl="/api/messages"
                socketUrl="/api/socket/messages"
                socketQuery={{
                  channelId: serializedChannel.id,
                  serverId: serializedChannel.serverId,
                }}
                paramKey="channelId"
                paramValue={serializedChannel.id}
              />

              <ChatInput
                name={serializedChannel.name}
                type="channel"
                apiUrl="/api/socket/messages"
                query={{
                  channelId: serializedChannel.id,
                  serverId: serializedChannel.serverId,
                }}
              />
            </>
          )}

          {serializedChannel.type === ChannelType.AUDIO && (
            <div className="flex flex-col flex-1 h-full">
              {/* Call de voz - em cima */}
              <div className="h-1/2 border-b border-zinc-700">
                <MediaRoom chatId={serializedChannel.id} video={false} audio={true} isCallRoom={true} />
              </div>
              
              {/* Chat de texto - embaixo */}
              <div className="h-1/2 flex flex-col">
                <ChatMessages
                  member={serializedMember}
                  name="General"
                  chatId={serializedChannel.id}
                  type="channel"
                  apiUrl="/api/messages"
                  socketUrl="/api/socket/messages"
                  socketQuery={{
                    channelId: serializedChannel.id,
                    serverId: serializedChannel.serverId,
                  }}
                  paramKey="channelId"
                  paramValue={serializedChannel.id}
                />
                <ChatInput
                  name="General"
                  type="channel"
                  apiUrl="/api/socket/messages"
                  query={{
                    channelId: serializedChannel.id,
                    serverId: serializedChannel.serverId,
                  }}
                />
              </div>
            </div>
          )}

          {serializedChannel.type === ChannelType.VIDEO && (
            <div className="flex flex-col flex-1 h-full">
              {/* Call de vídeo - em cima */}
              <div className="h-1/2 border-b border-zinc-700">
                <MediaRoom chatId={serializedChannel.id} video={true} audio={true} isCallRoom={true} />
              </div>
              
              {/* Chat de texto - embaixo */}
              <div className="h-1/2 flex flex-col">
                <ChatMessages
                  member={serializedMember}
                  name="General"
                  chatId={serializedChannel.id}
                  type="channel"
                  apiUrl="/api/messages"
                  socketUrl="/api/socket/messages"
                  socketQuery={{
                    channelId: serializedChannel.id,
                    serverId: serializedChannel.serverId,
                  }}
                  paramKey="channelId"
                  paramValue={serializedChannel.id}
                />
                <ChatInput
                  name="General"
                  type="channel"
                  apiUrl="/api/socket/messages"
                  query={{
                    channelId: serializedChannel.id,
                    serverId: serializedChannel.serverId,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <MemberList serverId={serverId} />
      </div>
    </div>
  );
};

export default ChannelIdPage;
