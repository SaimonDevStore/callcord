"use client";

import { CheckCircle, UserPlus, Zap, Edit3, Crown, Sparkles } from "lucide-react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { useUser } from "@clerk/nextjs";
import type { Profile } from "@prisma/client";
import type { SerializedMember } from "@/types";

type UserProfileModalProps = {
  profile: Profile | SerializedMember['profile'];
  joinedAt?: Date | string | null;
};

export const UserProfileModal = ({ profile, joinedAt }: UserProfileModalProps) => {
  const { isOpen, onClose, type, onOpen } = useModal();
  const { user } = useUser();
  const isModalOpen = isOpen && type === "userProfile";

  const isOwnerProfile = profile.email === "saimonscheibler1999@gmail.com" || (profile.name || '').replace(/^@/, '').toUpperCase() === 'SAIMON';
  const isSaimon = user?.emailAddresses[0]?.emailAddress === "saimonscheibler1999@gmail.com";
  const isOwnProfile = user?.id === profile.userId;
  const hasNitro = profile.isNitro;
  const displayName = (profile.customNickname || profile.name || '').replace(/^@/, '');

  // Garantir data válida independente do formato recebido (Date | string | undefined)
  const joinedAtLabel = (() => {
    try {
      const source: any = joinedAt ?? (profile as any)?.createdAt;
      if (!source) return 'indisponível';
      const date = new Date(source);
      if (Number.isNaN(date.getTime())) return 'indisponível';
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'indisponível';
    }
  })();

  const bioWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return (
      <>
        {parts.map((part, i) => {
          if (urlRegex.test(part)) {
            return (
              <a key={i} href={part} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-words">
                {part}
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-md">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Perfil do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="flex flex-col items-center">
            {/* Banner como fundo que envolve toda a área do perfil */}
            <div className="relative w-full rounded-t-lg overflow-hidden mb-4">
              <div
                className="absolute inset-0 bg-zinc-800"
                style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              />
              <div className="absolute inset-0 bg-red-700/0" />
              
              {/* Conteúdo sobreposto ao banner */}
              <div className="relative pt-8 pb-4 px-4">
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <div className={
                    isOwnerProfile
                      ? "p-[2px] rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 animate-pulse"
                      : ""
                  }>
                    <Image
                      src={profile.imageUrl}
                      alt={profile.name}
                      width={80}
                      height={80}
                      className={
                        isOwnerProfile
                          ? "rounded-full border-4 border-zinc-900 shadow-lg bg-zinc-900 ring-2 ring-yellow-400/60"
                          : "rounded-full border-4 border-zinc-900 shadow-lg bg-zinc-900"
                      }
                    />
                  </div>
                </div>

                {/* Nome e Selos */}
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h3 className={
                    isOwnerProfile
                      ? "text-xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow"
                      : "text-xl font-semibold text-center text-white"
                  }>
                    {displayName}
                  </h3>
                  {isOwnerProfile && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse">
                      <Crown className="h-3 w-3" /> Dono
                    </span>
                  )}
                  {isOwnerProfile && (
                    <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  )}
                  {isOwnerProfile && (
                    <ActionTooltip label="Verificado" side="top">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    </ActionTooltip>
                  )}
                  {hasNitro && (
                    <ActionTooltip label="Nitro" side="top">
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </ActionTooltip>
                  )}
                </div>

                {/* Email - apenas para Saimon */}
                {isSaimon && (
                  <p className="text-sm text-zinc-300 text-center">
                    {profile.email}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Biografia</h4>
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpen("editBio", { profile })}
                    className="h-6 px-2 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
              <div className={
                isOwnerProfile
                  ? "bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 min-h-[60px] border border-yellow-500/30"
                  : "bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 min-h-[60px]"
              }>
                {profile.bio ? (
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                    {isOwnerProfile && (
                      <div className="flex items-center gap-1 text-yellow-300 text-xs">
                        <Crown className="h-3 w-3" /> Criador do CALLCORD
                      </div>
                    )}
                    <div className="leading-relaxed">
                      {bioWithLinks(profile.bio)}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                    Nenhuma biografia definida
                  </p>
                )}
              </div>
            </div>

            {/* Ações privadas */}
            {!isOwnProfile && (
              <div className="w-full grid grid-cols-2 gap-2 mt-3">
                <Button className={
                  isOwnerProfile ? "w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:brightness-110" : "w-full"
                } onClick={() => {
                  window.location.href = `/conversations/${profile.id}`;
                }}>
                  Chat privado
                </Button>
                <Button variant={isOwnerProfile ? "default" : "secondary"} className={
                  isOwnerProfile ? "bg-yellow-500 text-black hover:brightness-110" : ""
                } onClick={async () => {
                  try {
                    await fetch('/api/socket/calls/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toProfileId: profile.id }) });
                    window.location.href = `/conversations/${profile.id}?video=true`;
                  } catch {}
                }}>
                  Ligação
                </Button>
              </div>
            )}

            {/* Atalhos de administração (somente o dono visualizando) */}
            {isSaimon && isOwnerProfile && (
              <div className="w-full mt-3">
                <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black" onClick={() => onOpen('ownerPayouts')}>
                  <Crown className="h-4 w-4 mr-2" /> Solicitações de Saque
                </Button>
              </div>
            )}

            {/* Status Nitro */}
            {hasNitro && (
              <div className="w-full">
                <h4 className="text-sm font-semibold mb-2">Status Nitro</h4>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-white" />
                    <span className="text-sm text-white font-medium">
                      Nitro Ativo
                    </span>
                  </div>
                  {profile.nitroExpiresAt && (
                    <p className="text-xs text-white/80 mt-1">
                      Expira em: {new Date(profile.nitroExpiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            )}

                               {/* Botão Adicionar Amigo - apenas se não for o próprio perfil */}
                   {!isOwnProfile && (
                     <div className="w-full pt-2">
                       <Button 
                         className="w-full bg-green-600 hover:bg-green-700"
                         onClick={async () => {
                           try {
                             const response = await fetch('/api/friends/add', {
                               method: 'POST',
                               headers: {
                                 'Content-Type': 'application/json',
                               },
                               body: JSON.stringify({
                                 friendId: profile.id,
                               }),
                             });

                             if (response.ok) {
                               const result = await response.json();
                               alert(result.message || 'Solicitação enviada com sucesso!');
                               // Fechar modal após sucesso
                               onClose();
                             } else {
                               const error = await response.text();
                               alert(error || 'Erro ao adicionar amigo');
                             }
                           } catch (error) {
                             console.error('Erro ao adicionar amigo:', error);
                             alert('Erro ao adicionar amigo');
                           }
                         }}
                       >
                         <UserPlus className="h-4 w-4 mr-2" />
                         Adicionar Amigo
                       </Button>
                     </div>
                   )}

            {/* Membro desde */}
            <div className="w-full text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Membro desde {joinedAtLabel}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
