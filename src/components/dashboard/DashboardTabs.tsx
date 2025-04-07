
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, User, Calendar } from "lucide-react";

interface DashboardTabsProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardTabs = ({
  children,
  activeTab,
  setActiveTab,
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="events" className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>My Events</span>
        </TabsTrigger>
        <TabsTrigger value="donations" className="flex items-center space-x-2">
          <Heart className="h-4 w-4" />
          <span>My Donations</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>Profile Info</span>
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};
