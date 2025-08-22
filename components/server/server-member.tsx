"use client";

import {
  MemberRole,
  type Server,
} from "@prisma/client";
import { ShieldAlert, ShieldCheck, CheckCircle, Crown, Users, Star, Heart, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { ActionTooltip } from "@/components/action-tooltip";
import type { SerializedMember, SerializedServer } from "@/types";

import { UserAvatar } from "../user-avatar";

type ServerMemberProps = {
  member: SerializedMember;
  server: SerializedServer;
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

export const ServerMember = ({ member, server }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();
  const { onOpen } = useModal();

  const icon = roleIconMap[member.role as MemberRole];
  const isVerifiedUser = member.profile.email === "saimonscheibler1999@gmail.com";
  const isSaimon = isVerifiedUser || (member.profile.name?.replace(/^@/, "").toUpperCase() === "SAIMON");
  const isOwner = server.profileId === member.profileId;
  const canManageRoles = isOwner; // Apenas o dono pode gerenciar cargos
  const nitroPlan = member.profile.nitroPlan || (member.profile.isNitro ? 'FLUX' : undefined);

  const onClick = () => {
    // Abrir modal de perfil, incluindo data de entrada no servidor
    onOpen("userProfile", { profile: member.profile, joinedAt: member.createdAt });
  };

  const onKickClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen("kickMember", { member, serverId: params?.serverId as string });
  };

  const onManageRolesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen("manageRoles", { member, serverId: params?.serverId as string });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1"
      )}
    >
      <UserAvatar
        src={member.profile.imageUrl}
        alt={member.profile.name}
        className="h-8 w-8 md:h-8 md:w-8"
      />
      <div className="flex items-center gap-x-2">
        <p className="font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition">
          {member.profile.name}
        </p>
        {icon}
        {isSaimon && (
          <CheckCircle className="h-4 w-4 text-blue-500" />
        )}
        {nitroPlan && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-fuchsia-500" />
            <span className="text-xs text-fuchsia-500 font-medium">{nitroPlan}</span>
          </div>
        )}
      </div>
      
      {canManageRoles && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Kick">
            <User
              onClick={onKickClick}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Manage Roles">
            <ShieldCheck
              onClick={onManageRolesClick}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </button>
  );
};
