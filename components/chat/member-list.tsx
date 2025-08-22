"use client";

import { useEffect, useState } from "react";
import { Crown, Users, ShieldAlert, ShieldCheck, Star, Heart, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { ActionTooltip } from "@/components/action-tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

type Member = {
  id: string;
  role: string;
  profile: {
    id: string;
    name: string;
    imageUrl: string;
    email: string;
    isNitro?: boolean;
    nitroPlan?: string;
  };
};

type MemberListProps = {
  serverId?: string;
};

const roleIconMap = {
  OWNER: <Crown className="h-4 w-4 ml-2 text-yellow-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  MEMBER: <Users className="h-4 w-4 ml-2 text-blue-500" />,
  VIP: <Star className="h-4 w-4 ml-2 text-orange-500" />,
  FRIEND: <Heart className="h-4 w-4 ml-2 text-pink-500" />,
};

export const MemberList = ({ serverId }: MemberListProps) => {
  const params = useParams();
  const { onOpen } = useModal();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [callParticipants, setCallParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar membros do servidor
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const serverIdToUse = serverId || params?.serverId;
        if (!serverIdToUse) return;
        
        const response = await fetch(`/api/servers/${serverIdToUse}/members`);
        if (response.ok) {
          const data = await response.json();
          const list = (data.members || data) as Member[];
          const ownerPid = (data.ownerProfileId || null) as string | null;
          // Corrigir papel do Dono: marcar OWNER para o profileId do servidor
          const fixed = list.map(m => ({ ...m, role: ownerPid && m.profile.id === ownerPid ? 'OWNER' : m.role }));
          setMembers(fixed);
          setViewerRole(data.viewerRole || null);
        }
      } catch (error) {
        console.error('Erro ao buscar membros:', error);
      } finally {
        setLoading(false);
      }
    };

    const serverIdToUse = serverId || params?.serverId;
    if (serverIdToUse) {
      fetchMembers();
    }
  }, [serverId, params?.serverId]);

  // Buscar participantes da call atual
  useEffect(() => {
    const fetchCallParticipants = async () => {
      try {
        const response = await fetch(`/api/livekit/connected-users/${params?.channelId}`);
        if (response.ok) {
          const data = await response.json();
          setCallParticipants(data.participants || []);
        }
      } catch (error) {
        console.error('Erro ao buscar participantes da call:', error);
      }
    };

    if (params?.channelId) {
      fetchCallParticipants();
      // Atualizar a cada 5 segundos
      const interval = setInterval(fetchCallParticipants, 5000);
      return () => clearInterval(interval);
    }
  }, [params?.channelId]);

  const onMemberClick = (profile: any, joinedAt?: string | Date) => {
    onOpen("userProfile", { profile, joinedAt });
  };

  const onAssignRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}?serverId=${params?.serverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        // refresh list
        const response = await fetch(`/api/servers/${params?.serverId}/members`);
        const data = await response.json();
        setMembers(data.members || data);
      }
    } catch {}
  };

  // Atribuição de cargos: clique prolongado pode abrir menu (futuro). Por ora, respeitamos viewerRole e só mostramos destaque

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-zinc-700">
          <h3 className="text-sm font-semibold text-zinc-300">Membros</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-400 text-sm">Carregando...</div>
        </div>
      </div>
    );
  }

  // Agrupamento por categorias reais: Dono, NITROS e cargos existentes
  const isSaimon = (m: Member) => m.profile.email === "saimonscheibler1999@gmail.com" || m.profile.name?.replace(/^@/, "").toUpperCase() === "SAIMON";
  const isNitro = (m: Member) => !!m.profile.nitroPlan || !!m.profile.isNitro;

  const ownerGroup = members.filter(isSaimon);
  const nitroGroup = members.filter((m) => !isSaimon(m) && isNitro(m));
  const roleOrder = ["ADMIN", "MODERATOR", "VIP", "FRIEND", "MEMBER"] as const;
  const roleLabel: Record<string, string> = {
    OWNER: "Dono",
    ADMIN: "Admin",
    MODERATOR: "Ajudantes",
    VIP: "VIP",
    FRIEND: "Amigos",
    MEMBER: "Membros",
  };
  const roleGroups = roleOrder.map((role) => ({
    role,
    label: roleLabel[role],
    items: members.filter((m) => !isSaimon(m) && !isNitro(m) && (m.role || "").toUpperCase() === role),
  }));

  const isInCall = (m: Member) => callParticipants.includes(m.profile.name);

  const renderSection = (title: string, list: Member[]) => {
    if (!list.length) return null;
    return (
      <div className="p-4">
        <div className="text-xs font-extrabold tracking-wide text-zinc-300 mb-2">{title.toUpperCase()} ({list.length})</div>
        <div className="space-y-2">
          {list.map((member) => (
            <MemberItem
              key={member.id}
              member={member}
              isInCall={isInCall(member)}
              onClick={() => onMemberClick(member.profile, (member as any)?.createdAt)}
              onAssignRole={onAssignRole}
              canAssign={viewerRole === 'OWNER'}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-300">
          Membros — {members.length}
        </h3>
        <p className="text-[10px] text-zinc-500 mt-1">Hierarquia: Dono › NITROS › Cargos</p>
      </div>

      <ScrollArea className="flex-1">
        {renderSection('Dono', ownerGroup)}
        {renderSection('NITROS', nitroGroup)}
        {roleGroups.map((g) => renderSection(g.label, g.items))}
      </ScrollArea>
    </div>
  );
};

// Componente individual do membro
const MemberItem = ({ 
  member, 
  isInCall, 
  onClick,
  onAssignRole,
  canAssign
}: { 
  member: Member; 
  isInCall: boolean; 
  onClick: () => void;
  onAssignRole: (memberId: string, newRole: string) => void;
  canAssign: boolean;
}) => {
  const isVerifiedUser = member.profile.email === "saimonscheibler1999@gmail.com";
  const isSaimon = isVerifiedUser || (member.profile.name?.replace(/^@/, "").toUpperCase() === "SAIMON");
  const nitroPlan = member.profile.nitroPlan || (member.profile.isNitro ? 'FLUX' : undefined);
  const displayName = isSaimon ? 'SAIMON' : (member.profile.name || '').replace(/^@/, '');

  return (
    <div
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition cursor-pointer",
        isInCall && "bg-green-500/10 border border-green-500/20"
      )}
    >
      <UserAvatar
        src={member.profile.imageUrl}
        alt={member.profile.name}
        className="h-8 w-8"
        allowGif={member.profile.isNitro || member.profile.email === "saimonscheibler1999@gmail.com"}
      />
      
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "font-semibold text-sm truncate",
              isInCall ? "text-green-400" : "text-zinc-300",
              isVerifiedUser && !isSaimon && "text-blue-500 font-bold"
            )}
          >
            <span
              className={cn(
                nitroPlan === 'FLUX' && 'text-yellow-400',
                nitroPlan === 'NEBULA' && 'text-blue-400',
                nitroPlan === 'QUANTUM' && 'text-fuchsia-400',
                isSaimon && 'text-red-500 font-extrabold bg-red-500/10 border border-red-500/30 px-1 rounded'
              )}
              title={
                nitroPlan === 'FLUX' ? 'Nitro Flux ⚡' :
                nitroPlan === 'NEBULA' ? 'Nitro Nebula 🌌' :
                nitroPlan === 'QUANTUM' ? 'Nitro Quantum ⚛️' : undefined
              }
            >
              {displayName}
            </span>
            {nitroPlan && (
              <span className="ml-1 text-xs" aria-hidden>
                {nitroPlan === 'FLUX' ? '⚡' : nitroPlan === 'NEBULA' ? '🌌' : '⚛️'}
              </span>
            )}
          </span>

          {/* Indicador de status na call */}
          {isInCall && (
            <div className="flex items-center gap-1">
              <Mic className="h-3 w-3 text-green-400" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs text-zinc-500">
            {nitroPlan ? 'NITRO' : member.role}
          </span>
          {!nitroPlan && roleIconMap[member.role as keyof typeof roleIconMap]}
        </div>
      </div>

      {/* Badges especiais */}
      <div className="flex items-center gap-1">
        {isVerifiedUser && (
          <ActionTooltip label="Verificado" side="left">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
          </ActionTooltip>
        )}
        
        {nitroPlan && (
          <ActionTooltip 
            label={
              nitroPlan === 'FLUX' ? 'Nitro Flux ⚡' :
              nitroPlan === 'NEBULA' ? 'Nitro Nebula 🌌' :
              nitroPlan === 'QUANTUM' ? 'Nitro Quantum ⚛️' : 'Nitro'
            } 
            side="left"
          >
            <div className={cn(
              "w-3 h-3 rounded-full",
              nitroPlan === 'FLUX' && "bg-yellow-500",
              nitroPlan === 'NEBULA' && "bg-blue-500",
              nitroPlan === 'QUANTUM' && "bg-fuchsia-500",
            )} />
          </ActionTooltip>
        )}
      </div>

      {canAssign && (
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onAssignRole(member.id, 'MODERATOR'); }} className="text-xs px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-600/40">Dar Ajudante</button>
          <button onClick={(e) => { e.stopPropagation(); onAssignRole(member.id, 'ADMIN'); }} className="text-xs px-2 py-0.5 rounded bg-rose-600/20 text-rose-300 border border-rose-600/40">Dar Admin</button>
          <button onClick={(e) => { e.stopPropagation(); onAssignRole(member.id, 'MEMBER'); }} className="text-xs px-2 py-0.5 rounded bg-zinc-700/40 text-zinc-300 border border-zinc-600/40">Remover Cargo</button>
        </div>
      )}
    </div>
  );
};
