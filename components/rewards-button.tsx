"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from "react";

export const RewardsButton = () => {
  const { onOpen } = useModal();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar se já concordou
  useEffect(() => {
    const checkAgreement = async () => {
      try {
        const res = await fetch('/api/rewards');
        if (res.ok) {
          const data = await res.json();
          setHasAgreed(data.hasAgreed || false);
        }
      } catch (error) {
        console.error('Erro ao verificar acordo:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAgreement();

    // Escutar evento de acordo
    const handleRewardsAgreed = () => {
      setHasAgreed(true);
      setLoading(false);
    };

    window.addEventListener('rewardsAgreed', handleRewardsAgreed);
    return () => window.removeEventListener('rewardsAgreed', handleRewardsAgreed);
  }, []);

  // Verificar se está na call "Call" para mostrar informações relevantes
  const [isInCall, setIsInCall] = useState(false);
  
  useEffect(() => {
    const checkCallStatus = () => {
      const persistentCall = localStorage.getItem('persistentCall');
      setIsInCall(!!persistentCall);
    };
    
    checkCallStatus();
    window.addEventListener('storage', checkCallStatus);
    return () => window.removeEventListener('storage', checkCallStatus);
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Button
          disabled
          className="w-full bg-gradient-to-r from-amber-500 via-fuchsia-500 to-purple-600 text-white font-bold shadow-lg opacity-50"
        >
          Carregando...
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 flex flex-col items-start min-h-[120px]">
      {!hasAgreed ? (
        <Button
          onClick={() => onOpen("rewards")}
          className="w-full bg-gradient-to-r from-amber-500 via-fuchsia-500 to-purple-600 hover:from-amber-400 hover:via-fuchsia-400 hover:to-purple-500 text-white font-bold shadow-lg"
        >
          Sistema de Recompensas
        </Button>
      ) : (
        <div className="flex flex-col items-start space-y-3 w-full">
          <Button
            onClick={() => onOpen("rewardsProgress")}
            className="w-5/6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold shadow-lg py-3 text-left pl-2"
          >
            Ver Progresso
          </Button>
          <Button
            onClick={() => onOpen("rewards")}
            variant="outline"
            className="w-5/6 text-xs py-2 border-zinc-600 hover:border-zinc-500 hover:bg-zinc-700 text-left pl-2"
          >
            Ver Regras
          </Button>
        </div>
      )}
    </div>
  );
};


