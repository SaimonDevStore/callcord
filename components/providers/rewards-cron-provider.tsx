"use client";

import { useEffect } from "react";

export const RewardsCronProvider = () => {
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        await fetch('/api/rewards/cron', { method: 'POST' });
      } catch {}
    };
    // executa ao montar
    tick();
    // executa a cada 15 minutos
    const id = setInterval(() => { if (!cancelled) tick(); }, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);
  return null;
};


