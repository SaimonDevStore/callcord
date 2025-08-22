import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// API temporária para debug - remover em produção
export async function GET() {
  try {
    const channels = await db.channel.findMany({
      where: {
        type: "AUDIO" // Apenas canais de voz
      },
      select: {
        id: true,
        name: true,
        type: true,
        serverId: true
      }
    });

    return NextResponse.json({
      channels,
      message: "Canais de voz encontrados"
    });
  } catch (error) {
    console.error("[DEBUG_CALLS]", error);
    return NextResponse.json({ error: "Erro ao buscar canais" }, { status: 500 });
  }
}
