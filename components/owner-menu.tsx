"use client";

import { Shield, Gavel, Ban, Hammer, Sparkles, Stars, Banknote, Megaphone } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

async function apiCall(url: string, method: string, body?: any) {
  try {
    console.log(`[API_CALL] ${method} ${url}`, body ? { body } : '');
    
    const res = await fetch(url, { 
      method, 
      headers: { 
        "Content-Type": "application/json" 
      }, 
      body: body ? JSON.stringify(body) : undefined 
    });
    
    console.log(`[API_CALL] Response status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API_CALL] Error ${res.status}: ${errorText}`);
      throw new Error(`Erro ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log(`[API_CALL] Success:`, data);
    return data;
  } catch (error) {
    console.error(`[API_CALL] Exception:`, error);
    throw error;
  }
}

type OwnerMenuProps = {
  serverId?: string;
};

const commands = [
  { key: "castigo", label: "/castigo (usuario)", description: "Bloqueia o usuário por 1 minuto" },
  { key: "ban", label: "/ban (usuario)", description: "Bane o usuário do servidor" },
  { key: "banip", label: "/banip (usuario)", description: "Ban permanente e bloqueio de novas contas" },
  { key: "darcargo", label: "/darcargo (cargo) (usuario)", description: "Atribui um cargo rapidamente" },
  { key: "darnitro", label: "/darnitro (usuario) (dias) [apelido]", description: "Concede Nitro" },
  { key: "apagarmsg", label: "/apagarmsg (usuario)", description: "Apaga mensagens de qualquer membro" },
];

export const OwnerMenu = ({ serverId }: OwnerMenuProps) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const isOwner = user?.emailAddresses?.[0]?.emailAddress === "saimonscheibler1999@gmail.com";
  const params = useParams();
  const currentServerId = (serverId as string) || (params?.serverId as string) || "";
  const { onOpen } = useModal();

  if (!isOwner) return null;

  return (
    <div className="w-full px-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Crown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" sideOffset={10} className="w-80 max-h-[60vh] overflow-y-auto bg-zinc-900 text-white border-zinc-700">
          <div className="space-y-2">
            {/* /castigo */}
            <div className="p-2 rounded-md bg-zinc-800/60 border border-zinc-700/40">
              <div className="flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2"><Gavel className="h-4 w-4 text-yellow-500" /><span>/castigo (usuario)</span></div>
                <button className="text-xs px-2 py-1 bg-zinc-700 rounded" onClick={async () => {
                  try {
                    const nick = prompt("Usuário (nick)") || "";
                    if (!nick) return;
                    
                    console.log(`[CASTIGO] Buscando usuário: ${nick}`);
                    const data = await apiCall(`/api/profiles/search?search=${encodeURIComponent(nick)}&serverId=${currentServerId}`, 'GET');
                    
                    if (!data || data.length === 0) {
                      alert('Usuário não encontrado neste servidor');
                      return;
                    }
                    
                    const user = data[0];
                    console.log(`[CASTIGO] Usuário encontrado: ${user.name} (${user.id})`);
                    
                    await apiCall(`/api/members/${user.id}?serverId=${currentServerId}`, 'PATCH', { action: 'mute:1m' });
                    alert('Castigo aplicado por 1 minuto');
                  } catch (erro) {
                    console.error('[CASTIGO] Erro:', erro);
                    alert(`Erro ao aplicar castigo: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}`);
                  }
                }}>Executar</button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Bloqueia o usuário por 1 minuto</p>
            </div>

            {/* /ban */}
            <div className="p-2 rounded-md bg-zinc-800/60 border border-zinc-700/40">
              <div className="flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2"><Ban className="h-4 w-4 text-rose-500" /><span>/ban (usuario)</span></div>
                <button className="text-xs px-2 py-1 bg-zinc-700 rounded" onClick={async () => {
                  try {
                    const nick = prompt("Usuário (nick)") || "";
                    if (!nick) return;
                    
                    console.log(`[BAN] Buscando usuário: ${nick}`);
                    const data = await apiCall(`/api/profiles/search?search=${encodeURIComponent(nick)}&serverId=${currentServerId}`, 'GET');
                    
                    if (!data || data.length === 0) {
                      alert('Usuário não encontrado neste servidor');
                      return;
                    }
                    
                    const user = data[0];
                    console.log(`[BAN] Usuário encontrado: ${user.name} (${user.id})`);
                    
                    await apiCall(`/api/members/${user.id}?serverId=${currentServerId}`, 'PATCH', { action: 'ban' });
                    alert('Usuário banido com sucesso!');
                  } catch (erro) {
                    console.error('[BAN] Erro:', erro);
                    alert(`Erro ao banir usuário: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}`);
                  }
                }}>Executar</button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Bane o usuário do servidor</p>
            </div>

            {/* /darcargo */}
            <div className="p-2 rounded-md bg-zinc-800/60 border border-zinc-700/40">
              <div className="flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2"><Hammer className="h-4 w-4 text-blue-500" /><span>/darcargo (cargo) (usuario)</span></div>
                <button className="text-xs px-2 py-1 bg-zinc-700 rounded" onClick={async () => {
                  try {
                    const nick = prompt("Usuário (nick)") || "";
                    if (!nick) return;
                    
                    const cargo = (prompt("Cargo (GUEST|MEMBER|MODERATOR|ADMIN|VIP|FRIEND)") || '').toUpperCase();
                    if (!cargo) return;
                    
                    console.log(`[DARCARGO] Buscando usuário: ${nick}`);
                    const data = await apiCall(`/api/profiles/search?search=${encodeURIComponent(nick)}&serverId=${currentServerId}`, 'GET');
                    
                    if (!data || data.length === 0) {
                      alert('Usuário não encontrado neste servidor');
                      return;
                    }
                    
                    const user = data[0];
                    console.log(`[DARCARGO] Usuário encontrado: ${user.name} (${user.id})`);
                    console.log(`[DARCARGO] Atribuindo cargo: ${cargo}`);
                    
                    await apiCall(`/api/members/${user.id}?serverId=${currentServerId}`, 'PATCH', { role: cargo });
                    alert(`Cargo ${cargo} atribuído com sucesso!`);
                  } catch (erro) {
                    console.error('[DARCARGO] Erro:', erro);
                    alert(`Erro ao atribuir cargo: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}`);
                  }
                }}>Executar</button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Atribui um cargo rapidamente</p>
            </div>

            {/* /darnitro */}
            <div className="p-2 rounded-md bg-zinc-800/60 border border-zinc-700/40">
              <div className="flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2"><Stars className="h-4 w-4 text-fuchsia-500" /><span>/darnitro (plano) (usuario) (dias)</span></div>
                <button className="text-xs px-2 py-1 bg-zinc-700 rounded" onClick={async () => {
                  try {
                    const plan = (prompt("Plano (nitro1|nitro2|nitro3)") || '').toLowerCase();
                    const nick = prompt("Usuário (nick)") || "";
                    const days = parseInt(prompt("Dias") || '0', 10);
                    
                    if (!plan || !nick || !days) {
                      alert('Todos os campos são obrigatórios');
                      return;
                    }
                    
                    console.log(`[DARNITRO] Buscando usuário: ${nick}`);
                    const resp = await apiCall(`/api/profiles/search?search=${encodeURIComponent(nick)}`, 'GET');
                    
                    if (!resp || resp.length === 0) {
                      alert('Usuário não encontrado');
                      return;
                    }
                    
                    const user = resp[0];
                    console.log(`[DARNITRO] Usuário encontrado: ${user.name} (${user.id})`);
                    
                    const planCode = plan === 'nitro2' ? 'NEBULA' : plan === 'nitro3' ? 'QUANTUM' : 'FLUX';
                    console.log(`[DARNITRO] Concedendo plano: ${planCode} por ${days} dias`);
                    
                    await apiCall('/api/nitro', 'POST', { action: 'grant', targetProfileId: user.id, days, plan: planCode });
                    alert('Nitro concedido com sucesso!');
                  } catch (erro) {
                    console.error('[DARNITRO] Erro:', erro);
                    alert(`Erro ao conceder Nitro: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}`);
                  }
                }}>Executar</button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Concede Nitro conforme o plano</p>
            </div>
            {/* Aviso Global */}
            <div className="p-2 rounded-md bg-zinc-800/60 border border-zinc-700/40">
              <div className="flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-red-500" /><span>Aviso Global</span></div>
                <button className="text-xs px-2 py-1 bg-zinc-700 rounded" onClick={() => onOpen('globalAnnouncement')}>Abrir</button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Enviar aviso para TODOS os usuários</p>
            </div>

            {/* Solicitações de Saque */}
            <div className="p-2 rounded-md bg-zinc-800/60 border border-zinc-700/40">
              <div className="flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2"><Banknote className="h-4 w-4 text-green-500" /><span>Solicitações de Saque</span></div>
                <button className="text-xs px-2 py-1 bg-zinc-700 rounded" onClick={() => onOpen('ownerPayouts')}>Abrir</button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Ver pedidos de PIX pendentes e zerar saldo</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};


