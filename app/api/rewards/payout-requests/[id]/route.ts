import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Não autorizado.", { status: 401 });
    const isOwner = user.emailAddresses[0]?.emailAddress === "saimonscheibler1999@gmail.com";
    if (!isOwner) return new NextResponse("Apenas o dono.", { status: 403 });

    const { action } = await req.json();
    if (action !== "zero") return new NextResponse("Ação inválida.", { status: 400 });

    const request = await db.rewardPayoutRequest.findUnique({ where: { id: params.id } });
    if (!request) return new NextResponse("Solicitação não encontrada.", { status: 404 });

    // Zerar saldo do usuário e aprovar esta solicitação
    await db.rewardProgress.update({ where: { profileId: request.profileId }, data: { availableCents: 0 } }).catch(() => {});
    const updated = await db.rewardPayoutRequest.update({ where: { id: request.id }, data: { status: "APPROVED" } });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[PAYOUT_REQUEST_UPDATE]", e);
    return new NextResponse("Erro interno.", { status: 500 });
  }
}


