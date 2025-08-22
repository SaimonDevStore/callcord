"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSocket } from "@/components/providers/socket-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { playIncomingCallSound } from "@/lib/sounds";

type NotificationItem = {
  id: string;
  type: "dm" | "call";
  fromName: string;
  fromProfileId: string;
  serverId: string;
  createdAt: number;
};

export const NotificationsDock = () => {
  const { user } = useUser();
  const { socket } = useSocket();
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);

  const myProfileId = useMemo(() => (user as any)?.publicMetadata?.profileId || null, [user]);

  useEffect(() => {
    if (!socket || !myProfileId) return;

    const onDm = (payload: any) => {
      const n: NotificationItem = {
        id: `${Date.now()}-${Math.random()}`,
        type: "dm",
        fromName: payload.fromName || "Usuário",
        fromProfileId: payload.fromProfileId,
        serverId: payload.serverId,
        createdAt: Date.now(),
      };
      setItems((prev) => [n, ...prev].slice(0, 20));
    };

    const onCall = (payload: any) => {
      try { playIncomingCallSound(); } catch {}
      const n: NotificationItem = {
        id: `${Date.now()}-${Math.random()}`,
        type: "call",
        fromName: payload.fromName || "Usuário",
        fromProfileId: payload.fromProfileId,
        serverId: payload.serverId,
        createdAt: Date.now(),
      };
      setItems((prev) => [n, ...prev].slice(0, 20));
    };

    socket.on(`dm:notify:${myProfileId}`, onDm);
    socket.on(`call:invite:${myProfileId}`, onCall);
    return () => {
      socket.off(`dm:notify:${myProfileId}`, onDm);
      socket.off(`call:invite:${myProfileId}`, onCall);
    };
  }, [socket, myProfileId]);

  const openItem = async (n: NotificationItem, withVideo: boolean) => {
    try {
      const res = await fetch(`/api/servers/${n.serverId}/members`);
      const data = await res.json();
      const list = (data.members || data) as Array<{ id: string; profile: { id: string } }>;
      const member = list.find((m) => m.profile.id === n.fromProfileId);
      if (member) {
        router.push(`/servers/${n.serverId}/conversations/${member.id}${withVideo ? '?video=true' : ''}`);
      }
    } catch {}
  };

  if (!items.length) return null;

  return (
    <div className="w-full px-2">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
        <Bell className="h-3 w-3" /> Notificações
      </div>
      <ScrollArea className="max-h-40 pr-2">
        <div className="space-y-1">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => openItem(n, n.type === 'call')}
              className="w-full text-left px-2 py-1.5 rounded bg-zinc-700/40 hover:bg-zinc-700/60 text-xs text-zinc-200 flex items-center gap-2"
            >
              {n.type === 'call' ? <Phone className="h-3.5 w-3.5 text-green-400" /> : <span className="inline-block w-3.5" />}
              <span><strong>{n.fromName}</strong> {n.type === 'call' ? 'iniciou uma ligação' : 'enviou uma mensagem'}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};


