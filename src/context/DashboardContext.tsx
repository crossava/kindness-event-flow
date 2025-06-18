// context/DashboardContext.ts
import { createContext, useState } from "react";

interface DashboardContextType {
  userEvents: any[];
  volunteerEvents: any[];
  volunteerCount: number;
  userTasks: any[];
  assignedTasks: any[];
  setUserEvents: (events: any[]) => void;
  setVolunteerEvents: (events: any[]) => void;
  setVolunteerCount: (count: number) => void;
  setUserTasks: (tasks: any[]) => void;
  setAssignedTasks: (tasks: any[]) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  userEvents: [],
  volunteerEvents: [],
  volunteerCount: 0,
  userTasks: [],
  assignedTasks: [],
  setUserEvents: () => {},
  setVolunteerEvents: () => {},
  setVolunteerCount: () => {},
  setUserTasks: () => {},
  setAssignedTasks: () => {},
});

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [volunteerEvents, setVolunteerEvents] = useState<any[]>([]);
  const [volunteerCount, setVolunteerCount] = useState<number>(0);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

  return (
    <DashboardContext.Provider
      value={{
        userEvents,
        volunteerEvents,
        volunteerCount,
        userTasks,
        assignedTasks,
        setUserEvents,
        setVolunteerEvents,
        setVolunteerCount,
        setUserTasks,
        setAssignedTasks,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
