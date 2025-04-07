
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { russianContent } from "@/lib/localization/russianContent";

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
    donations: { goal: number; raised: number };
    status: string;
  };
  onSave: (eventData: any) => void;
}

export const EventForm = ({ open, onOpenChange, event, onSave }: EventFormProps) => {
  const { events, categories, common } = russianContent;
  const isEditing = !!event;

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date || "",
    time: "",
    location: event?.location || "",
    category: event?.category || "",
    volunteersNeeded: event?.volunteers.needed || 0,
    fundraisingGoal: event?.donations.goal || 0,
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (isDraft: boolean = false) => {
    // Validation
    if (!formData.title || !formData.description || !formData.date || !formData.location) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const eventData = {
      ...formData,
      status: isDraft ? "Draft" : "Active",
      volunteers: {
        needed: Number(formData.volunteersNeeded),
        joined: event?.volunteers.joined || 0,
      },
      donations: {
        goal: Number(formData.fundraisingGoal),
        raised: event?.donations.raised || 0,
      },
      id: event?.id || Date.now().toString(),
    };

    onSave(eventData);
    onOpenChange(false);
    toast.success(isEditing ? "Мероприятие обновлено" : "Мероприятие создано");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? common.edit + " " + events.eventTitle : events.createEvent}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Измените информацию о мероприятии ниже."
              : "Заполните детали для создания нового мероприятия."}
          </DialogDescription>
        </DialogHeader>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="fundraising">{events.fundraisingGoal}</Label>
            <Input
              id="fundraising"
              type="number"
              min="0"
              placeholder="₽ Сумма"
              value={formData.fundraisingGoal}
              onChange={(e) => handleChange("fundraisingGoal", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleSubmit(true)}>
            {events.saveAsDraft}
          </Button>
          <Button type="button" onClick={() => handleSubmit(false)}>
            {isEditing ? common.save : events.publishEvent}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
