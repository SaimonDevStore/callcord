"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from "react";

type Progress = {
  validDays?: number;
  availableCents?: number;
  hasAgreed?: boolean;
};

export const RewardsModal = () => {
  const { isOpen, onClose, type, onOpen } = useModal();
  const isModalOpen = isOpen && type === "rewards";
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Progress>({});
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isModalOpen) return;
    
    const checkAgreement = async () => {
      try {
        setChecking(true);
        const res = await fetch('/api/rewards');
        if (res.ok) {
          const data = await res.json();
          setProgress(data);
        }
      } catch (error) {
        console.error('Erro ao verificar acordo:', error);
      } finally {
        setChecking(false);
      }
    };

    checkAgreement();
  }, [isModalOpen]);

  // Se está verificando, mostrar loading
  if (checking) {
    return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 overflow-hidden max-w-2xl">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">Carregando...</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-zinc-300">Verificando seu progresso...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Sistema de Recompensas</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-4 space-y-4">
          <p className="text-sm text-zinc-300">
            O Sistema de Recompensas Callcord premia usuários ativos em calls. Cada dia válido é registrado quando você fica no mínimo 5 horas em call. Dias não precisam ser consecutivos; o contador só reinicia se você ficar 5 dias sem completar pelo menos 5h em call. Ao atingir cada nível, você ganha dinheiro real. O contador começa após clicar em &quot;Concordo&quot;.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border border-amber-500/30 p-3">
              <h4 className="font-semibold text-amber-400">Bronze</h4>
              <p className="text-xs text-zinc-400">5 dias válidos → R$ 1,00</p>
            </div>
            <div className="rounded-md border border-slate-300/30 p-3">
              <h4 className="font-semibold text-slate-200">Prata</h4>
              <p className="text-xs text-zinc-400">15 dias válidos → R$ 5,00</p>
            </div>
            <div className="rounded-md border border-yellow-500/30 p-3">
              <h4 className="font-semibold text-yellow-300">Ouro</h4>
              <p className="text-xs text-zinc-400">30 dias válidos → R$ 15,00</p>
            </div>
            <div className="rounded-md border border-cyan-500/30 p-3">
              <h4 className="font-semibold text-cyan-300">Platina</h4>
              <p className="text-xs text-zinc-400">60 dias válidos → R$ 40,00</p>
            </div>
            <div className="rounded-md border border-fuchsia-500/30 p-3 md:col-span-2">
              <h4 className="font-semibold text-fuchsia-300">Diamante</h4>
              <p className="text-xs text-zinc-400">100 dias válidos → R$ 100,00</p>
            </div>
          </div>
          <div className="rounded-md bg-zinc-900/60 p-3 border border-zinc-700">
            <h4 className="font-semibold text-sm mb-1">Progresso</h4>
            <p className="text-xs text-zinc-400">Dias válidos: {progress.validDays ?? 0}</p>
            <p className="text-xs text-zinc-400">Valor disponível: R$ {(progress.availableCents ?? 0 / 100).toFixed(2)}</p>
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={loading} onClick={async () => {
            try {
              setLoading(true);
              await fetch('/api/rewards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'agree' }) });
              onClose();
              // abrir modal de progresso
              setTimeout(() => onOpen('rewardsProgress'), 100);
              // Disparar evento para atualizar o botão
              window.dispatchEvent(new CustomEvent('rewardsAgreed'));
            } finally { setLoading(false); }
          }}>Concordo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


