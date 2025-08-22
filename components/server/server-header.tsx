"use client";

import { MemberRole } from "@prisma/client";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
  Zap,
  MoreVertical,
} from "lucide-react";
import { CheckCircle2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Megaphone } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import type { SerializedServer } from "@/types";
import { Button } from "@/components/ui/button";

type ServerHeaderProps = {
  server: SerializedServer;
  role?: MemberRole;
};

export const ServerHeader = ({ server, role }: ServerHeaderProps) => {
  const { onOpen } = useModal();

  const isOwner = role === MemberRole.OWNER;
  const isAdmin = isOwner || role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
        <DropdownMenuItem
          onClick={() => onOpen("updates")}
          className="px-3 py-2 text-sm cursor-pointer"
        >
          Atualização
          <Megaphone className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Comprar NITRO - disponível para todos */}
        <DropdownMenuItem
          onClick={() => onOpen("nitroInfo")}
          className="text-fuchsia-500 dark:text-fuchsia-400 px-3 py-2 text-sm cursor-pointer"
        >
          Comprar NITRO
          <Zap className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen("invite", { server })}
            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
          >
            Convidar Pessoas
            <UserPlus className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("editServer", { server })}
            className="px-3 py-2 text-sm cursor-pointer"
          >
            Configurações do Servidor
            <Settings className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("members", { server })}
            className="px-3 py-2 text-sm cursor-pointer"
          >
            Gerenciar Membros
            <Users className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen("createChannel")}
            className="px-3 py-2 text-sm cursor-pointer"
          >
            Criar Canal
            <PlusCircle className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen("manageRoles")}
            className="px-3 py-2 text-sm cursor-pointer"
          >
            Gerenciar Cargos
            <CheckCircle2 className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isOwner && (
          <DropdownMenuItem
            onClick={() => onOpen("deleteServer", { server })}
            className="text-rose-600 dark:text-rose-400 px-3 py-2 text-sm cursor-pointer"
          >
            Deletar Servidor
            <Trash className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {!isOwner && (
          <DropdownMenuItem
            onClick={() => onOpen("leaveServer", { server })}
            className="text-rose-600 dark:text-rose-400 px-3 py-2 text-sm cursor-pointer"
          >
            Sair do Servidor
            <LogOut className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
