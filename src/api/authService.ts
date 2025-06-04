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
}

export const authService = {
  // ====== TOKEN ======
  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
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

  // ====== LOGIN ======
  login: async (email: string, password: string): Promise<string> => {
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
    const token = data.message.body.access_token;
    const userId = data.message?.body?.user_id;

    console.log("data post auth", data);

    if (token) authService.setToken(token);
    if (userId) authService.setUserId(userId);

    return token;
  },

  // ====== LOGOUT ======
  logout: (socket: WebSocket | null) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.close();
    }
    authService.removeToken();
    authService.removeUserId();
  },

  // ====== REGISTER ======
  register: async (
    email: string,
    password: string,
    fullName: string,
    role: string,
    phone: string
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка регистрации");
    }

    return await response.json();
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

  // ====== GET CURRENT USER ======
  getCurrentUser: (): User | null => {
    const token = authService.getToken();
    const userId = authService.getUserId();

    if (!token || !userId) return null;

    try {
      const payload = JSON.parse(
        atob(token.split('.')[1])
      ) as { sub: string; full_name?: string; role?: string; exp: number };

      return {
        id: userId,
        email: payload.sub,
        full_name: payload.full_name,
        role: payload.role,
      };
    } catch (error) {
      console.error("Ошибка при разборе токена:", error);
      return null;
    }
  },

  // ====== INIT WEBSOCKET ======
  initWebSocket: (token: string | null): WebSocket | null => {
    if (!token) return null;
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    return ws;
  },

  // ====== CREATE EVENT (через WebSocket) ======
  createEvent: async (
    eventData: {
      title: string;
      description: string;
      start_datetime: string;
      location: string;
      required_volunteers: number;
      category: string;
      created_by: string;
      photo_url: string;
    },
    socket: WebSocket | null
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return reject(new Error("WebSocket не подключён"));
      }

      const message = {
        topic: "event_requests",
        message: {
          action: "create_event",
          data: eventData,
        },
      };

      try {
        socket.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};
