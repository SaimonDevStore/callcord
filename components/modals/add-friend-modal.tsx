"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Check, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
  isNitro?: boolean;
  nitroPlan?: string;
  friendshipStatus?: {
    id: string;
    status: string;
    isReceived: boolean;
  } | null;
};

export const AddFriendModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "addFriend";

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const searchProfiles = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/profiles/search?search=${encodeURIComponent(term)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProfiles(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAddFriend = async (profileId: string) => {
    setProcessingId(profileId);
    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: profileId })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Solicitação enviada com sucesso!');
        // Recarregar resultados para atualizar status
        searchProfiles(searchTerm);
      } else {
        const error = await response.text();
        alert(error || 'Erro ao adicionar amigo');
      }
    } catch (error) {
      console.error('Erro ao adicionar amigo:', error);
      alert('Erro ao adicionar amigo');
    } finally {
      setProcessingId(null);
    }
  };

  const getDisplayName = (name: string) => {
    return name.replace(/^@/, '');
  };

  const getNitroColor = (nitroPlan?: string) => {
    switch (nitroPlan) {
      case 'FLUX': return 'text-yellow-400';
      case 'NEBULA': return 'text-blue-400';
      case 'QUANTUM': return 'text-fuchsia-400';
      default: return 'text-zinc-300';
    }
  };

  const getFriendshipStatus = (profile: Profile) => {
    if (!profile.friendshipStatus) return null;

    const { status, isReceived } = profile.friendshipStatus;

    if (status === 'ACCEPTED') {
      return { text: 'Já são amigos', color: 'text-green-400', icon: <Check className="h-4 w-4" /> };
    }
    
    if (status === 'PENDING') {
      if (isReceived) {
        return { text: 'Solicitação recebida', color: 'text-yellow-400', icon: <Clock className="h-4 w-4" /> };
      } else {
        return { text: 'Solicitação enviada', color: 'text-blue-400', icon: <Clock className="h-4 w-4" /> };
      }
    }

    if (status === 'DECLINED') {
      return { text: 'Solicitação recusada', color: 'text-red-400', icon: null };
    }

    return null;
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-md">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Adicionar Amigo
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Campo de busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Resultados da busca */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading && (
              <div className="text-center py-4">
                <div className="text-zinc-400">Buscando...</div>
              </div>
            )}

            {!loading && searchTerm && searchResults.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">Nenhum usuário encontrado</p>
                <p className="text-zinc-500 text-sm">Tente buscar por nome ou email</p>
              </div>
            )}

            {!loading && searchResults.map((profile) => {
              const friendshipStatus = getFriendshipStatus(profile);
              
              return (
                <div key={profile.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserAvatar 
                      src={profile.imageUrl} 
                      alt={profile.name}
                      allowGif={profile.isNitro}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={cn("font-medium", getNitroColor(profile.nitroPlan))}>
                          {getDisplayName(profile.name)}
                        </span>
                        {profile.nitroPlan && (
                          <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full">
                            NITRO
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">{profile.email}</span>
                      {friendshipStatus && (
                        <div className={cn("flex items-center space-x-1 text-xs", friendshipStatus.color)}>
                          {friendshipStatus.icon}
                          <span>{friendshipStatus.text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {friendshipStatus?.text === 'Já são amigos' ? (
                      <span className="text-xs text-green-400">✓ Amigos</span>
                    ) : friendshipStatus?.text === 'Solicitação enviada' ? (
                      <span className="text-xs text-blue-400">⏳ Enviada</span>
                    ) : friendshipStatus?.text === 'Solicitação recebida' ? (
                      <Button
                        size="sm"
                        onClick={() => handleAddFriend(profile.id)}
                        disabled={processingId === profile.id}
                        className="h-8 px-3 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddFriend(profile.id)}
                        disabled={processingId === profile.id}
                        className="h-8 px-3 bg-green-600 hover:bg-green-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instruções */}
          {!searchTerm && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">Busque por usuários para adicionar</p>
              <p className="text-zinc-500 text-sm">Digite o nome ou email do usuário</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
