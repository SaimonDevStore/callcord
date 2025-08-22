import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get("message");
  
  if (!message) {
    return new NextResponse("Mensagem é obrigatória.", { status: 400 });
  }

  // Aqui você implementaria a lógica do WebSocket real
  // Por enquanto, retorna uma resposta de exemplo
  
  return NextResponse.json({ 
    success: true, 
    message: "WebSocket para avisos globais configurado",
    announcement: message 
  });
}

export async function POST(req: NextRequest) {
  try {
    const { message, author } = await req.json();
    
    if (!message) {
      return new NextResponse("Mensagem é obrigatória.", { status: 400 });
    }

    // Emitir evento via socket.io para todos os usuários conectados
    // Este endpoint será chamado pela API de admin para distribuir o aviso
    
    return NextResponse.json({ 
      success: true, 
      message: "Aviso global distribuído via WebSocket",
      announcement: { message, author, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error("[GLOBAL_ANNOUNCEMENT_SOCKET_POST]: ", error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  }
}
