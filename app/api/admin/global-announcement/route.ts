import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Forçar rota dinâmica para evitar erro de build estático
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Não autorizado.", { status: 401 });
    }

    // Verificar se é o dono Saimon (email específico)
    if (profile.email !== "saimonscheibler1999@gmail.com") {
      return new NextResponse("Apenas o dono pode usar este comando.", { status: 403 });
    }

    const { message } = await req.json();
    
    if (!message || typeof message !== "string") {
      return new NextResponse("Mensagem é obrigatória.", { status: 400 });
    }

    // Distribuir aviso via WebSocket para todos os usuários
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket/global-announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          author: profile.name,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Erro ao distribuir aviso via WebSocket:', error);
      // Não falhar se o WebSocket não conseguir
    }

    return NextResponse.json({ 
      success: true, 
      message: "Aviso global enviado com sucesso!",
      announcement: {
        message,
        timestamp: new Date().toISOString(),
        author: profile.name
      }
    });

  } catch (error) {
    console.error("[GLOBAL_ANNOUNCEMENT_POST]: ", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
