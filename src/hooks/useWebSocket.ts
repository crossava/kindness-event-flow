import { useEffect, useRef, useState, useCallback } from "react";
import { WEBSOCKET_IP } from "@/hooks/DevelopmentConfig.ts";

export const useWebSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(WEBSOCKET_IP);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket подключён");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("📩 Получено сообщение:", event.data);
      setLastMessage(event.data);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket соединение закрыто");
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error("🔥 WebSocket ошибка:", error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(data);
      socketRef.current.send(json);
      console.log("📤 Отправлено:", json);
    }
  }, []);

  return { sendMessage, lastMessage, isConnected };
};
