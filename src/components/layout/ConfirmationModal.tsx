// src/components/layout/ConfirmationModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onConfirm: (code: string) => Promise<void>;
  onBack?: () => void;
}

export const ConfirmationModal = ({
  isOpen,
  email,
  onClose,
  onConfirm,
  onBack,
}: ConfirmationModalProps) => {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(confirmationCode);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка подтверждения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение регистрации</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            На email <span className="font-semibold">{email}</span> отправлен код подтверждения
          </p>
          <div>
            <Label htmlFor="confirmationCode">Код подтверждения</Label>
            <Input
              id="confirmationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="1234"
              value={confirmationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setConfirmationCode(value.slice(0, 4));
              }}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onBack}
                disabled={isLoading}
              >
                Назад
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || confirmationCode.length !== 4}
            >
              {isLoading ? "Подтверждение..." : "Подтвердить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};