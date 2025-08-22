"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback } from "react";
import axios from "axios";

export const useModerationCommands = () => {
  const { user } = useUser();

  const processModerationCommand = useCallback(async (content: string, serverId?: string) => {
    if (!user) return null;
    const isOwner = user.emailAddresses[0]?.emailAddress === "saimonscheibler1999@gmail.com";
    if (!isOwner) return null;

    const input = content.trim();
    // removido: /verificadoativar

    // /castigo <nick>
    if (input.startsWith("/castigo ")) {
      const nick = input.split(" ")[1];
      if (!nick || !serverId) return { type: "error", message: "Uso: /castigo <nick>" };
      const { data } = await axios.get(`/api/profiles/search?search=${encodeURIComponent(nick)}${serverId ? `&serverId=${serverId}` : ""}`);
      if (!data || data.length === 0) return { type: "error", message: "Usuário não encontrado" };
      const user = data[0];
      await axios.patch(`/api/members/${user.id}?serverId=${serverId}`, { action: "mute:1m" });
      return { type: "success", message: `${nick} silenciado por 1 minuto` };
    }

    // /ban <nick>
    if (input.startsWith("/ban ")) {
      const nick = input.split(" ")[1];
      if (!nick || !serverId) return { type: "error", message: "Uso: /ban <nick>" };
      const { data } = await axios.get(`/api/profiles/search?search=${encodeURIComponent(nick)}${serverId ? `&serverId=${serverId}` : ""}`);
      if (!data || data.length === 0) return { type: "error", message: "Usuário não encontrado" };
      const user = data[0];
      await axios.patch(`/api/members/${user.id}?serverId=${serverId}`, { action: "ban" });
      return { type: "success", message: `${nick} banido do servidor` };
    }

    // /banip <nick> (simplificado: ban por email)
    if (input.startsWith("/banip ")) {
      const nick = input.split(" ")[1];
      if (!nick) return { type: "error", message: "Uso: /banip <nick>" };
      // Para simplificar, reaproveitar /api/nitro como placeholder futuro, ou implementar endpoint dedicado
      return { type: "error", message: "banip permanente de contas requer backend persistente; implementar endpoint dedicado" };
    }

    // /darcargo <nick> <cargo>
    if (input.startsWith("/darcargo ")) {
      const parts = input.split(" ");
      if (parts.length < 3 || !serverId) return { type: "error", message: "Uso: /darcargo <nick> <cargo>" };
      const nick = parts[1];
      const cargo = parts.slice(2).join(" ").toUpperCase();
      const { data } = await axios.get(`/api/profiles/search?search=${encodeURIComponent(nick)}${serverId ? `&serverId=${serverId}` : ""}`);
      if (!data || data.length === 0) return { type: "error", message: "Usuário não encontrado" };
      const user = data[0];
      await axios.patch(`/api/members/${user.id}?serverId=${serverId}`, { role: cargo });
      return { type: "success", message: `Cargo ${cargo} atribuído a ${nick}` };
    }

    // /criarcargo <cargo>  (exclusivo Dono) → cria/define cargo personalizado para o próprio Dono no servidor atual
    if (input.startsWith("/criarcargo ")) {
      if (!serverId) return { type: "error", message: "Uso: /criarcargo <cargo> (abra um servidor)" };
      const cargoNome = input.replace("/criarcargo", "").trim();
      if (!cargoNome) return { type: "error", message: "Uso: /criarcargo <cargo>" };

      // Descobrir o memberId do próprio usuário no servidor atual
      const [{ data: me }, { data: membersResp }] = await Promise.all([
        axios.get("/api/profile"),
        axios.get(`/api/servers/${serverId}/members`),
      ]);

      const myProfileId = me?.id;
      const list = (membersResp.members || membersResp) as Array<{ id: string; profile: { id: string } }>;
      const myMember = list.find((m) => m.profile.id === myProfileId);
      if (!myMember) return { type: "error", message: "Seu membro não foi localizado neste servidor" };

      // Define o cargo personalizado no próprio membro (cor padrão cinza)
      await axios.patch(`/api/members/${myMember.id}?serverId=${serverId}`, {
        customRole: cargoNome,
        roleColor: "#95A5A6",
      });

      return { type: "success", message: `Cargo "${cargoNome}" criado para o Dono` };
    }

    // /tirarcastigo <nick>
    if (input.startsWith("/tirarcastigo ")) {
      const nick = input.split(" ")[1];
      if (!nick || !serverId) return { type: "error", message: "Uso: /tirarcastigo <nick>" };
      const { data } = await axios.get(`/api/profiles/search?search=${encodeURIComponent(nick)}`);
      if (!data || data.length === 0) return { type: "error", message: "Usuário não encontrado" };
      const user = data[0];
      await axios.patch(`/api/members/${user.id}?serverId=${serverId}`, { action: "unmute" });
      return { type: "success", message: `${nick} teve o castigo removido` };
    }

    // /unban <nick>
    if (input.startsWith("/unban ")) {
      const nick = input.split(" ")[1];
      if (!nick || !serverId) return { type: "error", message: "Uso: /unban <nick>" };
      const { data } = await axios.get(`/api/profiles/search?search=${encodeURIComponent(nick)}`);
      if (!data || data.length === 0) return { type: "error", message: "Usuário não encontrado" };
      const user = data[0];
      await axios.patch(`/api/members/${user.id}?serverId=${serverId}`, { action: "unban" });
      return { type: "success", message: `${nick} desbanido do servidor` };
    }

    // /unbanip <nick>
    if (input.startsWith("/unbanip ")) {
      const nick = input.split(" ")[1];
      if (!nick) return { type: "error", message: "Uso: /unbanip <nick>" };
      return { type: "error", message: "unbanip requer backend persistente; implementar endpoint dedicado" };
    }

    // /tirarcargo <nick> <cargo>
    if (input.startsWith("/tirarcargo ")) {
      const parts = input.split(" ");
      if (parts.length < 3 || !serverId) return { type: "error", message: "Uso: /tirarcargo <nick> <cargo>" };
      const nick = parts[1];
      const cargo = parts.slice(2).join(" ").toUpperCase();
      const { data } = await axios.get(`/api/profiles/search?search=${encodeURIComponent(nick)}`);
      if (!data || data.length === 0) return { type: "error", message: "Usuário não encontrado" };
      const user = data[0];
      // Para simplificar, se tirarcargo for ADMIN/MODERATOR etc., rebaixa para MEMBER
      await axios.patch(`/api/members/${user.id}?serverId=${serverId}`, { role: "MEMBER" });
      return { type: "success", message: `Cargo ${cargo} removido de ${nick}` };
    }

    // /tirarnitro <nick>
    if (input.startsWith("/tirarnitro ")) {
      const parts = input.split(" ");
      const nick = parts[1];
      if (!nick) return { type: "error", message: "Uso: /tirarnitro <nick>" };
      const response = await axios.get(`/api/profiles/search?search=${encodeURIComponent(nick)}${serverId ? `&serverId=${serverId}` : ""}`);
      if (!response.data || response.data.length === 0) return { type: "error", message: `Usuário "${nick}" não encontrado` };
      const user = response.data[0];
      await axios.post("/api/nitro", { action: "revoke", targetProfileId: user.id });
      return { type: "success", message: `Nitro removido de ${nick}` };
    }

    return null;
  }, [user]);

  return { processModerationCommand };
};


