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
  const { sendMessage, lastMessage, isConnected } = useSharedWebSocket();

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
    if (isConnected) {
      fetchEvents(selectedCategory);
    }
  }, [isConnected, selectedCategory]);

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
          id: user._id, // 🔄 заменяем _id на id
        }));
        console.log("transformedUsers", transformedUsers);

        setUsers(transformedUsers);
        console.log("✅ Users set:", transformedUsers);
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
          totalEvents={totalEvents}
          totalVolunteers={totalVolunteers}
          totalDonations={totalDonations}
          impactCount={totalVolunteers * 3}
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
