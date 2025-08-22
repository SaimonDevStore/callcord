"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback } from "react";
import axios from "axios";

export const useNitroCommands = () => {
  const { user } = useUser();

  const processNitroCommand = useCallback(async (content: string) => {
    if (!user) return null;

    // Verificar se é o dono do site
    const isOwner = user.emailAddresses[0]?.emailAddress === "saimonscheibler1999@gmail.com";
    if (!isOwner) return null;

    const trimmedContent = content.trim();

    // Comando /darnitro <nitro1|nitro2|nitro3> <nick> <dias> [nickname_personalizado]
    if (trimmedContent.startsWith("/darnitro ")) {
      const parts = trimmedContent.split(" ");
      if (parts.length < 4) {
        return { type: "error", message: "Uso: /darnitro <nitro1|nitro2|nitro3> <nick> <dias> [nickname_personalizado]" };
      }

      const plan = parts[1].toLowerCase();
      const targetNick = parts[2];
      const days = parseInt(parts[3]);
      const customNickname = parts.slice(4).join(" ") || null;

      if (isNaN(days) || days <= 0) {
        return {
          type: "error",
          message: "Dias deve ser um número positivo"
        };
      }

      try {
        // Buscar usuário pelo nick
        const response = await axios.get(`/api/profiles/search?search=${targetNick}`);
        if (!response.data || response.data.length === 0) {
          return {
            type: "error",
            message: `Usuário "${targetNick}" não encontrado`
          };
        }
        
        const user = response.data[0]; // Pegar o primeiro resultado

        // Apenas informativo: tag/benefícios são aplicados via isNitro global; planos ficam para a cobrança futura
        let planName = "Callcord Flux ⚡";
        let planCode: 'FLUX' | 'NEBULA' | 'QUANTUM' = 'FLUX';
        if (plan === "nitro2") { planName = "Callcord Nebula 🌌"; planCode = 'NEBULA'; }
        if (plan === "nitro3") { planName = "Callcord Quantum ⚛️"; planCode = 'QUANTUM'; }

        // Conceder Nitro
        await axios.post("/api/nitro", {
          action: "grant",
          targetProfileId: user.id,
          days,
          customNickname,
          plan: planCode
        });

        return {
          type: "success",
          message: `${planName} concedido para ${targetNick} por ${days} dias${customNickname ? ` com nickname "${customNickname}"` : ""}`
        };
      } catch (error) {
        console.error("Erro ao conceder Nitro:", error);
        return {
          type: "error",
          message: "Erro ao conceder Nitro"
        };
      }
    }

    // Comando /removernitro
    if (trimmedContent.startsWith("/removernitro ")) {
      const parts = trimmedContent.split(" ");
      if (parts.length < 2) {
        return {
          type: "error",
          message: "Uso: /removernitro <nick>"
        };
      }

      const targetNick = parts[1];

      try {
        // Buscar usuário pelo nick
        const response = await axios.get(`/api/profiles/search?search=${targetNick}`);
        if (!response.data || response.data.length === 0) {
          return {
            type: "error",
            message: `Usuário "${targetNick}" não encontrado`
          };
        }
        
        const user = response.data[0]; // Pegar o primeiro resultado

        // Remover Nitro
        await axios.post("/api/nitro", {
          action: "revoke",
          targetProfileId: user.id
        });

        return {
          type: "success",
          message: `Nitro removido de ${targetNick}`
        };
      } catch (error) {
        console.error("Erro ao remover Nitro:", error);
        return {
          type: "error",
          message: "Erro ao remover Nitro"
        };
      }
    }

    return null;
  }, [user]);

  return { processNitroCommand };
};
