"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Trophy, Award, Medal } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

type Row = { rank: number; name: string; seconds: number; amountCents: number };

const formatDuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
};

export const RewardsLeaderboardModal = () => {
  const { isOpen, onClose, type } = useModal();
  const open = isOpen && type === "rewardsLeaderboard";
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/api/rewards/leaderboard", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setRows((data.items || []).slice(0, 10));
      } catch {}
    })();
  }, [open]);

  // Atualizar classificação quando houver atualização de progresso
  useEffect(() => {
    if (!open) return;
    const refresh = async () => {
      try {
        const res = await fetch("/api/rewards/leaderboard", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setRows((data.items || []).slice(0, 10));
      } catch {}
    };
    window.addEventListener('rewardsProgressUpdated', refresh as EventListener);
    return () => window.removeEventListener('rewardsProgressUpdated', refresh as EventListener);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-xl">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" /> Classificação - Top 10
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="divide-y divide-zinc-800 rounded-md overflow-hidden border border-zinc-800">
            {rows.map((r) => {
              const highlight = r.rank === 1 ? "bg-yellow-500/10" : r.rank === 2 ? "bg-gray-500/10" : r.rank === 3 ? "bg-amber-800/10" : "";
              const icon = r.rank === 1 ? <Award className="h-4 w-4 text-yellow-400" /> : r.rank === 2 ? <Medal className="h-4 w-4 text-gray-300" /> : r.rank === 3 ? <Medal className="h-4 w-4 text-amber-600" /> : null;
              return (
                <div key={r.rank} className={`flex items-center justify-between px-4 py-3 ${highlight}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm text-zinc-400">#{r.rank}</span>
                    {icon}
                    <span className="text-sm font-semibold text-zinc-200">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-zinc-400">Tempo: <span className="text-zinc-200 font-semibold">{formatDuration(r.seconds)}</span></span>
                    <span className="text-zinc-400">Ganhos: <span className="text-green-400 font-semibold">R$ {(r.amountCents/100).toFixed(2)}</span></span>
                  </div>
                </div>
              );
            })}
            {!rows.length && (
              <div className="px-4 py-6 text-center text-sm text-zinc-400">Sem dados ainda.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


