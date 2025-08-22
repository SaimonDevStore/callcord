"use client";

import { useEffect, useState } from "react";

type ConnectedUser = {
  id: string;
  name: string;
};

export const useLiveKitUsers = (roomId: string) => {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  useEffect(() => {
    if (!roomId) {
      setConnectedUsers([]);
      return;
    }

    const fetchConnectedUsers = async () => {
      try {
        const response = await fetch(`/api/livekit/connected-users/${roomId}`);
        const data = await response.json();
        
        if (data.connectedUsers) {
          setConnectedUsers(data.connectedUsers);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários conectados:", error);
        setConnectedUsers([]);
      }
    };

    // Buscar usuários conectados imediatamente
    fetchConnectedUsers();

    // Atualizar a cada 5 segundos para manter a lista em tempo real
    const interval = setInterval(fetchConnectedUsers, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  return connectedUsers;
};
