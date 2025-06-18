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
import {useEffect, useRef, useState} from "react";
import { useSharedWebSocket } from "@/hooks/WebSocketProvider";
import { useUserContext } from "@/context/UserContext";
import {SERVER_IP} from "@/hooks/DevelopmentConfig.ts";
import { X } from "lucide-react";


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
  status?: string;
}

interface TaskDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
}

const statusMap = {
  "В процессе": "in_progress",
  "Закрыто": "closed",
};

const reverseStatusMap = {
  "in_progress": "В процессе",
  "closed": "Закрыто",
};

export const TaskDetailSidebar = ({ open, onClose, task, onTaskUpdate }: TaskDetailSidebarProps) => {
  const { getUserById, currentUser } = useUserContext();
  const { sendMessage, lastMessage } = useSharedWebSocket();

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("description");

  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedStatus, setEditedStatus] = useState(
    reverseStatusMap[task.status] || "В процессе"
  );
  const [localTask, setLocalTask] = useState<Task>(task);


  const didRequestRef = useRef(false);

  useEffect(() => {
    if (open) {
      setLocalTask(task);
      setEditedTitle(task.title);
      setEditedDescription(task.description);
      setEditedStatus(reverseStatusMap[task.status] || "В процессе");
    }
  }, [open, task]);

  useEffect(() => {
    if (open && localTask._id && !didRequestRef.current) {
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_task_comments",
          data: { task_id: localTask._id },
        },
      });
      sendMessage({
        topic: "event_requests",
        message: {
          action: "get_task_attachments",
          data: { task_id: localTask._id },
        },
      });
      didRequestRef.current = true;
    }
  }, [open, localTask._id, sendMessage]);

  useEffect(() => {
    if (!open) didRequestRef.current = false;
  }, [open]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const parsed = typeof lastMessage === "string" ? JSON.parse(lastMessage) : lastMessage;
      const { message } = parsed;

      if (message?.action === "get_task_comments" && message.status === "success") {
        setComments(message.data.comments || []);
      }

      if (message?.action === "add_task_comment" && message.status === "success") {
        const newComment = message?.message?.comment;
        if (newComment?.task_id === localTask._id) {
          setComments((prev) => [...prev, newComment]);
        }
      }

      if (message?.action === "get_task_attachments" && message.status === "success") {
        const files = message?.message?.attachments || [];
        setAttachments(files.map((url: string) => ({
          name: url.split("/").pop() || "файл",
          url,
        })));
      }

      if (message?.action === "update_task" && message.status === "success") {
        const updated = message.message?.updated_task;
        if (updated?._id === localTask._id) {
          setEditedTitle(updated.title);
          setEditedDescription(updated.description);
          setEditedStatus(reverseStatusMap[updated.status] || "В процессе");

          const updatedTask: Task = {
            ...localTask,
            title: updated.title,
            description: updated.description,
            status: updated.status,
          };

          setLocalTask(updatedTask);
          onTaskUpdate(updatedTask);
        }
      }


      if (message?.action === "add_task_attachment" && message?.message?.status === "success") {
        const { task_id, attachments: newUrls } = message.message;
        if (task_id === localTask._id && Array.isArray(newUrls)) {
          const mapped = newUrls.map((url: string) => ({
            name: url.split("/").pop() || "файл",
            url,
          }));
          setAttachments((prev) => [...prev, ...mapped]);
        }
      }

    } catch (e) {
      console.error("Ошибка парсинга WebSocket:", e);
    }
  }, [lastMessage, localTask._id]);

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
          task_id: localTask._id,
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
    setNewAttachments((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleUploadAttachments = async () => {
    if (newAttachments.length === 0) return;
    const formData = new FormData();
    formData.append("task_id", localTask._id);
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
              user_id: currentUser.id,
              task_id: localTask._id,
              attachments: uploadedUrls,
            },
          },
        });

        setNewAttachments([]);
      }
    } catch (err) {
      console.error("Ошибка загрузки файлов:", err);
    }
  };

  const handleSaveEdit = () => {
    sendMessage({
      topic: "event_requests",
      message: {
        action: "update_task",
        data: {
          _id: localTask._id,
          title: editedTitle,
          description: editedDescription,
          status: statusMap[editedStatus],
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="fixed right-0 top-0 bottom-0 w-full max-w-md h-screen m-0 rounded-none shadow-xl !translate-x-0 !translate-y-0 !left-auto flex flex-col p-0">

        <div className="sticky top-0 z-20 bg-white border-b px-4 pt-4 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">{localTask.title}</h2>
          <p className="text-sm text-muted-foreground">
            Дедлайн: {localTask.deadline ? new Date(localTask.deadline).toLocaleDateString("ru-RU") : "—"}
          </p>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="description"><FileText className="h-4 w-4 mr-1" />Описание</TabsTrigger>
              <TabsTrigger value="comments"><MessageSquareText className="h-4 w-4 mr-1" />Комментарии</TabsTrigger>
              <TabsTrigger value="attachments"><Paperclip className="h-4 w-4 mr-1" />Вложения</TabsTrigger>
              {localTask.created_by === currentUser.id && (
                <TabsTrigger value="edit">Редактировать</TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {activeTab === "description" && (
            <div className="py-4"><p>{localTask.description || "Нет описания."}</p></div>
          )}

          {activeTab === "comments" && (
            <div className="py-4 space-y-4 pb-28">
              {comments.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {comments.map((c, idx) => {
                    const isCurrentUser = c.user_id === currentUser.id;
                    const userName = full_name_by_user_id(c.user_id);
                    const createdAt = c.created_at
                      ? new Date(c.created_at).toLocaleString("ru-RU", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "";

                    return (
                      <div key={idx} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start gap-2`}>
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-white">
                            {userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className={`rounded-lg px-4 py-2 text-sm border ${isCurrentUser ? "bg-blue-100 border-blue-300 text-right" : "bg-gray-100 border-gray-300"}`}>
                            <div className="font-semibold text-xs text-muted-foreground mb-1">{userName}</div>
                            <p className="whitespace-pre-line break-words">{c.text}</p>
                            {createdAt && (
                              <div className="text-[10px] text-muted-foreground mt-1 text-right">
                                {createdAt}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">Нет комментариев.</p>
              )}
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="py-4 space-y-6">
              <div className="border p-4 rounded-md bg-muted">
                <label className="block text-sm font-medium mb-2">Добавить вложения</label>
                <Input type="file" multiple onChange={handleFileChange} className="cursor-pointer" />
                {newAttachments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Файлы, ожидающие загрузки:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {newAttachments.map((file, i) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                        const previewUrl = URL.createObjectURL(file);

                        return (
                          <div key={i} className="flex items-start gap-3 p-2 border rounded-md">
                            {isImage ? (
                              <img src={previewUrl} alt={file.name} className="w-16 h-16 object-cover rounded" />
                            ) : (
                              <Paperclip className="w-6 h-6 text-muted-foreground mt-1" />
                            )}
                            <div className="text-sm break-all mt-1">{file.name}</div>
                          </div>
                        );
                      })}
                    </div>

                    <Button size="sm" className="mt-4" onClick={handleUploadAttachments}>
                      Загрузить выбранные файлы
                    </Button>
                  </div>
                )}
              </div>

              <div className="border p-4 rounded-md bg-white">
                <p className="text-sm font-medium mb-2">Загруженные вложения:</p>
                {attachments.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {attachments.map((file, index) => {
                      const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(file.url);
                      return (
                        <li key={index} className="flex items-center gap-3 p-2 border rounded-md">
                          {isImage ? (
                            <img src={file.url} alt={file.name} className="w-16 h-16 object-cover rounded border" />
                          ) : (
                            <Paperclip className="w-6 h-6 text-muted-foreground" />
                          )}
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                            {file.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Нет загруженных вложений.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "edit" && localTask.created_by === currentUser.id && (
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <Textarea rows={4} value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Статус</label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="В процессе">В процессе</option>
                  <option value="Закрыто">Закрыто</option>
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveEdit}>Сохранить</Button>
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
