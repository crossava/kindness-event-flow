
import { useEffect, useState } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { TabsContent } from "@/components/ui/tabs";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, DollarSign, FileEdit } from "lucide-react";
import { toast } from "sonner";
import { RubleIcon } from "@/components/icons";

import { useWebSocket } from "@/hooks/useWebSocket";
import {authService} from "@/api/authService.ts";
const userId = authService.getUserId();


// Mock data for user events
const userEvents = [
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
];

// Mock user profile data
const userProfile = {
  name: "Алиса Иванова",
  email: "alice.ivanova@example.com",
  phone: "+7 (988) 888-88-88",
  address: "Ленина 10, Екатеринбург",
  avatar: "https://i.pravatar.cc/150?img=5",
};

const Dashboard = () => {
  useWebSocket(); // инициализируем WebSocket-подключение

  const [activeTab, setActiveTab] = useState("events");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(userProfile);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success("Профиль успешно обновлен!");
  };

  const { sendMessage, lastMessage, isConnected } = useWebSocket();
  const [userEvents, setUserEvents] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected) {
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_user_events",
          data: {
            user_id: userId,
          },
        },
      });
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (!lastMessage) return;

    try {
      const parsed = JSON.parse(lastMessage);
      console.log("📨 Ответ от WebSocket:", parsed); // <-- вот здесь лог

      if (parsed.topic === "event_responses" && parsed.message?.events) {
        setUserEvents(parsed.message.events);
      }
    } catch (err) {
      console.error("Ошибка при парсинге сообщения от WebSocket:", err);
    }
  }, [lastMessage]);


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">Ваш дашборд</h1>

        <DashboardTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {/* My Events Tab */}
          <TabsContent value="events">
            <h2 className="text-2xl font-heading font-semibold mb-6">Мои мероприятия</h2>

            {userEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents.map((event) => (
                  <EventCard
                    key={event.id || event.title}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={new Date(event.start_datetime).toLocaleDateString()}
                    location={event.location}
                    category={event.category}
                    volunteers={{
                      needed: event.required_volunteers,
                      joined: event.volunteers?.length || 0,
                    }}
                    donations={{
                      goal: 0,
                      raised: 0,
                    }}
                    image={event.photo_url || ""}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Еще нет мероприятий</h3>
                <p className="text-muted-foreground mb-4">
                  Вы еще не подписывались ни на какие мероприятия. Изучите мероприятия, на которых можно стать волонтером или сделать пожертвование.
                </p>
                <Button asChild>
                  <a href="/">Просмотр событий</a>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Profile Info Tab */}
          <TabsContent value="profile">
            <h2 className="text-2xl font-heading font-semibold mb-6">Данные профиля</h2>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{profileData.name}</CardTitle>
                    <CardDescription>{profileData.email}</CardDescription>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <FileEdit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Изменить профиль"}
                </Button>
              </CardHeader>

              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Адрес</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full">Сохранить изменения</Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Телефон</h3>
                        <p>{profileData.phone}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Адрес</h3>
                        <p>{profileData.address}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Статистика профиля</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-charity-muted">
                          <p className="text-sm text-muted-foreground">Участия в мероприятиях</p>
                          <p className="text-2xl font-semibold">{userEvents.length}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-charity-muted">
                          <p className="text-sm text-muted-foreground">Участник с</p>
                          <p className="text-2xl font-semibold">2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </DashboardTabs>
      </div>
    </div>
  );
};

export default Dashboard;
