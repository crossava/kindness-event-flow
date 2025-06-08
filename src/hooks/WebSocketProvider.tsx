// src/hooks/WebSocketProvider.tsx
import React, {
  createContext, useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { WEBSOCKET_IP } from "@/hooks/DevelopmentConfig";
import { useUserContext } from "@/context/UserContext";

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { setCurrentUser, setUsers} = useUserContext();

  useEffect(() => {
    const socket = new WebSocket(WEBSOCKET_IP);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket подключён");
      setIsConnected(true);

      setTimeout(() => {
        const request = {
          topic: "user_requests",
          message: {
            action: "get_all_users",
          },
        };
        socket.send(JSON.stringify(request));
        console.log("📤 Запрошены пользователи");
      }, 100);
    };

    socket.onmessage = (event) => {
      setLastMessage(event.data);

      try {
        const parsed = JSON.parse(event.data);
        if (
          parsed.message?.action === "update_user" &&
          parsed.message?.status === "success"
        ) {
          const updatedUser = parsed.message.updated_user;
          if (updatedUser) {
            setCurrentUser((prev: any) => {
              if (!prev) return null;
              const merged = { ...prev, ...updatedUser, id: updatedUser._id };
              localStorage.setItem("currentUser", JSON.stringify(merged));
              return merged;
            });
          }
        }
        if (
          parsed.message?.action === "get_all_users" &&
          parsed.message?.status === "success"
        ) {
          const users = parsed.message.message?.users || [];

          const transformedUsers = users.map((user: any) => ({
            ...user,
            id: user._id, // 🔄 заменяем _id на id
          }));

          setUsers(transformedUsers);
        }

      } catch (error) {
        console.error("❌ Ошибка парсинга WebSocket сообщения:", error);
      }
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
  }, [setCurrentUser]);


  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(data);
      socketRef.current.send(json);
      console.log("📤 Отправлено:", json);
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ sendMessage, lastMessage, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useSharedWebSocket = () => useContext(WebSocketContext);
