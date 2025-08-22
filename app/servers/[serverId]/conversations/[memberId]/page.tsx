import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { currentProfile } from "@/lib/current-profile";
import { getOrCreateConversation } from "@/lib/conversation";

type MemberIdPageProps = {
  params: Promise<{
    memberId: string;
    serverId: string;
  }>;
  searchParams: Promise<{
    video?: string;
  }>;
};

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  const profile = await currentProfile();
  if (!profile) return redirectToSignIn();

  const { memberId, serverId } = await params;
  const { video } = await searchParams;

  const currentMember = await getOrCreateConversation(profile.id, memberId);

  if (!currentMember) redirect(`/servers/${serverId}`);

  const { memberOne, memberTwo } = currentMember;

  const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

  // Serializar objetos complexos para evitar erro de objetos complexos
  const serializedOtherMember = {
    id: otherMember.id,
    role: otherMember.role,
    profileId: otherMember.profileId,
    serverId: otherMember.serverId,
    createdAt: otherMember.createdAt.toISOString(),
    updatedAt: otherMember.updatedAt.toISOString(),
    profile: {
      id: otherMember.profile.id,
      userId: otherMember.profile.userId,
      name: otherMember.profile.name,
      imageUrl: otherMember.profile.imageUrl,
      bannerUrl: otherMember.profile.bannerUrl,
      email: otherMember.profile.email,
      bio: otherMember.profile.bio,
      isNitro: otherMember.profile.isNitro,
      nitroExpiresAt: otherMember.profile.nitroExpiresAt?.toISOString() || null,
      customNickname: otherMember.profile.customNickname,
      nitroPlan: otherMember.profile.nitroPlan,
      createdAt: otherMember.profile.createdAt.toISOString(),
      updatedAt: otherMember.profile.updatedAt.toISOString(),
    },
  };

  const serializedCurrentMember = {
    id: currentMember.id,
    memberOneId: currentMember.memberOneId,
    memberTwoId: currentMember.memberTwoId,
  };

  const serializedMember = {
    id: (memberOne.profileId === profile.id ? memberOne : memberTwo).id,
    role: (memberOne.profileId === profile.id ? memberOne : memberTwo).role,
    profileId: (memberOne.profileId === profile.id ? memberOne : memberTwo).profileId,
    serverId: (memberOne.profileId === profile.id ? memberOne : memberTwo).serverId,
    createdAt: (memberOne.profileId === profile.id ? memberOne : memberTwo).createdAt.toISOString(),
    updatedAt: (memberOne.profileId === profile.id ? memberOne : memberTwo).updatedAt.toISOString(),
    profile: {
      id: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.id,
      userId: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.userId,
      name: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.name,
      imageUrl: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.imageUrl,
      bannerUrl: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.bannerUrl,
      email: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.email,
      bio: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.bio,
      isNitro: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.isNitro,
      nitroExpiresAt: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.nitroExpiresAt?.toISOString() || null,
      customNickname: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.customNickname,
      nitroPlan: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.nitroPlan,
      createdAt: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.createdAt.toISOString(),
      updatedAt: (memberOne.profileId === profile.id ? memberOne : memberTwo).profile.updatedAt.toISOString(),
    },
  };

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={serializedOtherMember.profile.imageUrl}
        name={serializedOtherMember.profile.name}
        serverId={serverId}
        type="conversation"
      />

      {video && (
        <MediaRoom
          chatId={serializedCurrentMember.id}
          video={true}
          audio={true}
          isCallRoom={false}
        />
      )}

      {!video && (
        <>
          <ChatMessages
            member={serializedMember}
            name={serializedOtherMember.profile.name}
            chatId={serializedCurrentMember.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={serializedCurrentMember.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{
              conversationId: serializedCurrentMember.id,
            }}
          />

          <ChatInput
            name={serializedOtherMember.profile.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: serializedCurrentMember.id,
            }}
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;
