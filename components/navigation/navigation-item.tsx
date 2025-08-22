"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { ActionTooltip } from "@/components/action-tooltip";
import { cn } from "@/lib/utils";

type NavigationItemProps = {
  id: string;
  imageUrl: string;
  name: string;
  isOfficial?: boolean;
};

export const NavigationItem = ({ id, imageUrl, name, isOfficial }: NavigationItemProps) => {
  const params = useParams();
  const router = useRouter();

  const onClick = () => {
    router.push(`/servers/${id}`);
  };

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button onClick={onClick} className="group relative flex items-center">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId !== id && "group-hover:h-[20px]",
            params?.serverId === id ? "h-[36px]" : "h-[8px]",
          )}
          aria-hidden
        />

        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.serverId === id &&
              "bg-primary/10 text-primary rounded-[16px]",
          )}
        >
          <Image src={imageUrl} alt={name} fill />
          {isOfficial && (
            <div className="absolute -top-2 -right-2">
              <div className="relative h-6 w-6 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-red-500 shadow-lg">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" aria-hidden>
                  <path d="M12 2l2.39 4.84L20 8l-3.8 3.7L17.5 18 12 15.27 6.5 18l1.3-6.3L4 8l5.61-1.16L12 2z" fill="currentColor" />
                </svg>
              </div>
              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 right-6 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-zinc-700 shadow-lg flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="h-3 w-3 text-green-500" aria-hidden>
                  <path d="M12 2l2.39 4.84L20 8l-3.8 3.7L17.5 18 12 15.27 6.5 18l1.3-6.3L4 8l5.61-1.16L12 2z" fill="currentColor" />
                </svg>
                <span>OFICIAL</span>
              </div>
            </div>
          )}
        </div>
      </button>
    </ActionTooltip>
  );
};
