import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { StatsOverview } from "@/components/stats/StatsOverview";
import { useEventContext } from "@/context/EventContext";
import { useUserContext } from "@/context/UserContext";
import { russianContent } from "@/lib/localization/russianContent";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { events, setEvents } = useEventContext();
  const { setUsers } = useUserContext();
  const { sendMessage, lastMessage, socketRef } = useSharedWebSocket();
  const socketReady = socketRef.current?.readyState === WebSocket.OPEN;
  const [volunteerCount, setVolunteerCount] = useState<number>(0);
  const [activeEventsCount, setActiveEventsCount] = useState<number>(0);
  const [completedEventsCount, setCompletedEventsCount] = useState<number>(0);


  const fetchEvents = (category: string) => {
    sendMessage({
      topic: "event_requests",
      message: {
        action: "get_upcoming_events",
        data: {
          limit: 10,
          category,
        },
      },
    });

    sendMessage({
      topic: "user_requests",
      message: {
        action: "volunteer_count",
      },
    });
  };

  const searchEvents = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory("all");
    sendMessage({
      topic: "event_requests",
      message: {
        action: "get_event_by_title",
        data: {
          title: query,
        },
      },
    });
  };

  useEffect(() => {
    if (socketReady) {
      fetchEvents(selectedCategory);
    }
  }, [socketReady, selectedCategory]);

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== "string") return;


    try {
      const data = JSON.parse(lastMessage);
      const action = data?.message?.action;
      const status = data?.message?.status;
      const payload = data?.message?.message;

      if (
        (action === "get_upcoming_events" || action === "get_event_by_title") &&
        payload?.status === "success"
      ) {
        setActiveEventsCount(payload?.total_active_events_count)
        setCompletedEventsCount(payload?.completed_events_count)
        const transformed = (payload.events || []).map((e: any) => ({
          ...e,
          id: e._id,
          date: e.start_datetime,
          category: russianContent.categories[e.category] || e.category,
          status: russianContent.statuses?.[e.status] || e.status,
          volunteers: {
            joined: e.volunteers?.length || 0,
            needed: e.required_volunteers,
            list: e.volunteers || [],
          },
          donations: {
            raised: e.donations?.raised || 0,
            goal: e.donations?.goal || 0,
          },
          image: e.photo_url || "https://placehold.co/600x400?text=Event",
        }));
        setEvents(transformed);
      }

      if (action === "get_all_users" && status === "success") {
        const transformedUsers = (payload.users || []).map((user: any) => ({
          ...user,
          id: user._id,
        }));
        setUsers(transformedUsers);
      }

      if (data?.message?.action === "volunteer_count" && data?.message?.status === "success") {
        const count = data?.message?.data?.volunteer_count;
        setVolunteerCount(count);
      }

      if (action === "update_event" && payload.status === "success") {
        console.log("update_event");
        const updatedEvent = payload.event;
        console.log("updatedEvent", updatedEvent);
        console.log("_id", updatedEvent._id);
        if (!updatedEvent || !updatedEvent._id) return;

        const transformed = {
          ...updatedEvent,
          id: updatedEvent._id,
          date: updatedEvent.start_datetime,
          category: russianContent.categories[updatedEvent.category] || updatedEvent.category,
          status: russianContent.statuses?.[updatedEvent.status] || updatedEvent.status,
          volunteers: {
            joined: updatedEvent.volunteers?.length || 0,
            needed: updatedEvent.required_volunteers,
            list: updatedEvent.volunteers || [],
          },
          donations: {
            raised: updatedEvent.donations?.raised || 0,
            goal: updatedEvent.donations?.goal || 0,
          },
          image: updatedEvent.photo_url || "https://placehold.co/600x400?text=Event",
        };

        console.log("prevEvents");
        setEvents((prevEvents) => {
          const index = prevEvents.findIndex((e) => e.id === transformed.id);
          if (index === -1) return prevEvents;
          const updated = [...prevEvents];
          updated[index] = transformed;
          return updated;
        });
      }

      if (action === "register_volunteer" && payload.status === "success") {
        const eventId = payload._id;
        const userId = payload.user_id;

        if (!eventId || !userId) return;

        setEvents((prevEvents) => {
          return prevEvents.map((event) => {
            if (event.id !== eventId) return event;

            // Проверим, есть ли уже такой волонтёр
            const alreadyJoined = event.volunteers.list.includes(userId);
            if (alreadyJoined) return event;

            const updatedVolunteersList = [...event.volunteers.list, userId];

            return {
              ...event,
              volunteers: {
                ...event.volunteers,
                list: updatedVolunteersList,
                joined: updatedVolunteersList.length,
              },
            };
          });
        });
      }

      if (action === "unregister_volunteer" && payload.status === "success") {
        const eventId = payload._id;
        const userId = payload.user_id;

        if (!eventId || !userId) return;

        setEvents((prevEvents) =>
          prevEvents.map((event) => {
            if (event.id !== eventId) return event;

            const updatedList = event.volunteers.list.filter((v) => v !== userId);

            return {
              ...event,
              volunteers: {
                ...event.volunteers,
                list: updatedList,
                joined: updatedList.length,
              },
            };
          })
        );
      }
      if (action === "delete_event" && payload.status === "success") {
        const eventId = payload._id;
        if (!eventId) return;

        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      }

      if (action === "create_event" && payload.status === "success") {
        const newEvent = payload.event;
        if (!newEvent || !newEvent._id) return;

        const transformed = {
          ...newEvent,
          id: newEvent._id,
          date: newEvent.start_datetime,
          category: russianContent.categories[newEvent.category] || newEvent.category,
          status: russianContent.statuses?.[newEvent.status] || newEvent.status,
          volunteers: {
            joined: newEvent.volunteers?.length || 0,
            needed: newEvent.required_volunteers,
            list: newEvent.volunteers || [],
          },
          donations: {
            raised: newEvent.donations?.raised || 0,
            goal: newEvent.donations?.goal || 0,
          },
          image: newEvent.photo_url || "https://placehold.co/600x400?text=Event",
        };

        setEvents((prevEvents) => [transformed, ...prevEvents]); // добавим в начало
      }


    } catch (err) {
      console.error("❌ Ошибка при обработке WebSocket-сообщения:", err);
    }
  }, [lastMessage]);

  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    );
  });

  const totalEvents = events.length;
  const uniqueVolunteerIds = new Set(
    events.flatMap((event) => event.volunteers.list || [])
  );
  const totalVolunteers = uniqueVolunteerIds.size;

  const totalDonations = events.reduce(
    (sum, event) => sum + event.donations.raised,
    0
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Измените жизнь к лучшему сегодня</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Занимайтесь значимыми делами, занимайтесь волонтерством и жертвуйте
          на создание позитивных изменений в сообществах по всей стране!
        </p>

        <StatsOverview
          totalEvents={activeEventsCount}
          totalVolunteers={volunteerCount}
          totalDonations={totalDonations}
          impactCount={completedEventsCount}
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Предстоящие благотворительные мероприятия
        </h2>

        <EventFilters
          onCategoryChange={(value) => {
            setSelectedCategory(value);
            fetchEvents(value);
          }}
          onSearch={searchEvents}
          selectedCategory={selectedCategory}
        />

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Нет мероприятий, соответствующих фильтрам.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                fetchEvents("all");
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
