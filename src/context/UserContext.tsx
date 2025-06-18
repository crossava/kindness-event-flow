import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
  phone?: string;
  address?: string;
  telegram_id?: string
  vk_id?: string
}

interface UserContextType {
  users: User[];
  setUsers: (users: User[]) => void;
  getUserById: (id: string) => User | undefined;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
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

  const reloadCurrentUser = async () => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  return (
    <UserContext.Provider
      value={{
        users,
        setUsers,
        getUserById,
        currentUser,
        setCurrentUser,
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
