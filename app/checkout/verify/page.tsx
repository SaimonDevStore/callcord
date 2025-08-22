"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function VerifyCheckoutPage() {
  const search = useSearchParams();
  const router = useRouter();
  const serverId = search?.get("serverId") || "";

  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [serverId]);

  const onPay = async () => {
    try {
      setLoading(true);
      // Simula pagamento bem sucedido
      await new Promise((r) => setTimeout(r, 1200));
      setPaid(true);
      // Marca o servidor como verificado
      await axios.patch("/api/servers", { serverId });
      router.push(`/servers/${serverId}`);
    } catch (e) {
      setError("Falha ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const onFreeForOfficial = async () => {
    try {
      setLoading(true);
      // recurso removido
      setError("Recurso removido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f0f12] to-[#1b1b21]">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-white shadow-2xl">
        <h1 className="text-2xl font-bold">Comprar verificado</h1>
        <p className="mt-2 text-zinc-400">Ative o selo de verificado para seu servidor.</p>
        <div className="mt-6 rounded-lg border border-zinc-800 p-4 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Custo único</p>
              <p className="text-lg font-semibold">R$ 100,00</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Button disabled className="bg-zinc-700">Indisponível</Button>
        </div>
        {error && <p className="mt-3 text-rose-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}


