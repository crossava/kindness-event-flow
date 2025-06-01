import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronDown, Plus, Search, Users } from "lucide-react";
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
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";
const volunteersData = [
  // можно заменить на реальные данные, если нужно
];

const OrganizerPanel = () => {
  const { common, events, categories } = russianContent;
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("events");
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null);
  const [isVolunteerManagementOpen, setIsVolunteerManagementOpen] = useState(false);
  const [currentEventForVolunteers, setCurrentEventForVolunteers] = useState<any | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isVolunteerDeleteConfirmOpen, setIsVolunteerDeleteConfirmOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);

  const { sendMessage, lastMessage, isConnected } = useSharedWebSocket();
  const userId = authService.getUserId();

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
  if (!lastMessage || typeof lastMessage !== "string") return;

  try {
    if (!lastMessage.trim().startsWith("{")) return;

    const data = JSON.parse(lastMessage);
    const action = data?.message?.action;
    const payload = data?.message?.message;

    console.log("action: ", action);
    console.log("status: ", payload?.status);

    if (action === "get_user_events" && payload?.status === "success") {
      console.log("✅ checked");
      const events = (payload.created_events || []).map((e: any) => ({
        ...e,
        id: e._id,
      }));
      setOrganizerEvents(events);
    }

    if (action === "create_event" && payload?.status === "success") {
      const raw = payload.event;
      const newEvent = {
        ...raw,
        id: raw._id,
        volunteers: {
          joined: raw.volunteers?.length || 0,
          needed: raw.required_volunteers,
        },
      };
      setOrganizerEvents((prev) => [...prev, newEvent]);
    }

    if (action === "update_event" && payload?.status === "success") {
      const updated = { ...payload.event, id: payload.event._id };
      setOrganizerEvents((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
    }

  } catch (err) {
    console.error("Ошибка обработки сообщения:", err);
  }
}, [lastMessage]);



  const filteredEvents = organizerEvents.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleCreateEvent = () => {
    setIsCreateEventDialogOpen(false); // просто закрываем, данные придут из сокета
  };

  const handleEditEvent = (eventId: string) => {
    const event = organizerEvents.find(e => e.id === eventId);
    if (event) {
      setCurrentEvent(event);
      setIsEditEventDialogOpen(true);
    }
  };

  const handleSaveEvent = () => {
    setIsEditEventDialogOpen(false); // обновление придет по сокету
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
    if (!eventToDelete || !isConnected) return;

    sendMessage({
        topic: "event_requests",
        message: {
        action: "delete_event",
        data: {
            _id: eventToDelete,
        },
        },
  });

  // Закрываем модалку, пока результат придёт по сокету
  setIsDeleteConfirmationOpen(false);
  };

  const confirmDeleteVolunteer = (volunteerId: string) => {
    setVolunteerToDelete(volunteerId);
    setIsVolunteerDeleteConfirmOpen(true);
  };

  const handleDeleteVolunteer = () => {
    toast.success("Волонтер удален!");
    setIsVolunteerDeleteConfirmOpen(false);
  };

  const totalEvents = organizerEvents.length;
  const totalVolunteers = organizerEvents.reduce((sum, event) => sum + (event.volunteers?.joined || 0), 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-heading font-bold">{common.dashboard}</h1>
        <Button onClick={() => setIsCreateEventDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {events.createEvent}
        </Button>
      </div>

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
          <TabsTrigger value="events">{common.events}</TabsTrigger>
          <TabsTrigger value="volunteers">{common.volunteers}</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <Input
                  placeholder={`${common.search}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
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
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{new Date(event.start_datetime).toLocaleDateString("ru-RU")}</TableCell>
                      <TableCell>{categories[event.category] || event.category}</TableCell>
                      <TableCell>{event.volunteers?.joined || 0}/{event.required_volunteers}</TableCell>
                      <TableCell>{event.status}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteers">
          <Card>
            <CardHeader>
              <CardTitle>{common.volunteers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Здесь будет список волонтеров (можно подключить по аналогии).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EventForm
        open={isCreateEventDialogOpen}
        onOpenChange={setIsCreateEventDialogOpen}
        onSave={handleCreateEvent}
      />

      {currentEvent && (
        <EventForm
          open={isEditEventDialogOpen}
          onOpenChange={setIsEditEventDialogOpen}
          event={currentEvent}
          onSave={handleSaveEvent}
        />
      )}

      {currentEventForVolunteers && (
        <VolunteerManagementForm
          open={isVolunteerManagementOpen}
          onOpenChange={setIsVolunteerManagementOpen}
          eventTitle={currentEventForVolunteers.title}
          volunteers={volunteersData.filter(v => v.event === currentEventForVolunteers.title)}
        />
      )}

      <ConfirmationModal
        open={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        title={russianContent.modals.deleteEvent}
        description={russianContent.modals.deleteWarning}
        onConfirm={handleDeleteEvent}
        danger={true}
      />

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
