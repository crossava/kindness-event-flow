import { useParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  Share2,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";
import { authService } from "@/api/authService";
import { useEventContext } from "@/context/EventContext";

const EventPage = () => {
  const { id } = useParams<{ id: string }>();
  const { events, setEvents } = useEventContext();
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);
  const [isUnregisterDialogOpen, setIsUnregisterDialogOpen] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);

  const { sendMessage, lastMessage } = useSharedWebSocket();
  const userId = authService.getUserId();

  const event = events.find((e) => e.id === id);

  // Получение события по id, если оно отсутствует в контексте
  useEffect(() => {
    if (!event && id) {
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_event_by_id",
          data: { _id: id },
        },
      });
    }
  }, [event, id, sendMessage]);

  // Обработка входящих сообщений
  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== "string") return;
    try {
      const data = JSON.parse(lastMessage);
      const action = data?.message?.action;

      if (action === "get_event_by_id") {
        const payload = data?.message?.event;
        if (payload?._id === id) {
          setEvents((prev) => [
            ...prev,
            {
              ...payload,
              id: payload._id,
              volunteers: {
                joined: payload.volunteers?.length || 0,
                needed: payload.required_volunteers,
                list: payload.volunteers || [],
              },
              donations: payload.donations || { raised: 0, goal: 0 },
              image: payload.photo_url || "https://placehold.co/600x400?text=Event",
            },
          ]);
        }
      }

      if (
        action === "register_volunteer" &&
        data?.message?.message?.status === "success" &&
        data.message.message.user_id === userId &&
        data.message.message._id === id
      ) {
        setIsUserRegistered(true);
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === id
              ? {
                  ...ev,
                  volunteers: {
                    ...ev.volunteers,
                    joined: ev.volunteers.joined + 1,
                    list: [...(ev.volunteers.list || []), userId],
                  },
                }
              : ev
          )
        );
      }

      if (
        action === "unregister_volunteer" &&
        data?.message?.message?.status === "success" &&
        data.message.message.user_id === userId &&
        data.message.message._id === id
      ) {
        setIsUserRegistered(false);
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === id
              ? {
                  ...ev,
                  volunteers: {
                    ...ev.volunteers,
                    joined: Math.max(ev.volunteers.joined - 1, 0),
                    list: (ev.volunteers.list || []).filter((uid) => uid !== userId),
                  },
                }
              : ev
          )
        );
      }
    } catch (err) {
      console.error("Ошибка обработки WebSocket-сообщения:", err);
    }
  }, [lastMessage, id, setEvents, userId]);

  // Проверка регистрации пользователя
  useEffect(() => {
    if (event?.volunteers?.list?.includes(userId)) {
      setIsUserRegistered(true);
    }
  }, [event, userId]);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Загрузка мероприятия...
      </div>
    );
  }

  const formattedDate = new Date(event.start_datetime).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = `${new Date(event.start_datetime).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${new Date(event.end_datetime || event.start_datetime).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const handleVolunteerConfirm = () => {
    sendMessage({
      topic: "event_requests",
      message: {
        action: "register_volunteer",
        data: {
          _id: id,
          user_id: userId,
        },
      },
    });
    setIsVolunteerDialogOpen(false);
  };

  const handleUnregisterConfirm = () => {
    sendMessage({
      topic: "event_requests",
      message: {
        action: "unregister_volunteer",
        data: {
          _id: id,
          user_id: userId,
        },
      },
    });
    setIsUnregisterDialogOpen(false);
  };

  const handleShare = () => {
    toast.success("Ссылка на событие скопирована!");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl overflow-hidden h-80 mb-8">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            <p className="text-muted-foreground mb-6">{event.description}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-3 text-charity-primary" />
                <div>
                  <p className="font-medium">{formattedDate}</p>
                  <p className="text-sm text-muted-foreground">{formattedTime}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-charity-primary" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-muted-foreground">{event.address}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-charity-primary" />
                <div>
                  <p className="font-medium">Организовано: {event.organizer}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.volunteers.joined} из {event.volunteers.needed} волонтёров присоединились
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="charity-card flex flex-col space-y-5">
            {isUserRegistered ? (
              <Button className="w-full" variant="default" onClick={() => setIsUnregisterDialogOpen(true)}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Вы участвуете (отменить)
              </Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={() => setIsVolunteerDialogOpen(true)}>
                <Users className="h-4 w-4 mr-2" />
                Я волонтёр
              </Button>
            )}

            <Button className="w-full" variant="secondary" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </div>
      </div>

      {/* Подтверждение регистрации */}
      <Dialog open={isVolunteerDialogOpen} onOpenChange={setIsVolunteerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Принять участие</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите присоединиться как волонтёр?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVolunteerDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleVolunteerConfirm}>Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Подтверждение отмены */}
      <Dialog open={isUnregisterDialogOpen} onOpenChange={setIsUnregisterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отмена участия</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отменить своё участие в этом мероприятии?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnregisterDialogOpen(false)}>
              Нет
            </Button>
            <Button onClick={handleUnregisterConfirm}>Да, отменить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventPage;
