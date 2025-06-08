
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, User, Calendar, ListTodo } from "lucide-react";
import { russianContent } from "@/lib/localization/russianContent";

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
  const { common } = russianContent;

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8"> {/* увеличено до 3 */}
        <TabsTrigger value="events" className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{common.myEvents}</span>
        </TabsTrigger>

        <TabsTrigger value="tasks" className="flex items-center space-x-2">
          <ListTodo className="h-4 w-4" />
          <span>Мои задачи</span>
        </TabsTrigger>

        <TabsTrigger value="assigned" className="flex items-center space-x-2">
          <ListTodo className="h-4 w-4" />
          <span>Назначенные задачи</span>
        </TabsTrigger>

        <TabsTrigger value="profile" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{common.profileInfo}</span>
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
};
