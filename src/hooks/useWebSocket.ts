// src/hooks/useWebSocket.ts
import { useEffect, useRef } from "react";

export const useWebSocket = (url: string, token: string | null) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    

    const socket = new WebSocket(`${url}`);
    socketRef.current = socket;

    socket.onopen = () => console.log("WebSocket ���������");
    socket.onmessage = (event) => console.log("�������� ���������:", event.data);
    socket.onclose = () => console.log("WebSocket ��������");

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [url, token]);

  return socketRef.current;
};