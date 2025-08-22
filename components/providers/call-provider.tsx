"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useVoiceStore } from "@/hooks/use-voice-store";

type CallContextType = {
  isInCall: boolean;
  currentRoomId: string | null;
  joinCall: (roomId: string) => void;
  leaveCall: () => void;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [persistentCall, setPersistentCall] = useState<string | null>(null);
  const { connected, roomId } = useVoiceStore();

  // Sincronizar com o voice store
  useEffect(() => {
    console.log(`[CALL_PROVIDER] Voice store changed: connected=${connected}, roomId=${roomId}`);
    
    if (connected && roomId) {
      console.log(`[CALL_PROVIDER] User connected to room: ${roomId}`);
      setIsInCall(true);
      setCurrentRoomId(roomId);
      // Salvar call persistente no localStorage
      setPersistentCall(roomId);
      localStorage.setItem('persistentCall', roomId);
      
      // Disparar evento para iniciar progresso de recompensa
      window.dispatchEvent(new CustomEvent('rewardsProgressUpdated', { 
        detail: { isInCall: true, roomId } 
      }));
    } else if (!connected && !roomId) {
      console.log(`[CALL_PROVIDER] User disconnected, clearing call state`);
      // Se desconectou e não há roomId, limpar estado da call
      setIsInCall(false);
      setCurrentRoomId(null);
      setPersistentCall(null);
      localStorage.removeItem('persistentCall');
      
      // Disparar evento para parar progresso de recompensa
      window.dispatchEvent(new CustomEvent('rewardsProgressUpdated', { 
        detail: { isInCall: false, currentCallTime: 0, roomId: null } 
      }));
    }
  }, [connected, roomId]);

  // Restaurar call persistente ao carregar apenas se estiver conectado
  useEffect(() => {
    const savedCall = localStorage.getItem('persistentCall');
    if (savedCall && connected) {
      console.log(`[CALL_PROVIDER] Restoring persistent call: ${savedCall}`);
      setPersistentCall(savedCall);
      setCurrentRoomId(savedCall);
      setIsInCall(true);
    }
  }, [connected]);

  // Persistir call no localStorage sempre que mudar
  useEffect(() => {
    if (isInCall && currentRoomId) {
      console.log(`[CALL_PROVIDER] Persisting call: ${currentRoomId}`);
      localStorage.setItem('persistentCall', currentRoomId);
    } else if (!isInCall) {
      console.log(`[CALL_PROVIDER] Clearing persistent call`);
      localStorage.removeItem('persistentCall');
    }
  }, [isInCall, currentRoomId]);

  const joinCall = (roomId: string) => {
    setCurrentRoomId(roomId);
    setIsInCall(true);
  };

  const leaveCall = () => {
    setCurrentRoomId(null);
    setIsInCall(false);
    setPersistentCall(null);
    localStorage.removeItem('persistentCall');
  };

  return (
    <CallContext.Provider value={{ isInCall, currentRoomId, joinCall, leaveCall }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
