import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DashboardContext } from "@/context/DashboardContext";
import { OrganizerPanelContext } from "@/context/OrganizerPanelContext";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ChatWindow } from "@/components/dashboard/ChatWindow";

export const ChatsPanel = ({ userId }: { userId: string }) => {
  const { userEvents, setUserEvents } = useContext(DashboardContext);
  const { organizerEvents, setOrganizerEvents } = useContext(OrganizerPanelContext);
  const { sendMessage, lastMessage, socketRef } = useSharedWebSocket();
  const socketReady = socketRef.current?.readyState === WebSocket.OPEN;
  const didRequestRef = useRef(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeEventTitle, setActiveEventTitle] = useState<string | null>(null);

  // 🔄 Запрос мероприятий
  useEffect(() => {
    if (socketReady && !didRequestRef.current) {
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_user_events",
          data: { user_id: userId },
        },
      });
      didRequestRef.current = true;
    }
  }, [socketReady]);

  // ✅ Обработка ответа
  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = JSON.parse(lastMessage);
      const action = data?.message?.action;
      const payload = data?.message?.message;

      if (action === "get_user_events" && payload?.status === "success") {
        const normalizeEvent = (e: any) => ({
          ...e,
          id: e._id,
          volunteers: {
            ids: e.volunteers || [],
            joined: e.volunteers?.length || 0,
            needed: e.required_volunteers,
          },
        });

        const created = (payload.created_events || []).map(normalizeEvent);
        const volunteered = (payload.volunteer_events || []).map(normalizeEvent);

        setOrganizerEvents(created);
        setUserEvents(volunteered);
      }
    } catch (err) {
      console.error("Ошибка парсинга сокет-сообщения:", err);
    }
  }, [lastMessage]);

  // 🧠 Объединение мероприятий
  const allEvents = useMemo(() => {
    const combined = [...(userEvents || []), ...(organizerEvents || [])];
    const map = new Map(combined.map((e) => [e._id, e]));
    return Array.from(map.values());
  }, [userEvents, organizerEvents]);

  // 🖼️ UI
  return (
    <div className="space-y-4 px-4 py-2">
      {allEvents.length === 0 ? (
        <Skeleton className="w-full h-10" />
      ) : (
        allEvents.map((event) => (
          <Card
            key={event._id}
            className="p-4 cursor-pointer hover:bg-muted/50"
            data-chat-id={event.chat_id}
            onClick={() => {
              setActiveChatId(event.chat_id);
              setActiveEventTitle(event.title);
            }}
          >
            <div className="text-md font-semibold">{event.title}</div>
          </Card>
        ))
      )}

      {activeChatId && (
        <ChatWindow
          chatId={activeChatId}
          userId={userId}
          title={activeEventTitle || "Чат"}
          onClose={() => {
            setActiveChatId(null);
            setActiveEventTitle(null);
          }}
        />
      )}
    </div>
  );
};
