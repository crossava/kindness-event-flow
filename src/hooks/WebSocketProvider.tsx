import { createContext, useContext, useEffect, useRef, useState } from "react";
import { WEBSOCKET_IP } from "@/hooks/DevelopmentConfig";
import React from "react";

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
      socket.close();
    };
  }, []);

  const sendMessage = (data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(data);
      socketRef.current.send(json);
      console.log("📤 Отправлено:", json);
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, lastMessage, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useSharedWebSocket = () => useContext(WebSocketContext);
