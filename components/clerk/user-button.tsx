"use client";

import { UserButton as ClerkUserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UserButton = () => {
  const { theme } = useTheme();
  const { user } = useUser();
  const [status, setStatus] = useState("online");
  const label = useMemo(() => {
    switch (status) {
      case "online":
        return "Disponível";
      case "busy":
        return "Ocupado";
      case "away":
        return "Ausente";
      case "invisible":
        return "Invisível";
      default:
        return "Offline";
    }
  }, [status]);
  const colorClass = useMemo(() => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      case "invisible":
        return "bg-zinc-400";
      default:
        return "bg-zinc-500";
    }
  }, [status]);

  useEffect(() => {
    const stored = localStorage.getItem("callcord:presence");
    if (stored) setStatus(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("callcord:presence", status);
  }, [status]);

  return (
    <div className="relative w-full flex items-center">
      <ClerkUserButton
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            avatarBox: "h-[48px] w-[48px]",
          },
        }}
        userProfileMode="navigation"
        userProfileUrl="/account"
      />
      {/* Removido balão de status sobre o avatar */}
    </div>
  );
};
