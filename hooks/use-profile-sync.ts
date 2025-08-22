import { useUser } from "@clerk/nextjs";
import { useCallback } from "react";
import axios from "axios";

export const useProfileSync = () => {
  const { user } = useUser();

  const syncProfile = useCallback(async () => {
    try {
      await axios.post("/api/profile/sync");
      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error) {
      console.error("Erro ao sincronizar perfil:", error);
    }
  }, []);

  return { syncProfile };
};
