import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {SiTelegram, SiV, SiVk} from "react-icons/si";
import { Mail } from "lucide-react";
import { russianContent } from "@/lib/localization/russianContent";

interface Recipient {
  id: string;
  name: string;
  email: string;
  telegram_id?: string;
  vk_id?: string;
}

interface MessageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: Recipient;
  onSend: () => void; // Можно оставить для совместимости, но не используется
}

export const MessageForm = ({ open, onOpenChange, recipient }: MessageFormProps) => {
  const { chat, common } = russianContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Контактная информация: {recipient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{recipient.email || "—"}</span>
              </div>

              <div className="flex items-center gap-2">
                <SiTelegram className="h-4 w-4 text-blue-500" />
                <span>{recipient.telegram_id || "—"}</span>
              </div>

              <div className="flex items-center gap-2">
                <SiVk className="h-4 w-4 text-blue-700" />
                <span>{recipient.vk_id || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {common.close || "Закрыть"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
