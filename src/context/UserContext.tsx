import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);

  const getUserById = (id: string) => users.find((user) => user.id === id);

  return (
    <UserContext.Provider value={{ users, setUsers, getUserById }}>
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
