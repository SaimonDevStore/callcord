import { redirectToSignIn } from "@clerk/nextjs";
import { MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

type InviteCodePageProps = {
  params: Promise<{
    inviteCode: string;
  }>;
};

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const { inviteCode } = await params;

  if (!inviteCode) redirect("/");

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: inviteCode,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

      if (existingServer) redirect(`/servers/${existingServer.id}`);

  const server = await db.server.update({
    where: { inviteCode: inviteCode },
    data: {
      members: {
        create: [{ profileId: profile.id, role: MemberRole.MEMBER }],
      },
    },
  });

      if (server) redirect(`/servers/${server.id}`);

  return null;
};

export default InviteCodePage;
