import React, { useEffect, useState } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { TabsContent } from "@/components/ui/tabs";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, DollarSign, FileEdit, ListTodo } from "lucide-react";
import { toast } from "sonner";
import { RubleIcon } from "@/components/icons";

import { useSharedWebSocket } from "@/hooks/WebSocketProvider";
import { useUserContext } from "@/context/UserContext";
import { TaskDetailSidebar } from "@/components/dashboard/TaskDetailDrawer.tsx";

const Dashboard = () => {
  const { currentUser } = useUserContext();

  const { sendMessage, lastMessage, isConnected } = useSharedWebSocket();
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [volunteerCount, setVolunteerCount] = useState<number | null>(null);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState("events");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.full_name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    createdAt: currentUser?.created_at || "",
    avatar: `https://i.pravatar.cc/150?u=${currentUser?.id}`,
  });

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.full_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        createdAt: currentUser.created_at || "",
        avatar: `https://i.pravatar.cc/150?u=${currentUser.id}`,
      });
    }
  }, [currentUser]);

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
    return phone;
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    sendMessage({
      topic: "user_requests",
      message: {
        action: "update_user",
        data: {
          user_id: currentUser.id,
          full_name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
        },
      },
    });

    setIsEditing(false);
    toast.success("Профиль успешно обновлён!");
  };

  useEffect(() => {
    if (isConnected && currentUser) {
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_user_events",
          data: { user_id: currentUser.id },
        },
      });

      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_user_volunteer_count",
          data: { user_id: currentUser.id },
        },
      });

      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_tasks_by_user",
          data: { user_id: currentUser.id },
        },
      });

      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_tasks_assigned_by_user",
          data: { user_id: currentUser.id },
        },
      });
    }
  }, [isConnected, currentUser, sendMessage]);

  useEffect(() => {
    if (!lastMessage) return;

    try {
      const parsed = JSON.parse(lastMessage);

      if (parsed.topic === "event_responses" && parsed.message?.events) {
        setUserEvents(parsed.message.events);
      }

      if (
        parsed?.message?.action === "get_user_volunteer_count" &&
        parsed?.message?.status === "success"
      ) {
        setVolunteerCount(parsed.message.data.volunteer_count);
      }

      if (
        parsed?.message?.action === "get_tasks_by_user" &&
        parsed?.message?.status === "success"
      ) {
        setUserTasks(parsed.message.data.tasks || []);
      }

     if (
        parsed?.message?.action === "get_tasks_assigned_by_user" &&
        parsed?.message?.status === "success"
      ) {
        console.log("Assigned tasks received:", parsed.message.data.tasks);
        setAssignedTasks(parsed.message.data.tasks || []);
      }
    } catch (err) {
      console.error("Ошибка при парсинге сообщения от WebSocket:", err);
    }
  }, [lastMessage]);

  const renderTaskCards = (tasks: any[]) => (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card
          key={task._id}
          onClick={() => {
            setSelectedTask(task);
            setIsTaskSidebarOpen(true);
          }}
        >
          <CardHeader>
            <CardTitle>{task.title}</CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>Статус:</strong> {task.status}</p>
            <p><strong>Дедлайн:</strong> {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">Ваш дашборд</h1>

        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab}>
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
                    donations={{ goal: 0, raised: 0 }}
                    image={event.photo_url || ""}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Еще нет мероприятий</h3>
                <p className="text-muted-foreground mb-4">
                  Вы еще не подписывались ни на какие мероприятия.
                </p>
                <Button asChild>
                  <a href="/">Просмотр событий</a>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Tasks Tab */}
          <TabsContent value="tasks">
            <h2 className="text-2xl font-heading font-semibold mb-6">Мои задачи</h2>
            {userTasks.length > 0 ? (
              renderTaskCards(userTasks)
            ) : (
              <div className="text-center py-12">
                <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет задач</h3>
                <p className="text-muted-foreground mb-4">
                  У вас пока нет активных задач. Следите за обновлениями!
                </p>
              </div>
            )}
            {selectedTask && (
              <TaskDetailSidebar
                open={isTaskSidebarOpen}
                onClose={() => setIsTaskSidebarOpen(false)}
                task={selectedTask}
              />
            )}
          </TabsContent>

          {/* Assigned Tasks Tab */}
          <TabsContent value="assigned">
            <h2 className="text-2xl font-heading font-semibold mb-6">Назначенные задачи</h2>
            {assignedTasks.length > 0 ? (
              renderTaskCards(assignedTasks)
            ) : (
              <div className="text-center py-12">
                <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет назначенных задач</h3>
                <p className="text-muted-foreground mb-4">
                  Вы ещё не назначили задачи другим пользователям.
                </p>
              </div>
            )}
            {selectedTask && (
              <TaskDetailSidebar
                open={isTaskSidebarOpen}
                onClose={() => setIsTaskSidebarOpen(false)}
                task={selectedTask}
              />
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
                        <p>{formatPhoneNumber(profileData.phone)}</p>
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
                          <p className="text-2xl font-semibold">
                            {volunteerCount !== null ? volunteerCount : "—"}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-charity-muted">
                          <p className="text-sm text-muted-foreground">Участник с</p>
                          <p className="text-2xl font-semibold">
                            {profileData.createdAt ? new Date(profileData.createdAt).getFullYear() : "—"}
                          </p>
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
