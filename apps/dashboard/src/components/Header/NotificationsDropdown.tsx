import React from "react";
import { 
  IconBell, 
  IconMessage, 
  IconBox, 
  IconPlus, 
  IconHeart 
} from "@tabler/icons-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

// Dummy Data matching screenshot styles
const notifications = [
  {
    id: 1,
    user: "Pixelwave",
    initials: "PI",
    bg: "bg-[#0f5132]", // Dark green/teal
    text: "text-white",
    action: "Commented on",
    target: "Classic Car in Studio",
    content: "These draggabale sliders look really cool. Maybe these could be displayed when you hold shift, t...",
    time: "1h ago",
    unread: true,
    type: "comment",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    Icon: IconMessage
  },
  {
    id: 2,
    user: "Cute Turtle is generated",
    initials: "CT",
    bg: "bg-black",
    text: "text-white",
    action: "Matte texture - UI8 Style",
    target: "",
    content: "Prompt: Create 3D character dancing",
    time: "1h ago",
    unread: true,
    type: "generation",
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
    Icon: IconBox
  },
  {
    id: 3,
    user: "3D object is generated",
    initials: "3O",
    bg: "bg-black",
    text: "text-white",
    action: "Invited you to edit",
    target: "Minimalist Architecture Scene",
    content: "",
    time: "1h ago",
    unread: true,
    type: "invite",
    iconColor: "text-green-500",
    iconBg: "bg-green-100",
    Icon: IconPlus
  },
  {
    id: 4,
    user: "Luna",
    initials: "LU",
    bg: "bg-[#d63384]", // Pink
    text: "text-white",
    action: "Liked",
    target: "Classic Car in Studio",
    content: "",
    time: "1h ago",
    unread: false,
    type: "like",
    iconColor: "text-red-500",
    iconBg: "bg-red-100",
    Icon: IconHeart
  },
  {
    id: 5,
    user: "3D object is generated",
    initials: "3O",
    bg: "bg-black",
    text: "text-white",
    action: "Commented on",
    target: "Classic Car in Studio",
    content: "These draggabale sliders look really cool. Maybe these could be displayed when you hold shift, t...",
    time: "1h ago",
    unread: false,
    type: "comment",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    Icon: IconMessage
  }
];

export const NotificationsDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 data-[state=open]:bg-gray-100 cursor-pointer">
          <IconBell className="!w-6 !h-6 font-normal" stroke={1.5} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-700 rounded-full ring-2 ring-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 rounded-2xl shadow-xl border-gray-300 overflow-hidden font-sans">
        <Tabs defaultValue="All" className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            <span className="text-[17px] tracking-tight">Notifications</span>
            <TabsList className="bg-gray-100/80 p-0.5 h-auto rounded-lg">
              <TabsTrigger value="All" className="px-3 py-1 text-[13px] font-medium rounded-md transition-all shadow-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">All</TabsTrigger>
              <TabsTrigger value="Unread" className="px-3 py-1 text-[13px] font-medium rounded-md transition-all shadow-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Unread</TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white">
            <TabsContent value="All" className="mt-0 p-0">
              <NotificationList items={notifications} />
            </TabsContent>
            <TabsContent value="Unread" className="mt-0 p-0">
               <NotificationList items={notifications.filter(n => n.unread)} />
            </TabsContent>
          </div>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NotificationList = ({ items }: { items: typeof notifications }) => {
  if (items.length === 0) {
    return (
       <div className="p-8 text-center text-muted-foreground text-sm">
         No notifications
       </div>
    );
  }

  return (
    <div className="max-h-[500px] overflow-y-auto">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative group items-start">
          {/* Avatar + Icon Overlay */}
          <div className="relative shrink-0">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium", item.bg, item.text)}>
                {item.initials}
            </div>
            <div className={cn("absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-[2px] border-white shadow-sm", item.iconBg)}>
                <item.Icon size={12} className={item.iconColor} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col pt-0.5">
            {/* Header Row: Name + Action + Time */}
            <div className="flex justify-between items-start gap-2">
                <div className="leading-snug text-[13px]">
                <span className="font-semibold text-foreground mr-1">{item.user}</span>
                <span className="text-muted-foreground">
                  {item.type === "generation" ? "" : item.action} &nbsp;
                  {item.target && <span className="font-medium text-foreground">{item.target}</span>}
                </span>
                {item.type === "generation" && <div className="font-medium text-foreground mt-0.5">{item.action}</div>}
                </div>
                
                {/* Time & Unread */}
                <div className="flex flex-col items-end shrink-0 gap-1.5 pl-1">
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.time}</span>
                  {item.unread && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                </div>
            </div>

            {/* Subtext Content */}
            {item.content && (
              <p className="text-[12px] text-gray-500 leading-relaxed mt-1 line-clamp-2 font-normal">
                {item.content}
              </p>
            )}

            {/* Buttons for Invite */}
            {item.type === "invite" && (
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  Decline
                </Button>
                <Button size="sm" className="cursor-pointer">
                  Accept
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
