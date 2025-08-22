"use client";

import { Mic, MicOff, Video, VideoOff, Gamepad2, Settings, Wifi, Users } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/hooks/use-voice-store";
import { useLiveKitUsers } from "@/hooks/use-livekit-users";
import { useMemo } from "react";

type VoiceStatusBarProps = {
  currentRoomId?: string | null;
  profileName?: string;
  profileImageUrl?: string;
};

export const VoiceStatusBar = ({ currentRoomId, profileName, profileImageUrl }: VoiceStatusBarProps) => {
  const { user } = useUser();
  const { connected, roomId, isMicMuted, isCamMuted, setMicMuted, setCamMuted } = useVoiceStore();
  const effectiveRoomId = currentRoomId || roomId || "";
  const users = useLiveKitUsers(effectiveRoomId);

  const others = useMemo(() => users.map((u) => u.name).filter(Boolean).join(", "), [users]);

  const displayName = (profileName || user?.fullName || "").replace(/^@/, "") || "Perfil";
  const avatarUrl = profileImageUrl || user?.imageUrl || "";

  return (
    <div className="p-3 rounded-md bg-zinc-900 text-white border border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-zinc-800">
          {avatarUrl && (
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold break-words">{displayName}</span>
            <span className={cn("h-2.5 w-2.5 rounded-full", connected ? "bg-green-500" : "bg-zinc-500")} />
          </div>
          <div className="text-[11px] text-zinc-400 truncate">
            {connected ? (
              <span className="inline-flex items-center gap-1"><Wifi className="h-3 w-3" /> Voz conectada</span>
            ) : (
              <span>Disponível</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setMicMuted(!isMicMuted)} className="p-2 rounded bg-zinc-800 hover:bg-zinc-700" title={isMicMuted ? "Microfone desativado" : "Microfone ativado"}>
            {isMicMuted ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4" />}
          </button>
          <button onClick={() => setCamMuted(!isCamMuted)} className="p-2 rounded bg-zinc-800 hover:bg-zinc-700" title={isCamMuted ? "Câmera desativada" : "Câmera ativada"}>
            {isCamMuted ? <VideoOff className="h-4 w-4 text-red-400" /> : <Video className="h-4 w-4" />}
          </button>
          <button className="p-2 rounded bg-zinc-800 hover:bg-zinc-700" title="Jogos">
            <Gamepad2 className="h-4 w-4" />
          </button>
          <button className="p-2 rounded bg-zinc-800 hover:bg-zinc-700" title="Configurações">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {connected && (
        <div className="mt-2 text-[12px] text-zinc-300 flex items-start gap-2">
          <Users className="h-4 w-4 mt-0.5 text-zinc-400" />
          <div className="truncate">{others || "Você"}</div>
        </div>
      )}
    </div>
  );
};


