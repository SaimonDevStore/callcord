import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { InitialModal } from "@/components/modals/initial-modal";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

const SetupPage = async () => {
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return (
    <div className="h-full flex">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full w-full">
        <div className="h-full flex items-center justify-center">
          <InitialModal />
        </div>
      </main>
    </div>
  );
};

export default SetupPage;
