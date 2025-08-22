"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { toast } from "sonner";

interface GlobalAnnouncement {
  id: string;
  message: string;
  author: string;
  timestamp: string;
}

export const useGlobalAnnouncements = () => {
  const { socket } = useSocket();
  const [announcements, setAnnouncements] = useState<GlobalAnnouncement[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Escutar avisos globais
    socket.on("global-announcement", (announcement: GlobalAnnouncement) => {
      console.log("Aviso global recebido:", announcement);
      
      // Adicionar à lista de avisos
      setAnnouncements(prev => [announcement, ...prev]);
      
      // Mostrar toast de aviso global
      toast.info(
        `📢 AVISO GLOBAL\n\n${announcement.message}\n\nPor: ${announcement.author} • ${new Date(announcement.timestamp).toLocaleString('pt-BR')}`,
        {
          duration: 10000, // 10 segundos
          position: "top-center",
          style: {
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "white",
            border: "2px solid #92400e",
            whiteSpace: "pre-line",
            fontSize: "14px",
            fontWeight: "500",
          },
        }
      );
    });

    // Cleanup
    return () => {
      socket.off("global-announcement");
    };
  }, [socket]);

  return { announcements };
};
