"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import type { SerializedMember } from "@/types";

type KickMemberModalProps = {
  member: SerializedMember;
  serverId: string;
};

export const KickMemberModal = ({ member, serverId }: KickMemberModalProps) => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "kickMember";

  const onKick = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/servers/${serverId}/members/${member.id}`);

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-zinc-900 text-black dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Expulsar Membro
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Tem certeza que deseja expulsar{" "}
            <span className="font-semibold text-black dark:text-white">
              {member.profile.name}
            </span>{" "}
            do servidor?
            <br />
            <span className="text-red-500">
              Esta ação não pode ser desfeita.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 dark:bg-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isLoading}
              onClick={onClose}
              variant="ghost"
            >
              Cancelar
            </Button>
            <Button
              disabled={isLoading}
              onClick={onKick}
              variant="destructive"
            >
              {isLoading ? "Expulsando..." : "Expulsar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
