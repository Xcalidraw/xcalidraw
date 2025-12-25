import { IconBell, IconMessage, IconBox, IconPlus, IconHeart } from "@tabler/icons-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tabs, TabsContent } from "../../ui/tabs";
import { Notification } from "../header.store";
import { NotificationsHeader } from "./NotificationsHeader";
import { NotificationList } from "./NotificationList";
import { useState } from "react";

// Dummy Data matching screenshot styles
const notifications: Notification[] = [
  {
    id: 1,
    user: "Pixelwave",
    initials: "PI",
    bg: "bg-[#0f5132]",
    text: "text-white",
    action: "Commented on",
    target: "Classic Car in Studio",
    content:
      "These draggabale sliders look really cool. Maybe these could be displayed when you hold shift, t...",
    time: "1h ago",
    unread: true,
    type: "comment",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    Icon: IconMessage,
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
    Icon: IconBox,
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
    Icon: IconPlus,
  },
  {
    id: 4,
    user: "Luna",
    initials: "LU",
    bg: "bg-[#d63384]",
    text: "text-white",
    action: "Liked",
    target: "Classic Car in Studio",
    content: "",
    time: "1h ago",
    unread: false,
    type: "like",
    iconColor: "text-red-500",
    iconBg: "bg-red-100",
    Icon: IconHeart,
  },
  {
    id: 5,
    user: "3D object is generated",
    initials: "3O",
    bg: "bg-black",
    text: "text-white",
    action: "Commented on",
    target: "Classic Car in Studio",
    content:
      "These draggabale sliders look really cool. Maybe these could be displayed when you hold shift, t...",
    time: "1h ago",
    unread: false,
    type: "comment",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    Icon: IconMessage,
  },
];

export const NotificationsDropdown = () => {
  const [activeTab, setActiveTab] = useState("All");

  const filteredNotifications =
    activeTab === "All"
      ? notifications
      : notifications.filter((n) => n.unread);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 data-[state=open]:bg-gray-100 cursor-pointer"
        >
          <IconBell className="w-6! h-6! font-normal" stroke={1.5} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-700 rounded-full ring-2 ring-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 overflow-hidden font-sans"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <NotificationsHeader activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="bg-white">
            <TabsContent value="All" className="mt-0 p-0">
              <NotificationList items={filteredNotifications} />
            </TabsContent>
            <TabsContent value="Unread" className="mt-0 p-0">
              <NotificationList items={filteredNotifications} />
            </TabsContent>
          </div>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
