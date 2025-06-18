// context/OrganizerPanelContext.ts
import { createContext, useState } from "react";

interface OrganizerPanelContextType {
  organizerEvents: any[];
  setOrganizerEvents: (tasks: any[]) => void;
}

export const OrganizerPanelContext = createContext<OrganizerPanelContextType>({
  organizerEvents: [],
  setOrganizerEvents: () => {},
});

export const OrganizerPanelProvider = ({ children }: { children: React.ReactNode }) => {
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);

  return (
    <OrganizerPanelContext.Provider
      value={{
        organizerEvents,
        setOrganizerEvents,
      }}
    >
      {children}
    </OrganizerPanelContext.Provider>
  );
};
