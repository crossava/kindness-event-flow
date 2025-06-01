import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { StatsOverview } from "@/components/stats/StatsOverview";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);

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

  useEffect(() => {
    if (isConnected) {
      fetchEvents(selectedCategory);
    }
  }, [isConnected, selectedCategory]);

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== "string") return;
    try {
      if (!lastMessage.trim().startsWith("{")) return;

      const data = JSON.parse(lastMessage);
      const action = data?.message?.action;
      const payload = data?.message?.message;

      if (action === "get_upcoming_events" && payload?.status === "success") {
        const transformed = (payload.events || []).map((e: any) => ({
          ...e,
          id: e._id,
          volunteers: {
            joined: e.volunteers?.length || 0,
            needed: e.required_volunteers,
          },
          donations: {
            raised: e.donations?.raised || 0,
            goal: e.donations?.goal || 0,
          },
          image: e.photo_url || "https://placehold.co/600x400?text=Event",
          date: e.start_datetime?.split("T")[0] || "",
        }));
        setEvents(transformed);
      }
    } catch (err) {
      console.error("Ошибка при обработке WebSocket-сообщения:", err);
    }
  }, [lastMessage]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalEvents = events.length;
  const totalVolunteers = events.reduce(
    (sum, event) => sum + event.volunteers.joined,
    0
  );
  const totalDonations = events.reduce(
    (sum, event) => sum + event.donations.raised,
    0
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Измените жизнь к лучшему сегодня
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Занимайтесь значимыми делами, занимайтесь волонтерством и жертвуйте
            на создание позитивных изменений в сообществах по всей стране!
          </p>
          <Button asChild size="lg">
            <Link to="/organizer">Создать мероприятие</Link>
          </Button>
        </div>

        <StatsOverview
          totalEvents={totalEvents}
          totalVolunteers={totalVolunteers}
          totalDonations={totalDonations}
          impactCount={totalVolunteers * 3}
        />
      </section>

      <section>
        <h2 className="text-2xl font-heading font-semibold mb-6">
          Предстоящие благотворительные мероприятия
        </h2>

        <EventFilters
          onCategoryChange={(value) => {
            setSelectedCategory(value);
            fetchEvents(value);
          }}
          onSearch={setSearchQuery}
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
