import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, ListTodo, MessageSquare } from "lucide-react";
import { russianContent } from "@/lib/localization/russianContent";
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isDropdown, setIsDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        setIsDropdown(containerRef.current.offsetWidth < 600);
      }
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const tabs = [
    { value: "events", label: common.myEvents, icon: <Calendar className="h-4 w-4" /> },
    { value: "tasks", label: "Мои задачи", icon: <ListTodo className="h-4 w-4" /> },
    { value: "assigned", label: "Назначенные задачи", icon: <ListTodo className="h-4 w-4" /> },
    { value: "chats", label: "Чаты", icon: <MessageSquare className="h-4 w-4" /> }, // 👈 Новая вкладка
    { value: "profile", label: common.profileInfo, icon: <User className="h-4 w-4" /> },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="bg-muted rounded-xl p-2 mb-6" ref={containerRef}>
        {isDropdown ? (
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full bg-muted rounded-md px-4 py-2">
              <SelectValue placeholder="Выберите вкладку" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <TabsList className="flex gap-2 w-full">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 bg-muted rounded-md"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        )}
      </div>

      {children}
    </Tabs>
  );
};
