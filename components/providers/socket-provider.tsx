"use client";

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Usar a URL atual do navegador para conectar ao Socket.io
    const socketInstance = new (ClientIO as any)(
      window.location.origin,
      {
        path: "/api/socket/io",
        addTrailingSlash: false,
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      },
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
