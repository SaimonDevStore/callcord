"use client";

import { useEffect, useState } from "react";

import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { DeleteChannelModal } from "@/components/modals/delete-channel-modal";
import { DeleteMessageModal } from "@/components/modals/delete-message-modal";
import { DeleteServerModal } from "@/components/modals/delete-server-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { EditServerModal } from "@/components/modals/edit-server-modal";
import { InviteModal } from "@/components/modals/invite-modal";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";
import { MembersModal } from "@/components/modals/members-modal";
import { MessageFileModal } from "@/components/modals/message-file-modal";
import { UserProfileModal } from "@/components/modals/user-profile-modal";
import { KickMemberModal } from "@/components/modals/kick-member-modal";
import { ManageRolesModal } from "@/components/modals/manage-roles-modal";
import { EditBioModal } from "@/components/modals/edit-bio-modal";
import { NitroInfoModal } from "@/components/modals/nitro-info-modal";
import { RewardsModal } from "@/components/modals/rewards-modal";
import { RewardsProgressModal } from "@/components/modals/rewards-progress-modal";
import { PixModal } from "@/components/modals/pix-modal";
import { useModal } from "@/hooks/use-modal-store";
import { ThreadModal } from "@/components/modals/thread-modal";
import { AddFriendModal } from "@/components/modals/add-friend-modal";
import { UpdatesModal } from "@/components/modals/updates-modal";
import { RewardsLeaderboardModal } from "@/components/modals/rewards-leaderboard-modal";
import { OwnerPayoutRequestsModal } from "@/components/modals/owner-payout-requests-modal";
import { GlobalAnnouncementModal } from "@/components/modals/global-announcement-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data } = useModal();

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <>
      <CreateChannelModal />
      <CreateServerModal />
      <DeleteChannelModal />
      <DeleteMessageModal />
      <DeleteServerModal />
      <EditChannelModal />
      <EditServerModal />
      <InviteModal />
      <LeaveServerModal />
      <MembersModal />
      <MessageFileModal />
      {data?.profile && (
        <UserProfileModal profile={data.profile} joinedAt={data?.joinedAt as any} />
      )}
      {data?.member && data?.serverId && (
        <KickMemberModal member={data.member} serverId={data.serverId} />
      )}
      {data?.member && data?.serverId && (
        <ManageRolesModal />
      )}
      <EditBioModal />
      <NitroInfoModal />
      <RewardsModal />
      <RewardsProgressModal />
      <PixModal />
      <ThreadModal />
      <AddFriendModal />
      <UpdatesModal />
      <RewardsLeaderboardModal />
      <OwnerPayoutRequestsModal />
      <GlobalAnnouncementModal />
    </>
  );
};
