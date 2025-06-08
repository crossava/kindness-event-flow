import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
  FileText, MessageSquareText, Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";
import { useUserContext } from "@/context/UserContext";
import {SERVER_IP} from "@/hooks/DevelopmentConfig.ts";

interface Comment {
  user_id: string;
  text: string;
  attachments?: string[];
  created_at?: string;
  task_id?: string;
}

interface Attachment {
  name: string;
  url: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  deadline?: string;
  attachments?: Attachment[];
  comments?: Comment[];
}

interface TaskDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

export const TaskDetailSidebar = ({ open, onClose, task }: TaskDetailSidebarProps) => {
  const { getUserById } = useUserContext();
  const { currentUser } = useUserContext();
  const { sendMessage, lastMessage } = useSharedWebSocket();

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (open && task._id) {
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_task_comments",
          data: { task_id: task._id },
        },
      });
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_task_attachments",
          data: { task_id: task._id },
        },
      });
    }
  }, [open, task._id, sendMessage]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const parsed = typeof lastMessage === "string" ? JSON.parse(lastMessage) : lastMessage;
      if (parsed?.message?.action === "get_task_comments" && parsed?.message?.status === "success") {
        setComments(parsed.message.data.comments || []);
      }
      if (parsed?.message?.action === "add_task_comment" && parsed?.message?.status === "success") {
        const newComment = parsed.message?.message?.comment;
        if (newComment?.task_id === task._id) {
          setComments((prev) => [...prev, newComment]);
        }
      }
      if (parsed?.message?.action === "get_task_attachments" && parsed?.message?.status === "success") {
        const files = parsed.message?.message?.attachments || [];
        setAttachments(
          files.map((url: string) => ({
            name: url.split("/").pop() || "файл",
            url,
          }))
        );
      }
    } catch (e) {
      console.error("Ошибка парсинга WebSocket:", e);
    }
  }, [lastMessage, task._id]);

  const full_name_by_user_id = (user_id: string) => {
    const user = getUserById(user_id);
    return user ? user.full_name : user_id;
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    sendMessage({
      topic: "event_requests",
      message: {
        action: "add_task_comment",
        data: {
          task_id: task._id,
          user_id: currentUser.id,
          text: commentText,
          attachments: [],
        },
      },
    });
    setCommentText("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setNewAttachments((prev) => [...prev, ...filesArray]);
  };

  const handleUploadAttachments = async () => {
    if (newAttachments.length === 0) return;
    const formData = new FormData();
    formData.append("task_id", task._id);
    newAttachments.forEach((file) => formData.append("attachments", file));
    try {
      const response = await fetch(`${SERVER_IP}/upload-task-attachments`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.status === "success") {
        const uploadedUrls = result.uploaded || [];
        sendMessage({
          topic: "event_requests",
          message: {
            action: "add_task_attachment",
            data: {
              task_id: task._id,
              attachments: uploadedUrls,
            },
          },
        });
        setAttachments((prev) => [
          ...prev,
          ...uploadedUrls.map((url: string) => ({
            name: url.split("/").pop() || "файл",
            url,
          })),
        ]);
        setNewAttachments([]);
      }
    } catch (err) {
      console.error("Ошибка загрузки файлов:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="fixed right-0 top-0 bottom-0 w-full max-w-md h-screen m-0 rounded-none shadow-xl !translate-x-0 !translate-y-0 !left-auto flex flex-col p-0">
        <div className="sticky top-0 z-20 bg-white border-b px-4 pt-4 pb-2">
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <p className="text-sm text-muted-foreground">
            Дедлайн: {task.deadline ? new Date(task.deadline).toLocaleDateString("ru-RU") : "—"}
          </p>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="description"><FileText className="h-4 w-4 mr-1" />Описание</TabsTrigger>
              <TabsTrigger value="comments"><MessageSquareText className="h-4 w-4 mr-1" />Комментарии</TabsTrigger>
              <TabsTrigger value="attachments"><Paperclip className="h-4 w-4 mr-1" />Вложения</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {activeTab === "description" && (
            <div className="py-4"><p>{task.description || "Нет описания."}</p></div>
          )}

          {activeTab === "comments" && (
            <div className="py-4 space-y-4 pb-28">
              {comments.length > 0 ? (
                comments.map((c, idx) => (
                  <div key={idx} className="p-2 border rounded-md">
                    <p className="text-sm font-medium">Пользователь: {full_name_by_user_id(c.user_id)}</p>
                    <p>{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Нет комментариев.</p>
              )}
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="py-4 space-y-4">
              <div>
                <Input type="file" multiple onChange={handleFileChange} />
                {newAttachments.length > 0 && (
                  <div className="mt-2">
                    <ul className="list-disc list-inside text-sm">
                      {newAttachments.map((f, i) => (
                        <li key={i}>{f.name}</li>
                      ))}
                    </ul>
                    <Button className="mt-2" size="sm" onClick={handleUploadAttachments}>Загрузить</Button>
                  </div>
                )}
              </div>
              <div>
                {attachments.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    {attachments.map((file, index) => {
                      const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(file.url);
                      return (
                        <li key={index}>
                          {isImage ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="max-w-full h-auto rounded border"
                            />
                          ) : (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {file.name}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Нет вложений.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {activeTab === "comments" && (
          <div className="sticky bottom-0 bg-white border-t px-4 py-3 z-10">
            <Textarea
              placeholder="Напишите комментарий..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={handleSendComment} disabled={!commentText.trim()}>
                Отправить
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
