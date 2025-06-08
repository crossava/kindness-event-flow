import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CheckCircle,
  UserCheck,
  Clipboard,
  MessageSquare,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { russianContent } from "@/lib/localization/russianContent";
import { TaskAssignmentForm } from "./TaskAssignmentForm";
import { MessageForm } from "./MessageForm";
import { useUserContext } from "@/context/UserContext";

interface Volunteer {
  _id: string;
  full_name: string;
  email: string;
  created_at: string;
  event: string;
}

interface VolunteerManagementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventId: string;
  volunteers: Volunteer[];
}

export const VolunteerManagementForm = ({
  open,
  onOpenChange,
  eventTitle,
  eventId,
  volunteers,
}: VolunteerManagementFormProps) => {
  const { volunteers: vol, common } = russianContent;
  const { currentUser } = useUserContext();

  const [activeTab, setActiveTab] = useState("volunteers");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      volunteer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignTask = (volunteerId: string) => {
    const volunteer = volunteers.find((v) => v._id === volunteerId);
    if (volunteer) {
      setSelectedVolunteer(volunteer);
      setIsAssignTaskOpen(true);
    }
  };

  const handleContact = (volunteerId: string) => {
    const volunteer = volunteers.find((v) => v._id === volunteerId);
    if (volunteer) {
      setSelectedVolunteer(volunteer);
      setIsMessageOpen(true);
    }
  };

  const handleTaskAssigned = () => {
    toast.success(`Задача назначена для ${selectedVolunteer?.full_name}`);
    setIsAssignTaskOpen(false);
  };

  const handleMessageSent = () => {
    toast.success(`Сообщение отправлено ${selectedVolunteer?.full_name}`);
    setIsMessageOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {common.manage} {common.volunteers}: {eventTitle}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="volunteers" className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>{common.volunteers}</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center space-x-2">
                <Clipboard className="h-4 w-4" />
                <span>{vol.assignTask}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="volunteers">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {common.volunteers}: {filteredVolunteers.length}
                  </h3>
                  <div className="relative w-64">
                    <Input
                      placeholder={`${common.search} ${common.volunteers.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{vol.name}</TableHead>
                      <TableHead>{vol.email}</TableHead>
                      <TableHead>{vol.joinDate}</TableHead>
                      <TableHead>{common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVolunteers.map((volunteer) => (
                      <TableRow key={volunteer._id}>
                        <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                        <TableCell>{volunteer.email}</TableCell>
                        <TableCell>
                          {new Date(volunteer.created_at).toLocaleDateString("ru-RU")}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleContact(volunteer._id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {common.contact}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignTask(volunteer._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {common.assign}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredVolunteers.length === 0 && (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {common.volunteers} не найдены
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Попробуйте изменить поисковый запрос." : "К этому мероприятию еще не присоединились волонтеры."}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <div className="text-center py-12">
                <Clipboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Управление задачами</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Выберите волонтера из списка волонтеров, чтобы назначить ему задачу.
                </p>
                <Button onClick={() => setActiveTab("volunteers")}>
                  {common.view} {common.volunteers}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedVolunteer && (
        <>
          <TaskAssignmentForm
            open={isAssignTaskOpen}
            onOpenChange={setIsAssignTaskOpen}
            volunteer={{
              id: selectedVolunteer._id,
              name: selectedVolunteer.full_name,
              email: selectedVolunteer.email,
            }}
            eventId={eventId}
            createdBy={currentUser.id}
            onAssign={handleTaskAssigned}
          />
          <MessageForm
            open={isMessageOpen}
            onOpenChange={setIsMessageOpen}
            recipient={selectedVolunteer}
            onSend={handleMessageSent}
          />
        </>
      )}
    </>
  );
};
