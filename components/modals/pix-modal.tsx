"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { useState, useEffect } from "react";

export const PixModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === 'pix';
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableAmount, setAvailableAmount] = useState(0);

  // Buscar valor disponível quando abrir o modal
  useEffect(() => {
    if (!isModalOpen) return;
    
    const fetchAvailable = async () => {
      try {
        const res = await fetch('/api/rewards');
        if (res.ok) {
          const data = await res.json();
          const available = (data.availableCents || 0) / 100;
          setAvailableAmount(available);
          setAmount(available.toFixed(2));
        }
      } catch (error) {
        console.error('Erro ao buscar valor disponível:', error);
      }
    };

    fetchAvailable();
  }, [isModalOpen]);

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-md">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Saque via Pix</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-4 space-y-3">
          <div className="rounded-md bg-zinc-900/60 p-3 border border-zinc-700">
            <p className="text-sm text-zinc-300">Valor disponível: R$ {availableAmount.toFixed(2)}</p>
          </div>
          <Input 
            placeholder="Chave Pix (CPF, email, telefone, etc.)" 
            value={pixKey} 
            onChange={(e) => setPixKey(e.target.value)} 
          />
          <Input 
            placeholder="Valor (R$)" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            min="0.01"
            max={availableAmount}
          />
          <p className="text-xs text-zinc-500">
            O pedido será enviado ao dono (Saimon) por mensagem privada.
          </p>
        </div>
        <DialogFooter className="px-6 pb-6 gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            disabled={loading || !pixKey || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableAmount} 
            onClick={async () => {
              try {
                setLoading(true);
                const cents = Math.round(parseFloat(amount) * 100);
                await fetch('/api/rewards', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ action: 'requestPix', pixKey, amountCents: cents }) 
                });
                alert('Pedido enviado ao dono! Você receberá o pagamento em breve.');
                onClose();
              } catch (error) {
                alert('Erro ao enviar pedido. Tente novamente.');
                console.error('Erro:', error);
              } finally { 
                setLoading(false); 
              }
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


