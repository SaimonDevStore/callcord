import { redirectToSignIn } from "@clerk/nextjs";
 
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

import { ServerSidebar } from "@/components/server/server-sidebar";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

const ServerIdLayout = async ({
  children,
  params,
}: PropsWithChildren<{
  params: Promise<{
    serverId: string;
  }>;
}>) => {
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const { serverId } = await params;

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) redirect("/");

  return (
    <div className="h-full flex">
      {/* NavigationSidebar - Esquerda (servidores) */}
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      
      {/* ServerSidebar - Centro (canais do servidor) */}
      <aside className="hidden md:flex h-full w-96 flex-col fixed inset-y-0 md:ml-[72px]">
        <ServerSidebar serverId={serverId} />
      </aside>
      
      {/* Conteúdo principal */}
      <main className="h-full md:pl-[72px] md:ml-96 w-full">
        {children}
      </main>
    </div>
  );
};

export default ServerIdLayout;
