// src/api/authService.ts
import { SERVER_IP, WEBSOCKET_IP } from '../hooks/DevelopmentConfig';

const API_BASE_URL = SERVER_IP;
const WS_URL = WEBSOCKET_IP;

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
  phone?: string;
  address?: string;
  telegram_id?: string;
  vk_id?: string;
}

export const authService = {
  // ====== TOKEN ======
  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  removeToken: () => {
    localStorage.removeItem("token");
  },

  // ====== USER ID ======
  setUserId: (userId: string) => {
    localStorage.setItem("user_id", userId);
  },

  getUserId: (): string | null => {
    return localStorage.getItem("user_id");
  },

  removeUserId: () => {
    localStorage.removeItem("user_id");
  },

  // ====== CURRENT USER ======
  setCurrentUser: (user: User) => {
    console.log("setCurrentUser", user);
    console.log("json user", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify(user));
  },

  getCurrentUser: (): User | null => {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;

    try {
      console.log("user profile", JSON.parse(raw));
      return JSON.parse(raw);
    } catch (e) {
      console.error("Ошибка при парсинге currentUser:", e);
      return null;
    }
  },

  removeCurrentUser: () => {
    localStorage.removeItem("currentUser");
  },

  // ====== LOGIN ======
  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Неверные учетные данные");
    }

    const data = await response.json();
    const userBody = data.message?.body;

    const userId = userBody?.user_id;

    if (!userId) {
      throw new Error("Токен или ID пользователя отсутствует");
    }

    // Извлекаем только нужные поля
    const user: User = {
      id: userId,
      email: userBody.email,
      full_name: userBody.full_name,
      role: userBody.role,
      phone: userBody.phone,
      address: userBody.address,
      created_at: userBody.created_at,
      telegram_id: userBody.telegram_id,
      vk_id: userBody.vk_id,
    };

    console.log("userBody from login response", userBody);

    authService.setUserId(userId);
    authService.setCurrentUser(user);

    return user;
  },

  // ====== LOGOUT ======
  logout: (socket: WebSocket | null) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.close();
    }
    authService.removeToken();
    authService.removeUserId();
    authService.removeCurrentUser();
  },

  // ====== REGISTER ======
  register: async (
    email: string,
    password: string,
    fullName: string,
    role: string,
    phone: string,
    address: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        full_name: fullName,
        password,
        role,
        phone,
        address,
      }),
    });

    const data = await response.json();

    if (!response.ok || data?.message?.status === "error") {
      const msg =
        data?.message?.text || data?.message || "Ошибка регистрации";
      throw new Error(msg);
    }

    return data;
  },

  // ====== CONFIRM REGISTRATION ======
  confirmRegistration: async (email: string, confirmationCode: string) => {
    const response = await fetch(`${API_BASE_URL}/confirm-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        confirmation_code: confirmationCode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка подтверждения регистрации");
    }

    return await response.json();
  },

  // ====== INIT WEBSOCKET ======
  initWebSocket: (token: string | null): WebSocket | null => {
    if (!token) return null;
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    return ws;
  },
};
