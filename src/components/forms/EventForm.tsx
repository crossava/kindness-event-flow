import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { russianContent } from "@/lib/localization/russianContent";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";
import { authService } from "@/api/authService.ts";
import {SERVER_IP} from "@/hooks/DevelopmentConfig.ts";

const IMGBB_API_KEY = "fe4ecad60723598a90505950241cdeff"; // Замените на ваш API ключ

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    category: string;
    volunteers: { needed: number; joined: number };
    status: string;
    photo_url?: string;
    start_datetime?: string;
  };
  onSave: (eventData: any) => void;
}

export const EventForm = ({ open, onOpenChange, event, onSave }: EventFormProps) => {
  const { events, categories, common } = russianContent;
  const isEditing = !!event;
  const { sendMessage } = useSharedWebSocket();
  const userId = authService.getUserId();

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 10) : "",
    time: event?.start_datetime ? new Date(event.start_datetime).toISOString().slice(11, 16) : "",
    location: event?.location || "",
    category: event?.category || "",
    volunteersNeeded: event?.volunteers.needed || 0,
    photo_url: event?.photo_url || "",
    status: event?.status || "draft"
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadImageToYandex = async (file: File) => {
    setIsUploading(true);
    const form = new FormData();
    form.append("attachments", file); // только один файл
    form.append("task_id", "event_cover"); // фиктивный task_id (или придумай подходящий)

    try {
      const response = await fetch(`${SERVER_IP}/upload-task-attachments`, {
        method: "POST",
        body: form
      });

      const result = await response.json();

      if (result.status === "success") {
        const uploadedUrls = result.uploaded || [];
        if (uploadedUrls.length > 0) {
          setFormData((prev) => ({ ...prev, photo_url: uploadedUrls[0] }));
          toast.success("Фото успешно загружено");
        } else {
          toast.error("Сервер не вернул ссылку на изображение");
        }
      } else {
        toast.error("Ошибка при загрузке файла");
      }
    } catch (err) {
      console.error("Ошибка загрузки фото:", err);
      toast.error("Ошибка загрузки фото");
    } finally {
      setIsUploading(false);
    }
  };


  const handleSubmit = (isDraft: boolean = false) => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const startDateTime = `${formData.date}T${formData.time}`;

    const socketMessage = {
      topic: "event_requests",
      message: {
        action: isEditing ? "update_event" : "create_event",
        data: {
          ...(isEditing
            ? { _id: event?.id, updated_by: userId }
            : { id: Date.now().toString(), created_by: userId }),
          title: formData.title,
          description: formData.description,
          start_datetime: startDateTime,
          location: formData.location,
          required_volunteers: Number(formData.volunteersNeeded),
          photo_url: formData.photo_url || null,
          category: formData.category,
          status: isDraft ? "draft" : formData.status || "active"
        }
      }
    };

    sendMessage(socketMessage);
    onSave(socketMessage.message.data);
    onOpenChange(false);
    toast.success(isEditing ? "Мероприятие обновлено" : "Мероприятие создано");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `${common.edit} ${event?.title}` : events.createEvent}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Измените информацию о мероприятии ниже."
              : "Заполните детали для создания нового мероприятия."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">{events.eventTitle}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Введите название мероприятия"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{events.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Опишите ваше мероприятие"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{events.date}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">{events.time}</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{events.location}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Введите место проведения мероприятия"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{events.category}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animals">{categories.animals}</SelectItem>
                    <SelectItem value="environment">{categories.environment}</SelectItem>
                    <SelectItem value="health">{categories.health}</SelectItem>
                    <SelectItem value="education">{categories.education}</SelectItem>
                    <SelectItem value="poverty">{categories.poverty}</SelectItem>
                    <SelectItem value="community">{categories.community}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteers">{events.volunteersNeeded}</Label>
                <Input
                  id="volunteers"
                  type="number"
                  min="1"
                  value={formData.volunteersNeeded}
                  onChange={(e) => handleChange("volunteersNeeded", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="active">Активно</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="photo_url">{events.photo_url}</Label>
                <Input
                  id="photo_url"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      uploadImageToYandex(e.target.files[0]);
                    }
                  }}
                />
                {isUploading && <p className="text-sm text-gray-500">Загрузка фото...</p>}
                {formData.photo_url && (
                  <img
                    src={formData.photo_url}
                    alt="uploaded"
                    className="mt-2 max-h-40 rounded border"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => handleSubmit(false)} disabled={isUploading}>
            {isEditing ? common.save : events.publishEvent}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
