// src/hooks/useWebSocket.ts
import { useEffect, useRef } from "react";

export const useWebSocket = (url: string, token: string | null) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    

    const socket = new WebSocket(`${url}`);
    socketRef.current = socket;

    socket.onopen = () => console.log("WebSocket подключен");
    socket.onmessage = (event) => console.log("Получено сообщение:", event.data);
    socket.onclose = () => console.log("WebSocket отключен");

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [url, token]);

  return socketRef.current;
};