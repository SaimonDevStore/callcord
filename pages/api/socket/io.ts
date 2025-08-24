import type { NextApiRequest } from "next";
import { NextApiResponse } from "next";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";

import type { NextApiResponseServerIO } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
      cors: {
        origin: [
          "https://callcord.vercel.app",
          "https://callcordg.vercel.app",
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002"
        ],
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      transports: ["websocket", "polling"],
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
