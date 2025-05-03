import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronDown, ListChecks, BarChart3, Plus, Search, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/api/authService";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { russianContent } from "@/lib/localization/russianContent";
import { EventForm } from "@/components/forms/EventForm";
import { VolunteerManagementForm } from "@/components/forms/VolunteerManagementForm";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

// Mock data for organizer events
const organizerEvents = [
  {
    id: "1",
    title: "Чистый пляжный день",
    description: "Присоединяйтесь к нам для дня уборки пляжа, чтобы защитить морскую жизнь и создать более чистую среду для всех.",
    date: "2025-05-15",
    location: "Сочи, Имеретинский пляж",
    category: "Окружающая среда",
    volunteers: { needed: 50, joined: 32 },
    status: "Активно",
  },
  {
    id: "3",
    title: "Общественная ярмарка здоровья",
    description: "Бесплатные медицинские осмотры, образование и ресурсы для недостаточно обслуживаемых сообществ.",
    date: "2025-06-05",
    location: "ЦПКиО Маяковского, Екатеринбург",
    category: "Здоровье",
    volunteers: { needed: 40, joined: 25 },
    status: "Активно",
  },
  {
    id: "5",
    title: "Программа питания для бездомных",
    description: "Помогите приготовить и раздать еду бездомным в нашем сообществе.",
    date: "2025-06-18",
    location: "Парк Химмаш, Екатеринбург",
    category: "Нуждающиеся",
    volunteers: { needed: 35, joined: 15 },
    status: "Черновик",
  },
];

// Mock data for volunteers
const volunteersData = [
  { id: "1", name: "Анна Иванова", email: "anna@example.com", phone: "+7 (555) 123-4567", event: "Чистый пляжный день", joinDate: "2025-03-15" },
  { id: "2", name: "Иван Смирнов", email: "ivan@example.com", phone: "+7 (555) 234-5678", event: "Чистый пляжный день", joinDate: "2025-03-16" },
  { id: "3", name: "Елена Петрова", email: "elena@example.com", phone: "+7 (555) 345-6789", event: "Чистый пляжный день", joinDate: "2025-03-17" },
  { id: "4", name: "Михаил Соколов", email: "mikhail@example.com", phone: "+7 (555) 456-7890", event: "Здоровье сообщества", joinDate: "2025-03-18" },
  { id: "5", name: "Ольга Новикова", email: "olga@example.com", phone: "+7 (555) 567-8901", event: "Здоровье сообщества", joinDate: "2025-03-19" },
];

