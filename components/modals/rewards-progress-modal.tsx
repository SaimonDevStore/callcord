"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useMemo, useState } from "react";

type Metrics = {
  validDays: number;
  availableCents: number;
  todaySeconds: number;
  isInCall?: boolean;
};

const formatDuration = (sec: number) => {
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const RewardsProgressModal = () => {
  const { isOpen, onClose, type, onOpen } = useModal();
  const isModalOpen = isOpen && type === "rewardsProgress";
  const [metrics, setMetrics] = useState<Metrics>({ validDays: 0, availableCents: 0, todaySeconds: 0, isInCall: false });

  // Polling mais frequente para atualizar em tempo real
  useEffect(() => {
    if (!isModalOpen) return;
    let active = true;
    
    const fetcher = async () => {
      try {
        const res = await fetch('/api/rewards');
        if (res.ok) {
          const p = await res.json();
          if (!active) return;
          setMetrics({
            validDays: p?.validDays || 0,
            availableCents: p?.availableCents || 0,
            todaySeconds: p?.todaySeconds || 0,
            isInCall: p?.isInCall || false,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      }
    };
    
    // Buscar dados imediatamente
    fetcher();
    
    // Atualizar a cada 2 segundos para mostrar tempo em tempo real
    const id = setInterval(fetcher, 2000);
    
    return () => { 
      active = false; 
      clearInterval(id); 
    };
  }, [isModalOpen]);

  // Listener para atualizar quando o progresso for salvo ao sair da call
  useEffect(() => {
    const handleProgressUpdate = () => {
      console.log('[REWARDS_MODAL] Progress updated, refreshing data...');
      // Forçar atualização imediata
      fetch('/api/rewards')
        .then(res => res.json())
        .then(p => {
          setMetrics({
            validDays: p?.validDays || 0,
            availableCents: p?.availableCents || 0,
            todaySeconds: p?.todaySeconds || 0,
            isInCall: p?.isInCall || false,
          });
        })
        .catch(err => console.error('Erro ao atualizar progresso:', err));
    };

    window.addEventListener('rewardsProgressUpdated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('rewardsProgressUpdated', handleProgressUpdate);
    };
  }, []);

  const nextReward = useMemo(() => {
    const d = metrics.validDays;
    if (d < 5) return { label: 'Bronze (5 dias) → R$ 1,00', remaining: 5 - d };
    if (d < 15) return { label: 'Prata (15 dias) → R$ 5,00', remaining: 15 - d };
    if (d < 30) return { label: 'Ouro (30 dias) → R$ 15,00', remaining: 30 - d };
    if (d < 60) return { label: 'Platina (60 dias) → R$ 40,00', remaining: 60 - d };
    if (d < 100) return { label: 'Diamante (100 dias) → R$ 100,00', remaining: 100 - d };
    return { label: 'Máximo atingido!', remaining: 0 };
  }, [metrics.validDays]);

  const canPix = metrics.validDays >= 5 && metrics.availableCents >= 100;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-xl">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Progresso de Recompensas</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-4 space-y-3">
          {/* Status da Call */}
          <div className="rounded-md bg-zinc-900/60 p-3 border border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300">Status da Call:</span>
              <span className={`text-sm font-semibold ${
                metrics.isInCall ? 'text-green-400' : 'text-red-400'
              }`}>
                {metrics.isInCall ? '🎤 Ativa na Call' : '❌ Não está na Call'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {metrics.isInCall 
                ? 'Tempo sendo contabilizado em tempo real!' 
                : 'Entre na call "Call" para começar a contabilizar tempo'
              }
            </p>
          </div>

          <div className="rounded-md bg-zinc-900/60 p-3 border border-zinc-700">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-300">Tempo em call hoje:</span>
                <span className={`text-sm font-semibold ${
                  metrics.todaySeconds >= 18000 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {formatDuration(metrics.todaySeconds)}
                  {metrics.todaySeconds >= 18000 && ' ✅'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-300">Status do dia:</span>
                <span className={`text-sm font-semibold ${
                  metrics.todaySeconds >= 18000 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {metrics.todaySeconds >= 18000 ? '✅ Dia Validado' : '⏳ Em andamento'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-300">Dias válidos:</span>
                <span className="text-sm font-semibold text-blue-400">{metrics.validDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-300">Valor disponível:</span>
                <span className="text-sm font-semibold text-yellow-400">R$ {(metrics.availableCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-300">Próxima recompensa:</span>
                <span className="text-sm font-semibold text-purple-400">{nextReward.label}</span>
              </div>
              {nextReward.remaining > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-300">Dias restantes:</span>
                  <span className="text-sm font-semibold text-orange-400">{nextReward.remaining} dias</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Barra de progresso para próxima recompensa */}
          <div className="rounded-md bg-zinc-900/60 p-3 border border-zinc-700">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Progresso para próxima recompensa</span>
                <span>{metrics.validDays} / {nextReward.remaining + metrics.validDays}</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (metrics.validDays / (nextReward.remaining + metrics.validDays)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Barra de progresso para tempo diário em call */}
          <div className="rounded-md bg-zinc-900/60 p-3 border border-zinc-700">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Progresso diário (5h para validar o dia)</span>
                <span>{formatDuration(metrics.todaySeconds)} / 5h 0m 0s</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (metrics.todaySeconds / 18000) * 100)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Meta: 5 horas</span>
                <span className={`font-semibold ${
                  metrics.todaySeconds >= 18000 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {metrics.todaySeconds >= 18000 ? '✅ Dia Validado!' : '⏳ Em andamento...'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 pb-6 gap-2">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button variant="secondary" onClick={() => onOpen('rewardsLeaderboard')}>Classificação</Button>
          <Button disabled={!canPix} onClick={() => onOpen('pix')}>PIX</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


