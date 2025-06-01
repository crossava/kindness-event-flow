import { createContext, useContext, useState } from "react";

interface Event {
  _id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  location: string;
  required_volunteers: number;
  volunteers?: string[];
  donations?: {
    raised: number;
    goal: number;
  };
  photo_url?: string;
  category: string;
  status: string;
  created_by: string;
  updated_by: string;
}

interface EventContextType {
  events: Event[];
  setEvents: (events: Event[]) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEventContext must be used within EventProvider");
  return ctx;
};

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);

  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
};
