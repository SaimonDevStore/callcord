"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type PinnedBarProps = {
  channelId: string;
};

export const PinnedBar = ({ channelId }: PinnedBarProps) => {
  const [items, setItems] = useState<Array<{ id: string; content: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/messages/pinned?channelId=${channelId}`);
        setItems((res.data.items || []).map((m: any) => ({ id: m.id, content: m.content })));
      } catch {}
    })();
  }, [channelId]);

  if (!items.length) return null;

  return (
    <div className="px-4 py-2 bg-zinc-800/50 text-xs text-zinc-200 flex items-center gap-3 overflow-x-auto">
      {items.map((m) => (
        <span key={m.id} className="px-2 py-1 bg-zinc-700 rounded whitespace-nowrap">
          {m.content}
        </span>
      ))}
    </div>
  );
};


