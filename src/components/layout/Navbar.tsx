import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, LogIn, LogOut, Menu, X, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthModal } from "./AuthModal";
import { RegisterModal } from "./RegisterModal";
import { useWebSocket } from "@/hooks/useWebSocket";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const navigate = useNavigate();

  const socket = useWebSocket("ws://77.232.135.48:9000/ws", token);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    if (socket?.readyState === WebSocket.OPEN) socket.close();
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-charity-primary" />
          <span className="text-xl font-heading font-bold">CharityConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-foreground hover:text-charity-primary transition">Главная</Link>
          <Link to="/dashboard" className="text-foreground hover:text-charity-primary transition">Дашборд</Link>
          <Link to="/organizer" className="text-foreground hover:text-charity-primary transition">Панель управления</Link>
          
          {token ? (
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => setIsAuthModalOpen(true)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsRegisterModalOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Регистрация
              </Button>
            </>
          )}

          <Button asChild>
            <Link to="/organizer">Создать мероприятие</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden absolute w-full bg-white border-b transition-all duration-300 ease-in-out",
        isMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0 overflow-hidden"
      )}>
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <Link to="/" className="text-foreground hover:text-charity-primary transition px-2 py-2">Главная</Link>
          <Link to="/dashboard" className="text-foreground hover:text-charity-primary transition px-2 py-2">Дашборд</Link>
          <Link to="/organizer" className="text-foreground hover:text-charity-primary transition px-2 py-2">Панель управления</Link>
          
          {token ? (
            <Button variant="ghost" className="justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setIsRegisterModalOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Регистрация
              </Button>
            </>
          )}

          <Button asChild className="w-full">
            <Link to="/organizer">Создать мероприятие</Link>
          </Button>
        </div>
      </div>

      {/* Модальные окна */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={() => setIsAuthModalOpen(true)} // После регистрации открываем вход
      />
    </nav>
  );
};