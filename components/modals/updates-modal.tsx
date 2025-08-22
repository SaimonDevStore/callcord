"use client";

import { Megaphone } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";

export const UpdatesModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "updates";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-lg">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5" /> Atualização
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-8 space-y-4">
          <p className="text-sm text-zinc-400">
            Próximas atualizações em <span className="font-semibold text-zinc-200">25/08/2025 às 15:00</span>
          </p>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-zinc-300">Novidades planejadas</p>
            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
              <li>Opção de bot de música</li>
              <li>Temas para o Callcord</li>
              <li>Filtro de áudio nas calls (reduzir ruído, efeitos de voz, etc.)</li>
              <li>Falar colorido (mensagens por cor conforme cargo)</li>
              <li>Notificações melhoradas (mais opções, escolha de canais, etc.)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


