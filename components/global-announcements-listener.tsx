"use client";

import { useGlobalAnnouncements } from "@/hooks/use-global-announcements";

export const GlobalAnnouncementsListener = () => {
  // Este componente apenas inicializa o hook para escutar avisos
  // O hook cuida de toda a lógica de exibição
  useGlobalAnnouncements();
  
  // Não renderiza nada visualmente
  return null;
};
