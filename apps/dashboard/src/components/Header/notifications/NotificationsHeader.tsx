import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";

interface NotificationsHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const NotificationsHeader = ({
  activeTab,
  onTabChange,
}: NotificationsHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
      <span className="text-[17px] tracking-tight">Notifications</span>
      <TabsList className="bg-gray-100/80 p-0.5 h-auto rounded-lg">
        <TabsTrigger
          value="All"
          className="px-3 py-1 text-[13px] font-medium rounded-md transition-all shadow-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
        >
          All
        </TabsTrigger>
        <TabsTrigger
          value="Unread"
          className="px-3 py-1 text-[13px] font-medium rounded-md transition-all shadow-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
        >
          Unread
        </TabsTrigger>
      </TabsList>
    </div>
  );
};
