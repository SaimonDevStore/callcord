"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

type PayoutItem = {
  id: string;
  profileId: string;
  nick: string;
  email: string;
  pixKey: string;
  requestedCents: number;
  availableCents: number;
  createdAt: string;
};

export const OwnerPayoutRequestsModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "ownerPayouts";
  const [items, setItems] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    setLoading(true);
    fetch('/api/rewards/payout-requests').then(r => r.json()).then(setItems).finally(() => setLoading(false));
  }, [isModalOpen]);

  const zeroBalance = async (id: string) => {
    const ok = confirm('Confirmar: zerar saldo e aprovar este pagamento?');
    if (!ok) return;
    await fetch(`/api/rewards/payout-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'zero' }) });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Solicitações de Saque</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          {loading ? (
            <div className="text-sm text-zinc-400">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-zinc-400">Nenhuma solicitação pendente.</div>
          ) : (
            <div className="space-y-2">
              {items.map((i) => (
                <div key={i.id} className="p-3 rounded-lg border border-zinc-700 bg-zinc-800/50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{i.nick}</div>
                      <div className="text-xs text-zinc-400 truncate">{i.email}</div>
                      <div className="text-xs text-zinc-300">PIX: {i.pixKey}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm">Saldo atual: R$ {(i.availableCents/100).toFixed(2)}</div>
                      <div className="text-xs text-zinc-400">Solicitado: R$ {(i.requestedCents/100).toFixed(2)}</div>
                      <Button size="sm" className="mt-2" onClick={() => zeroBalance(i.id)}>Zerar saldo</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


