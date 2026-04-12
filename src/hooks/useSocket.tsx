import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { disconnectSocket, getSocket } from "../utils/socket";

export const useSocket = (userId: string | null) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = getSocket(userId);

    return () => {
      disconnectSocket();
    };
  }, [userId]);

  return socketRef.current;
};
