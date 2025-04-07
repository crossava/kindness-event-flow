
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { russianContent } from "@/lib/localization/russianContent";

interface Recipient {
  id: string;
  name: string;
  email: string;
}

interface MessageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: Recipient;
  onSend: () => void;
}

export const MessageForm = ({ open, onOpenChange, recipient, onSend }: MessageFormProps) => {
  const { chat, common } = russianContent;
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) {
      return;
    }
    
    // Here you would typically send this to your backend
    console.log("Sending message:", {
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      message,
    });
    
    // Call the callback
    onSend();
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {chat.sendMessage}: {recipient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-md mb-4">
            <p className="font-medium">{recipient.name}</p>
            <p className="text-sm text-muted-foreground">{recipient.email}</p>
          </div>
          
          <Textarea
            placeholder={chat.typeMessage}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!message.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {chat.sendMessage}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
