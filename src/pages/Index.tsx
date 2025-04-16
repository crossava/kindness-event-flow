
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { StatsOverview } from "@/components/stats/StatsOverview";

// Mock data for events
const mockEvents = [
  {
    id: "1",
    title: "День чистого пляжа",
    description: "Присоединяйтесь к нам и проведите день уборки пляжа, чтобы защитить морских обитателей и создать более чистую окружающую среду для всех.",
    date: "2025-05-15",
    location: "Сочи, Имеретинский пляж",
    category: "Окружающая среда",
    volunteers: { needed: 50, joined: 32 },
    donations: { goal: 2000, raised: 1250 },
    image: "https://live.staticflickr.com/65535/48453652346_0a7c12f9ec_b.jpg",
  },
  {
    id: "2",
    title: "Помощь приютам для животных",
    description: "Помогите нам обеспечить пищей, уходом и кровом брошенных животных, нуждающихся в любящем доме.",
    date: "2025-05-22",
    location: "Печатники Петс, Москва",
    category: "Животные",
    volunteers: { needed: 30, joined: 18 },
    donations: { goal: 5000, raised: 3200 },
    image: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    title: "Общественная ярмарка здоровья",
    description: "Бесплатные медицинские обследования, образование и ресурсы для малообеспеченных слоев населения.",
    date: "2025-06-05",
    location: "ЦПКиО Маяковского, Екатеринбург",
    category: "Здоровье",
    volunteers: { needed: 40, joined: 25 },
    donations: { goal: 7500, raised: 4000 },
    image: "https://esd.adventist.org/wp-content/uploads/2017/06/IMG_2084-15-06-17-21-48.jpg",
  },
  {
    id: "4",
    title: "Образование для всех",
    description: "Предоставление школьных принадлежностей и репетиторства для детей в районах с низким уровнем дохода.",
    date: "2025-06-12",
    location: "МАОУ СОШ №15, Екатеринбург",
    category: "Образование",
    volunteers: { needed: 25, joined: 20 },
    donations: { goal: 3000, raised: 2800 },
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    title: "Программа питания для бездомных",
    description: "Помогайте готовить и раздавать еду бездомным в нашем районе.",
    date: "2025-06-18",
    location: "Парк Химмаш, Екатеринбург",
    category: "Нуждающиеся",
    volunteers: { needed: 35, joined: 15 },
    donations: { goal: 4000, raised: 1500 },
    image: "https://poland2day.com/wp-content/uploads/2019/12/33825cfc50.jpg",
  },
  {
    id: "6",
    title: "Оживление парка",
    description: "Посадите деревья, установите скамейки и благоустройте наш местный парк для всех желающих.",
    date: "2025-06-25",
    location: "парк Чкалова, Екатеринбург",
    category: "Сообщество",
    volunteers: { needed: 45, joined: 30 },
    donations: { goal: 6000, raised: 3500 },
    image: "https://avatars.mds.yandex.net/i?id=7280fb7ac4505698af00ab2fe6ff3492_l-5129576-images-thumbs&n=13",
  },
];

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredEvents = mockEvents.filter((event) => {
    const matchesCategory = selectedCategory === "all" || 
      event.category.toLowerCase() === selectedCategory;
    
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Calculate totals for stats
  const totalEvents = mockEvents.length;
  const totalVolunteers = mockEvents.reduce(
    (sum, event) => sum + event.volunteers.joined, 
    0
  );
  const totalDonations = mockEvents.reduce(
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
            Занимайтесь значимыми делами, занимайтесь волонтерством и жертвуйте на создание позитивных изменений в сообществах по всей стране!
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
          onCategoryChange={setSelectedCategory}
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
            <p className="text-muted-foreground mb-4">No events found matching your criteria.</p>
            <Button variant="outline" onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
