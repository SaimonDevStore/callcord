"use client";

import { useCall } from "@/components/providers/call-provider";
import { useVoiceStore } from "@/hooks/use-voice-store";
import { useEffect } from "react";

export const PersistentCall = () => {
  const { isInCall, currentRoomId } = useCall();
  const { connected, roomId } = useVoiceStore();

  // Se o usuário está em call mas não está conectado, tentar reconectar
  useEffect(() => {
    if (isInCall && currentRoomId && !connected) {
      console.log(`[PERSISTENT_CALL] Tentando reconectar à call: ${currentRoomId}`);
      // Aqui poderíamos implementar uma lógica de reconexão automática
      // Por enquanto, apenas log para debug
    }
  }, [isInCall, currentRoomId, connected]);

  // Se não está em call, não renderizar nada
  if (!isInCall || !currentRoomId) {
    return null;
  }

  const isConnected = connected && roomId === currentRoomId;
  const isPersistent = !isConnected && isInCall;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg shadow-lg text-sm ${
        isConnected ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
      }`}>
        {isConnected ? '🎤' : '⏸️'} 
        {isConnected ? 'Em call ativa' : 'Call em pausa'}: Call
        {isPersistent && <span className="ml-2 text-xs">(Navegando)</span>}
      </div>
    </div>
  );
};
