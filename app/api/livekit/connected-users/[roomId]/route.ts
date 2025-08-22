import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    console.log("[LIVEKIT_CONNECTED_USERS] Starting request");
    
    if (!apiKey || !apiSecret || !wsUrl) {
      console.error("[LIVEKIT_CONNECTED_USERS] Missing environment variables");
      return NextResponse.json(
        { error: "Servidor mal configurado" },
        { status: 500 }
      );
    }

    const { roomId } = await params;
    console.log(`[LIVEKIT_CONNECTED_USERS] Room ID: ${roomId}`);

    if (!roomId) {
      return NextResponse.json(
        { error: "ID da sala ausente" },
        { status: 400 }
      );
    }

    // RoomServiceClient usa http(s); converter ws:// ou wss://
    const serviceUrl = wsUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
    console.log(`[LIVEKIT_CONNECTED_USERS] Service URL: ${serviceUrl}`);
    
    const roomService = new RoomServiceClient(serviceUrl, apiKey, apiSecret);
    
    try {
      // Obter participantes conectados
      console.log(`[LIVEKIT_CONNECTED_USERS] Fetching participants for room: ${roomId}`);
      const participants = await roomService.listParticipants(roomId);
      console.log(`[LIVEKIT_CONNECTED_USERS] Found ${participants.length} participants`);
      
      const connectedUsers = participants.map(participant => {
        console.log(`[LIVEKIT_CONNECTED_USERS] Participant: ${participant.identity}, metadata: ${participant.metadata}`);
        return {
          id: participant.identity,
          name: participant.name || participant.identity,
          metadata: participant.metadata
        };
      });

      console.log(`[LIVEKIT_CONNECTED_USERS] Returning ${connectedUsers.length} connected users`);
      return NextResponse.json({ connectedUsers });
    } catch (error) {
      console.error("[LIVEKIT_CONNECTED_USERS] Error listing participants:", error);
      // Se a sala não existe ou não há participantes, retornar lista vazia
      return NextResponse.json({ connectedUsers: [] });
    }
  } catch (error) {
    console.error("[LIVEKIT_CONNECTED_USERS]", error);
    return NextResponse.json(
      { error: "Erro ao obter usuários conectados" },
      { status: 500 }
    );
  }
}
