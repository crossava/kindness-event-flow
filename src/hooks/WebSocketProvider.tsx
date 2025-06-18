// src/hooks/WebSocketProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { WEBSOCKET_IP } from "@/hooks/DevelopmentConfig";
import { useUserContext } from "@/context/UserContext";
import { useEventContext } from "@/context/EventContext";
import { russianContent } from "@/lib/localization/russianContent";

const WebSocketContext = createContext<any>(null);
const RECONNECT_DELAY = 3000;

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { setCurrentUser, setUsers, currentUser } = useUserContext();
  const { setEvents } = useEventContext();

  const connectSocket = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(WEBSOCKET_IP);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket подключён");
      setIsConnected(true);

      setTimeout(() => {
        const request = {
          topic: "user_requests",
          message: { action: "get_all_users" },
        };
        socket.send(JSON.stringify(request));
        console.log("📤 Запрошены пользователи");
      }, 100);
    };

    socket.onmessage = (event) => {
      setLastMessage(event.data);

      try {
        const parsed = JSON.parse(event.data);
        const { message } = parsed;

        if (message?.action === "update_user" && message?.status === "success") {
          const updatedUser = message.updated_user;
          if (updatedUser) {
            setCurrentUser((prev: any) => {
              if (!prev) return null;
              const merged = { ...prev, ...updatedUser, id: updatedUser._id };
              localStorage.setItem("currentUser", JSON.stringify(merged));
              return merged;
            });
          }
        }

        if (message?.action === "get_all_users" && message?.status === "success") {
          const users = message.message?.users || [];
          const transformedUsers = users.map((user: any) => ({
            ...user,
            id: user._id,
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
      if (currentUser) {
        reconnectTimeout.current = setTimeout(connectSocket, RECONNECT_DELAY);
      }
    };

    socket.onerror = (error) => {
      console.error("🔥 WebSocket ошибка:", error);
    };
  }, [setCurrentUser, setUsers, setEvents, currentUser]);

  useEffect(() => {
    connectSocket();
    return () => {
      socketRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [connectSocket]);

  useEffect(() => {
    if (currentUser && !isConnected) {
      connectSocket();
    }
  }, [currentUser, isConnected, connectSocket]);

  const sendMessage = (data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(data);
      socketRef.current.send(json);
      console.log("📤 Отправлено:", json);
    } else {
      console.warn("🚫 WebSocket не готов к отправке:", socketRef.current?.readyState);
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, lastMessage, isConnected, socketRef }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useSharedWebSocket = () => useContext(WebSocketContext);
