import { useEffect, useRef, useState } from "react";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useUserContext} from "@/context/UserContext.tsx";

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
};

export const ChatWindow = ({
  chatId,
  userId,
  title,
  onClose,
}: {
  chatId: string;
  userId: string;
  title: string;
  onClose: () => void;
}) => {
  const { sendMessage, lastMessage } = useSharedWebSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const didRequestRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { getUserById, currentUser } = useUserContext();

  const full_name_by_user_id = (user_id: string) => {
    const user = getUserById(user_id);
    return user ? user.full_name : user_id;
  };
  useEffect(() => {
    if (!didRequestRef.current) {
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_chat_messages",
          data: { chat_id: chatId },
        },
      });
      didRequestRef.current = true;
    }
  }, [chatId]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = JSON.parse(lastMessage);
      const action = data?.message?.action;
      const payload = data?.message?.message;

      if (action === "get_chat_messages" && payload?.status === "success") {
        setMessages(payload.messages || []);
      }

      if (action === "add_chat_message" && payload?.status === "success") {
        const newMsg = payload.new_message;
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (e) {
      console.error("Ошибка парсинга сообщения:", e);
    }
  }, [lastMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendNewMessage = () => {
    if (inputValue.trim() === "") return;

    sendMessage({
      topic: "event_requests",
      message: {
        action: "add_chat_message",
        data: {
          chat_id: chatId,
          author: userId,
          message: inputValue,
        },
      },
    });
    setInputValue("");
  };

  return (
    <Card className="fixed bottom-4 right-4 w-[360px] h-[520px] flex flex-col shadow-xl z-50">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-100">
        <span className="font-semibold text-sm">{title}</span>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-black">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length > 0 ? (
          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => {
              const isCurrentUser = msg.author === userId;
              const userName = full_name_by_user_id(msg.author);
              const createdAt = formatDate(msg.timestamp);

              return (
                <div key={idx} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start gap-2`}>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-white">
                      {userName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className={`rounded-lg px-4 py-2 text-sm border ${isCurrentUser ? "bg-blue-100 border-blue-300 text-right" : "bg-gray-100 border-gray-300"}`}>
                      <div className="font-semibold text-xs text-muted-foreground mb-1">{userName}</div>
                      <p className="whitespace-pre-line break-words">{msg.message}</p>
                      {createdAt && (
                        <div className="text-[10px] text-muted-foreground mt-1 text-right">
                          {createdAt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Нет сообщений.</p>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex border-t border-gray-200 p-2 gap-2">
        <Input
          className="flex-1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendNewMessage()}
          placeholder="Написать сообщение..."
        />
        <Button onClick={sendNewMessage}>Отправить</Button>
      </div>
    </Card>
  );
};
