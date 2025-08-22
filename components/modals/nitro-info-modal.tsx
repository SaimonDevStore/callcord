"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

export const NitroInfoModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "nitroInfo";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-lg">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Seja NITRO</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Flux */}
          <div className="rounded-xl border border-yellow-400/40 bg-gradient-to-br from-yellow-600/20 to-amber-600/10 p-4">
            <h4 className="text-base font-bold text-yellow-300">Nitro Callcord Flux ⚡ (Básico)</h4>
            <ul className="text-sm text-zinc-200 space-y-1 list-disc list-inside mt-1">
              <li>Fotos de perfil animadas (GIFs).</li>
              <li>Banners personalizados no perfil.</li>
              <li>Uploads em qualidade melhor.</li>
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-yellow-300">Tag: (Nitro⚡)</span>
              <Button onClick={() => alert("Em breve")}>R$ 5,00</Button>
            </div>
          </div>

          {/* Nebula */}
          <div className="rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 p-4">
            <h4 className="text-base font-bold text-blue-300">Nitro Callcord Nebula 🌌 (Intermediário)</h4>
            <ul className="text-sm text-zinc-200 space-y-1 list-disc list-inside mt-1">
              <li>Todas as do Nitro Flux.</li>
              <li>Nomes coloridos exclusivos.</li>
              <li>Emojis especiais liberados em qualquer servidor.</li>
              <li>Acesso antecipado a novos recursos.</li>
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-blue-300">Tag: (Nitro🌌)</span>
              <Button onClick={() => alert("Em breve")}>R$ 12,00</Button>
            </div>
          </div>

          {/* Quantum */}
          <div className="rounded-xl border border-fuchsia-500/40 bg-gradient-to-br from-purple-700/30 via-fuchsia-700/20 to-rose-700/20 p-4 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
            <h4 className="text-base font-bold text-fuchsia-300">Nitro Callcord Quantum ⚛️ (Extremo)</h4>
            <ul className="text-sm text-zinc-200 space-y-1 list-disc list-inside mt-1">
              <li>Todas as do Nitro Flux e Nebula.</li>
              <li>Uploads em altíssima qualidade sem limite.</li>
              <li>Prioridade em servidores lotados.</li>
              <li>Destaque visual no perfil com efeitos roxos e vermelhos.</li>
              <li>Tag VIP animada exclusiva.</li>
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-fuchsia-300">Tag: (Nitro⚛️)</span>
              <Button onClick={() => alert("Em breve")}>R$ 35,00</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


