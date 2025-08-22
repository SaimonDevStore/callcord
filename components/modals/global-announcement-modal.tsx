"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Megaphone } from "lucide-react";
import { toast } from "sonner";

export const GlobalAnnouncementModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "globalAnnouncement";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Digite uma mensagem para o aviso global!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/global-announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      
      // Enviar aviso via WebSocket para todos os usuários
      // Aqui você implementaria a lógica real do WebSocket
      
      toast.success("Aviso global enviado com sucesso!");
      setMessage("");
      onClose();
      router.refresh();
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar aviso global!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Aviso Global
            <Megaphone className="h-6 w-6 text-red-500" />
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Envie um aviso que aparecerá para TODOS os usuários do Callcord.
            <br />
            <span className="text-yellow-600 font-semibold">
              ⚠️ Apenas o dono pode usar este comando!
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs font-bold text-zinc-500 dark:text-secondary/70">
                MENSAGEM DO AVISO
              </Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem de aviso global..."
                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                disabled={isLoading}
                maxLength={500}
              />
              <div className="text-xs text-zinc-500 text-right">
                {message.length}/500
              </div>
            </div>
          </div>
          
          <DialogFooter className="bg-gray-100 px-6 py-4 mt-4">
            <div className="flex items-center justify-between w-full">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Enviando..." : "Enviar Aviso Global"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
