"use client";

import { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";

export const EditBioModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  const isModalOpen = isOpen && type === "editBio";
  const { profile } = data;
  
  // Se não há profile fornecido, buscar o perfil atual
  const effectiveProfile = profile || currentProfile;
  
  // Buscar perfil atual quando o modal for aberto sem profile
  useEffect(() => {
    if (isModalOpen && !profile) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get('/api/profile');
          setCurrentProfile(response.data);
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
        }
      };
      fetchProfile();
    }
  }, [isModalOpen, profile]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      await axios.patch(`/api/profile/bio`, { bio: bio.trim() || null });
      if (bannerUrl.trim()) {
        await axios.patch(`/api/profile`, { bannerUrl: bannerUrl.trim() });
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar bio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setBio("");
    setBannerUrl("");
    onClose();
  };

  // Se não há profile, é porque foi chamado da página de conta
  // Nesse caso, não precisamos mostrar o profile atual

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden max-w-md">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold flex items-center justify-center space-x-2">
            <Edit3 className="h-6 w-6" />
            <span>Editar Biografia</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Bio atual - apenas se tiver profile */}
          {effectiveProfile && (
            <div className="space-y-2">
              <Label>Biografia Atual</Label>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 min-h-[60px]">
                {effectiveProfile.bio ? (
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {effectiveProfile.bio}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                    Nenhuma biografia definida
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Banner */}
          <div className="space-y-2">
            <Label>Banner</Label>
            <FileUpload 
              endpoint="serverBanner" 
              value={bannerUrl} 
              onChange={(url) => setBannerUrl(url || "")}
              isNitro={effectiveProfile?.isNitro || false}
              showGifWarning={true}
            />
          </div>

          {/* Nova bio */}
          <div className="space-y-2">
            <Label>Nova Biografia</Label>
            <Textarea
              placeholder="Conte um pouco sobre você..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-zinc-500 text-right">
              {bio.length}/500 caracteres
            </p>
          </div>

          {/* Dicas */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💡 Dicas para uma boa bio:
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Seja criativo e autêntico</li>
              <li>• Mencione seus interesses</li>
              <li>• Use emojis para personalizar</li>
              <li>• Mantenha um tom amigável</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex space-x-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Bio"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
