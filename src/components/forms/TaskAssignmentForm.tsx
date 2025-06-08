import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { russianContent } from "@/lib/localization/russianContent";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";

interface Volunteer {
  id: string;
  name: string;
  email: string;
}

interface TaskAssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteer: Volunteer;
  eventId: string;
  createdBy: string;
  onAssign: () => void;
}

export const TaskAssignmentForm = ({
  open,
  onOpenChange,
  volunteer,
  eventId,
  createdBy,
  onAssign,
}: TaskAssignmentFormProps) => {
  const { sendMessage } = useSharedWebSocket();
  const { volunteers: vol, common } = russianContent;

  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleChange = (field: string, value: string) => {
    setTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!task.title || !task.description || !task.dueDate) {
      return;
    }

    sendMessage({
      topic: "event_requests",
      message: {
        action: "assign_task",
        data: {
          title: task.title,
          description: task.description,
          deadline: new Date(task.dueDate).toISOString(),
          assigned_to: volunteer.id,
          event_id: eventId,
          attachments: [],
          comments: [],
          created_by: createdBy,
        },
      },
    });

    onAssign(); // закрываем модалку и т.д.
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {vol.assignTask}: {volunteer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">{vol.taskTitle}</Label>
            <Input
              id="taskTitle"
              value={task.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Введите название задачи"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskDescription">{vol.taskDescription}</Label>
            <Textarea
              id="taskDescription"
              value={task.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Опишите задачу"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">{vol.taskDueDate}</Label>
            <Input
              id="dueDate"
              type="date"
              value={task.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {common.cancel}
          </Button>
          <Button onClick={handleSubmit}>
            {common.assign}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
