// src/components/layout/RegisterModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authService } from "@/api/authService";
import { ConfirmationModal } from "./ConfirmationModal";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterModal = ({ isOpen, onClose, onRegisterSuccess }: RegisterModalProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.register(email, password, fullName, role, phone);
      setShowConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (code: string) => {
    await authService.confirmRegistration(email, code);
    onRegisterSuccess?.();
  };

  const handleBackToRegister = () => {
    setShowConfirmation(false);
  };

  const [phone, setPhone] = useState("");

  return (
    <>
      <Dialog open={isOpen && !showConfirmation} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Регистрация</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
                <Label htmlFor="fullName">Полное имя</Label>
                <Input
                id="fullName"
                type="text"
                placeholder="Иван Иванов"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                />
            </div>
            <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 900 123-45-67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={showConfirmation}
        email={email}
        onClose={() => {
          setShowConfirmation(false);
          onClose();
        }}
        onConfirm={handleConfirmation}
        onBack={handleBackToRegister}
      />
    </>
  );
};