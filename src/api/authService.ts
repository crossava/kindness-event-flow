// api/authService.ts
import { useWebSocket } from "@/hooks/useWebSocket";

const API_BASE_URL = "http://77.232.135.48:4000";
const WS_URL = "ws://77.232.135.48:4000/ws";

export const authService = {
  // Сохраняем токен в localStorage
  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  // Получаем токен из localStorage
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // Удаляем токен
  removeToken: () => {
    localStorage.removeItem("token");
  },

  // Вход в систему
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Неверные учетные данные");
    }

    const data = await response.json();
    return data.token;
  },

  // Регистрация
  register: async (email: string, password: string, fullName: string, role: string) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        full_name: fullName,
        password,
        role
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка регистрации");
    }

    return await response.json();
  },

  // Инициализация WebSocket соединения
  initWebSocket: (token: string | null) => {
    if (!token) return null;
    return useWebSocket(WS_URL, token);
  },

  // Выход из системы
  logout: (socket: WebSocket | null) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.close();
    }
    authService.removeToken();
  },

  // Подтверждение регистрации
  confirmRegistration: async (email: string, confirmationCode: string) => {
    const response = await fetch(`${API_BASE_URL}/confirm-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email, 
        confirmation_code: confirmationCode 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка подтверждения регистрации");
    }

    return await response.json();
  },
};