const OrganizerPanel = () => {
  const { common, events, categories } = russianContent;
  const [activeTab, setActiveTab] = useState("events");
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // State for edit dialog
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null);
  
  // State for volunteer management dialog
  const [isVolunteerManagementOpen, setIsVolunteerManagementOpen] = useState(false);
  const [currentEventForVolunteers, setCurrentEventForVolunteers] = useState<any | null>(null);
  
  // State for delete confirmation
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  // State for volunteer actions
  const [isVolunteerDeleteConfirmOpen, setIsVolunteerDeleteConfirmOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);
  
  const filteredEvents = organizerEvents.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    


    return matchesStatus && matchesSearch;
  });
  
  const handleCreateEvent = async (eventData: any) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Пользователь не авторизован");
      }

      // Преобразуем данные формы в нужный формат
      const formattedData = {
        title: eventData.title,
        description: eventData.description,
        start_datetime: eventData.date + "T" + eventData.time + ":00",
        location: eventData.location,
        required_volunteers: Number(eventData.volunteersNeeded),
        category: eventData.category,
        created_by: authService.getUserId(), // Здесь нужно использовать реальный ID пользователя
        photo_url: eventData.photo
      };

      const socket = authService.initWebSocket(authService.getToken());
      await authService.createEvent(formattedData, socket);
      setIsCreateEventDialogOpen(false);
        } catch (error) {
      toast.error(`Ошибка при создании мероприятия: ${error.message}`);
        }
  };
  
  const handleEditEvent = (eventId: string) => {
    const event = organizerEvents.find(e => e.id === eventId);
    if (event) {
      setCurrentEvent(event);
      setIsEditEventDialogOpen(true);
    }
  };
  
  const handleSaveEvent = (eventData: any) => {
    console.log("Saving event data:", eventData);
    toast.success("Мероприятие обновлено!");
  };
  
  const handleManageVolunteers = (eventId: string) => {
    const event = organizerEvents.find(e => e.id === eventId);
    if (event) {
      setCurrentEventForVolunteers(event);
      setIsVolunteerManagementOpen(true);
    }
  };
  
  const confirmDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setIsDeleteConfirmationOpen(true);
  };
  
  const handleDeleteEvent = () => {
    console.log("Deleting event:", eventToDelete);
    toast.success("Мероприятие удалено!");
    setIsDeleteConfirmationOpen(false);
  };
  
  const confirmDeleteVolunteer = (volunteerId: string) => {
    setVolunteerToDelete(volunteerId);
    setIsVolunteerDeleteConfirmOpen(true);
  };
  
  const handleDeleteVolunteer = () => {
    console.log("Deleting volunteer:", volunteerToDelete);
    toast.success("Волонтер удален!");
    setIsVolunteerDeleteConfirmOpen(false);
  };
  
  // Calculate totals for stats
  const totalEvents = organizerEvents.length;
  const totalVolunteers = organizerEvents.reduce(
    (sum, event) => sum + event.volunteers.joined, 
    0
  );
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-heading font-bold">{common.dashboard}</h1>
        <Button onClick={() => setIsCreateEventDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {events.createEvent}
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{events.totalEvents}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-charity-primary mr-2" />
              <span className="text-2xl font-bold">{totalEvents}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{events.totalVolunteers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-charity-primary mr-2" />
              <span className="text-2xl font-bold">{totalVolunteers}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{common.events}</span>
          </TabsTrigger>
          <TabsTrigger value="volunteers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{common.volunteers}</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <CardTitle>{events.myEvents}</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={`${common.search} ${common.events.toLowerCase()}...`}
                      className="pl-10 w-full md:w-60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={common.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{common.all}</SelectItem>
                      <SelectItem value="active">{common.active}</SelectItem>
                      <SelectItem value="draft">{common.draft}</SelectItem>
                      <SelectItem value="completed">{common.completed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{common.event}</TableHead>
                    <TableHead>{events.date}</TableHead>
                    <TableHead>{events.category}</TableHead>
                    <TableHead>{common.volunteers}</TableHead>
                    <TableHead>{common.status}</TableHead>
                    <TableHead>{common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {event.category === "Environment" ? categories.environment : 
                         event.category === "Health" ? categories.health :
                         event.category === "Poverty" ? categories.poverty :
                         event.category === "Education" ? categories.education :
                         event.category === "Animals" ? categories.animals :
                         event.category === "Community" ? categories.community :
                         event.category}
                      </TableCell>
                      <TableCell>
                        {event.volunteers.joined}/{event.volunteers.needed}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.status === "Active" 
                            ? "bg-green-100 text-green-700" 
                            : event.status === "Draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {event.status === "Active" ? common.active : 
                           event.status === "Draft" ? common.draft : 
                           common.completed}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = `/event/${event.id}`}>
                              {common.view}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                              {common.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageVolunteers(event.id)}>
                              {events.manageVolunteers}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => confirmDeleteEvent(event.id)}>
                              {common.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">{events.noEventsFound}</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" 
                      ? events.adjustFilters
                      : events.noEventsCreated}
                  </p>
                  {(searchQuery || statusFilter !== "all") && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      {events.clearFilters}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Volunteers Tab */}
        <TabsContent value="volunteers">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <CardTitle>{common.volunteers}</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={`${common.search} ${common.volunteers.toLowerCase()}...`}
                    className="pl-10 w-full md:w-60"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{russianContent.volunteers.name}</TableHead>
                    <TableHead>{russianContent.volunteers.email}</TableHead>
                    <TableHead>{russianContent.volunteers.phone}</TableHead>
                    <TableHead>{russianContent.volunteers.event}</TableHead>
                    <TableHead>{russianContent.volunteers.joinDate}</TableHead>
                    <TableHead>{common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteersData.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell className="font-medium">{volunteer.name}</TableCell>
                      <TableCell>{volunteer.email}</TableCell>
                      <TableCell>{volunteer.phone}</TableCell>
                      <TableCell>{volunteer.event}</TableCell>
                      <TableCell>
                        {new Date(volunteer.joinDate).toLocaleDateString("ru-RU")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast.success(`Контактная форма для ${volunteer.name}`)}>
                              {common.contact}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success(`Форма назначения задачи для ${volunteer.name}`)}>
                              {russianContent.volunteers.assignTask}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => confirmDeleteVolunteer(volunteer.id)}>
                              {common.remove}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Event Dialog */}
      <EventForm
        open={isCreateEventDialogOpen}
        onOpenChange={setIsCreateEventDialogOpen}
        onSave={handleCreateEvent}
      />
      
      {/* Edit Event Dialog */}
      {currentEvent && (
        <EventForm
          open={isEditEventDialogOpen}
          onOpenChange={setIsEditEventDialogOpen}
          event={currentEvent}
          onSave={handleSaveEvent}
        />
      )}
      
      {/* Volunteer Management Dialog */}
      {currentEventForVolunteers && (
        <VolunteerManagementForm
          open={isVolunteerManagementOpen}
          onOpenChange={setIsVolunteerManagementOpen}
          eventTitle={currentEventForVolunteers.title}
          volunteers={volunteersData.filter(v => v.event === currentEventForVolunteers.title)}
        />
      )}
      
      {/* Delete Event Confirmation */}
      <ConfirmationModal
        open={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        title={russianContent.modals.deleteEvent}
        description={russianContent.modals.deleteWarning}
        onConfirm={handleDeleteEvent}
        danger={true}
      />
      
      {/* Delete Volunteer Confirmation */}
      <ConfirmationModal
        open={isVolunteerDeleteConfirmOpen}
        onOpenChange={setIsVolunteerDeleteConfirmOpen}
        title={russianContent.modals.deleteVolunteer}
        description={russianContent.modals.deleteWarning}
        onConfirm={handleDeleteVolunteer}
        danger={true}
      />
    </div>
  );
};

export default OrganizerPanel;