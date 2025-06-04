// src/context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/api/authService";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
}

interface UserContextType {
  users: User[];
  setUsers: (users: User[]) => void;
  getUserById: (id: string) => User | undefined;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void; // <--- Добавить это
  isLoading: boolean;
  isAuthenticated: boolean;
  reloadCurrentUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserById = (id: string) => users.find((user) => user.id === id);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      const userId = authService.getUserId();
      console.log("loadUser: token=", token, "userId=", userId);

      if (!token || !userId) {
        setCurrentUser(null);
        return;
      }

      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (e) {
      console.error("Ошибка загрузки пользователя", e);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadUser();
  }, []);

  const reloadCurrentUser = async () => {
    await loadUser();
  };

  return (
    <UserContext.Provider
      value={{
        users,
        setUsers,
        getUserById,
        currentUser,
        setCurrentUser, // <--- Обязательно добавь это
        isLoading,
        isAuthenticated: !!currentUser,
        reloadCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
