"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, Gamepad2, Settings, Wifi, Users, ChevronDown, Edit3, Crown, Star, Heart } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/hooks/use-voice-store";
import { useLiveKitUsers } from "@/hooks/use-livekit-users";
import { useMemo } from "react";
import { useModal } from "@/hooks/use-modal-store";
import axios from "axios";
 

type FixedUserProfileProps = {
  profileName?: string;
  profileImageUrl?: string;
};

export const FixedUserProfile = ({ profileName, profileImageUrl }: FixedUserProfileProps) => {
  const { user } = useUser();
  const { connected, roomId, isMicMuted, isCamMuted, setMicMuted, setCamMuted } = useVoiceStore();
  const effectiveRoomId = roomId || "";
  const users = useLiveKitUsers(effectiveRoomId);
  const [status, setStatus] = useState("online");
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const { onOpen } = useModal();

  const others = useMemo(() => users.map((u) => u.name).filter(Boolean).join(", "), [users]);

  const displayName = (profileName || user?.fullName || "").replace(/^@/, "") || "Perfil";
  const avatarUrl = profileImageUrl || user?.imageUrl || "";

  // Buscar perfil atual para verificar status de Nitro
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        setCurrentProfile(response.data);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      }
    };
    fetchProfile();
  }, []);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "online":
        return "Disponível";
      case "busy":
        return "Ocupado";
      case "away":
        return "Ausente";
      case "invisible":
        return "Invisível";
      default:
        return "Offline";
    }
  }, [status]);

  const statusColor = useMemo(() => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      case "invisible":
        return "bg-zinc-400";
      default:
        return "bg-zinc-500";
    }
  }, [status]);

  const getRoleIcon = () => {
    if (user?.emailAddresses?.[0]?.emailAddress === "saimonscheibler1999@gmail.com") {
      return <Crown className="h-3 w-3 text-yellow-500" />;
    }
    if (currentProfile?.isNitro) {
      return <Star className="h-3 w-3 text-purple-500" />;
    }
    return null;
  };

  return (
    <div className="p-3 rounded-md bg-[#1E1F22] text-white border border-zinc-800">
      <div className="flex items-center gap-3">
        {/* Avatar do usuário */}
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-zinc-800">
          {avatarUrl && (
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
          )}
        </div>

        {/* Informações do usuário */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold break-words">{displayName}</span>
            {getRoleIcon()}
            <span className={cn("h-2.5 w-2.5 rounded-full", connected ? "bg-green-500" : "bg-zinc-500")} />
          </div>
          
          {/* Status inline (sem balão) - clicar para alternar */}
          <div
            className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-300 transition cursor-pointer select-none"
            onClick={() => {
              const order = ["online", "busy", "away", "invisible", "offline"] as const;
              const idx = Math.max(0, order.indexOf(status as any));
              const next = order[(idx + 1) % order.length];
              setStatus(next as any);
            }}
            title="Clique para alternar seu status"
          >
            <span className={cn("h-2 w-2 rounded-full", statusColor)} />
            <span className="truncate">{statusLabel}</span>
            <ChevronDown className="h-3 w-3 opacity-80" />
          </div>
        </div>

        {/* Controles de áudio/vídeo */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setMicMuted(!isMicMuted)} 
            className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 transition" 
            title={isMicMuted ? "Microfone desativado" : "Microfone ativado"}
          >
            {isMicMuted ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4" />}
          </button>
          <button className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 transition" title="Headset">
            <Gamepad2 className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onOpen("editBio")}
            className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 transition" 
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status da conexão de voz */}
      {connected && (
        <div className="mt-2 text-[12px] text-zinc-300 flex items-start gap-2">
          <Wifi className="h-4 w-4 mt-0.5 text-zinc-400" />
          <div className="flex items-center gap-2">
            <span>Voz conectada</span>
            {others && (
              <>
                <span className="text-zinc-500">•</span>
                <Users className="h-3 w-3 text-zinc-400" />
                <span className="truncate">{others}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Informações do Nitro */}
      {currentProfile?.isNitro && (
        <div className="mt-2 text-[11px] text-purple-300 flex items-center gap-1">
          <Star className="h-3 w-3" />
          <span>Nitro {currentProfile.nitroPlan || 'Ativo'}</span>
          {currentProfile.nitroExpiresAt && (
            <span className="text-zinc-400">
              • Expira em {new Date(currentProfile.nitroExpiresAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
