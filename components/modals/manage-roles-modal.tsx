"use client";

import { useState } from "react";
import { Crown, Shield, Users, Star, Heart, User } from "lucide-react";
import { MemberRole } from "@prisma/client";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";

const roleConfig = {
  [MemberRole.OWNER]: {
    label: "Dono",
    icon: Crown,
    color: "#FFD700",
    description: "Dono do servidor com todos os poderes"
  },
  [MemberRole.ADMIN]: {
    label: "Admin",
    icon: Shield,
    color: "#FF6B6B",
    description: "Administrador com poderes elevados"
  },
  [MemberRole.MODERATOR]: {
    label: "Ajudante",
    icon: Shield,
    color: "#4ECDC4",
    description: "Moderador com poderes limitados"
  },
  [MemberRole.MEMBER]: {
    label: "Membro",
    icon: Users,
    color: "#45B7D1",
    description: "Membro regular do servidor"
  },
  [MemberRole.VIP]: {
    label: "VIP",
    icon: Star,
    color: "#FFA500",
    description: "Membro VIP com benefícios especiais"
  },
  [MemberRole.FRIEND]: {
    label: "Amigo",
    icon: Heart,
    color: "#FF69B4",
    description: "Amigo do servidor"
  },
  [MemberRole.GUEST]: {
    label: "Convidado",
    icon: User,
    color: "#95A5A6",
    description: "Convidado com acesso limitado"
  }
};

export const ManageRolesModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<MemberRole>(MemberRole.GUEST);
  const [customRole, setCustomRole] = useState("");
  const [roleColor, setRoleColor] = useState("#95A5A6");
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "manageRoles";
  const { member, serverId } = data;

  const handleRoleUpdate = async () => {
    if (!member || !serverId) return;

    try {
      setIsLoading(true);
      
      await axios.patch(`/api/members/${member.id}`, {
        role: selectedRole,
        customRole: customRole || null,
        roleColor: roleColor,
        serverId
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar cargo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRole(MemberRole.GUEST);
    setCustomRole("");
    setRoleColor("#95A5A6");
    onClose();
  };

  if (!member) return null;

  const currentRoleConfig = roleConfig[member.role as keyof typeof roleConfig];
  const selectedRoleConfig = roleConfig[selectedRole as keyof typeof roleConfig];

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden max-w-md">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Gerenciar Cargo
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Informações do membro */}
          <div className="text-center">
            <h3 className="text-lg font-semibold">{member.profile.name}</h3>
            <p className="text-sm text-zinc-500">
              Cargo atual: {currentRoleConfig.label}
            </p>
          </div>

          {/* Seleção de cargo */}
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as MemberRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig).map(([role, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" style={{ color: config.color }} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {selectedRoleConfig && (
              <p className="text-xs text-zinc-500">
                {selectedRoleConfig.description}
              </p>
            )}
          </div>

          {/* Cargo personalizado */}
          <div className="space-y-2">
            <Label>Cargo Personalizado (opcional)</Label>
            <Input
              placeholder="Ex: Moderador Sênior"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
            />
          </div>

          {/* Cor do cargo */}
          <div className="space-y-2">
            <Label>Cor do Cargo</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={roleColor}
                onChange={(e) => setRoleColor(e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={roleColor}
                onChange={(e) => setRoleColor(e.target.value)}
                placeholder="#95A5A6"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <Label className="text-sm">Preview:</Label>
            <div className="flex items-center space-x-2 mt-2">
              <span 
                className="text-sm font-medium"
                style={{ color: roleColor }}
              >
                {customRole || selectedRoleConfig.label}
              </span>
            </div>
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
              onClick={handleRoleUpdate}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Atualizando..." : "Atualizar Cargo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
