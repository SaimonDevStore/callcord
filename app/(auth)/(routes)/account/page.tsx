"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { MoveLeft, RefreshCw, Edit3 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProfileSync } from "@/hooks/use-profile-sync";
import { useModal } from "@/hooks/use-modal-store";

const AccountPage = () => {
  const { resolvedTheme } = useTheme();
  const { syncProfile } = useProfileSync();
  const { onOpen } = useModal();

  return (
    <div className="md:flex space-y-5 h-full space-x-20">
      <div className="flex flex-col space-y-4">
        <Link
          href="/"
          className="group flex h-5 w-auto items-center justify-center space-x-2 mt-10 text-zinc-500 hover:text-zinc-800 focus-visible:text-zinc-800 dark:text-zinc-200 dark:hover:text-zinc-300 focus-visible:hover:text-zinc-300"
        >
          <MoveLeft className="h-5 w-5 group-hover:-translate-x-0.5 group-focus-visible:-translate-x-0.5 transition" />
          <Image
            src="/logo.png"
            alt="CALLCORD"
            height={18}
            width={18}
            className="group-hover:scale-[0.9] group-focus-visible:scale-[0.9]"
          />
          <span className="font-xs font-semibold">Voltar</span>
        </Link>
        
        <div className="mt-4 space-y-3">
          <Button
            onClick={syncProfile}
            variant="outline"
            className="flex items-center space-x-2 w-full"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sincronizar Perfil</span>
          </Button>
          
          <Button
            onClick={() => onOpen("editBio")}
            variant="outline"
            className="flex items-center space-x-2 w-full"
          >
            <Edit3 className="h-4 w-4" />
            <span>Editar Biografia</span>
          </Button>

          <Button
            onClick={() => onOpen("nitroInfo")}
            variant="outline"
            className="flex items-center space-x-2 w-full bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border-purple-600/40 hover:from-purple-600/30 hover:to-fuchsia-600/30"
          >
            <span>Seja NITRO</span>
          </Button>
          
          <p className="text-xs text-zinc-500 mt-2 max-w-xs">
            Clique aqui se você alterou seu nome ou foto no perfil e não está aparecendo corretamente no chat.
          </p>
        </div>
      </div>
      
      <UserProfile
        appearance={{
          baseTheme: resolvedTheme === "dark" ? dark : undefined,
        }}
      />
    </div>
  );
};

export default AccountPage;
