import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import {SERVER_IP} from "@/hooks/DevelopmentConfig.ts";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  event: any;
  sendMessage: (data: any) => void;
}

export const ReportUploadModal = ({ open, onOpenChange, event, sendMessage }: Props) => {
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);

  useEffect(() => {
    if (event?.report_files?.length) {
      setExistingFiles(event.report_files);
    } else {
      setExistingFiles([]);
    }
  }, [event]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewAttachments(Array.from(e.target.files));
    }
  };

  const handleUploadAttachments = async () => {
    if (!newAttachments.length) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      newAttachments.forEach((file) => formData.append("attachments", file));

      const response = await fetch(`${SERVER_IP}/upload-task-attachments`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.status === "success") {
        const uploadedUrls = result.uploaded || [];

          const allFiles = [...existingFiles, ...uploadedUrls];

          sendMessage({
            topic: "event_requests",
            message: {
              action: "update_event",
              data: {
                _id: event.id,
                report_files: allFiles,
              },
            },
          });
        setExistingFiles(allFiles);

      }

      toast.success("Файлы успешно загружены");
      setNewAttachments([]);
    } catch (err) {
      console.error(err);
      toast.error("Не удалось загрузить файлы");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отчёт: {event.title}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Список уже загруженных файлов */}
          {existingFiles.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Загруженные файлы:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {existingFiles.map((url, i) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                  const fileName = url.split("/").pop();

                  return (
                    <div key={i} className="flex items-start gap-3 p-2 border rounded-md">
                      {isImage ? (
                        <img
                          src={url}
                          alt={fileName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <Paperclip className="w-6 h-6 text-muted-foreground mt-1" />
                      )}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all mt-1 underline text-blue-600"
                      >
                        {fileName}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Загрузка новых файлов */}
          <div className="border p-4 rounded-md bg-muted">
            <label className="block text-sm font-medium mb-2">Добавить вложения</label>
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              className="cursor-pointer"
            />

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
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <Paperclip className="w-6 h-6 text-muted-foreground mt-1" />
                        )}
                        <div className="text-sm break-all mt-1">{file.name}</div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  size="sm"
                  className="mt-4"
                  onClick={handleUploadAttachments}
                  disabled={isUploading}
                >
                  {isUploading ? "Загрузка..." : "Загрузить выбранные файлы"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
