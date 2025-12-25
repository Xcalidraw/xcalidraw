import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { Notification } from "../header.store";

interface NotificationItemProps {
  item: Notification;
}

export const NotificationItem = ({ item }: NotificationItemProps) => {
  return (
    <div className="flex gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative group items-start">
      {/* Avatar + Icon Overlay */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
            item.bg,
            item.text
          )}
        >
          {item.initials}
        </div>
        <div
          className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm",
            item.iconBg
          )}
        >
          <item.Icon size={12} className={item.iconColor} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col pt-0.5">
        {/* Header Row: Name + Action + Time */}
        <div className="flex justify-between items-start gap-2">
          <div className="leading-snug text-[13px]">
            <span className="font-semibold text-foreground mr-1">
              {item.user}
            </span>
            <span className="text-muted-foreground">
              {item.type === "generation" ? "" : item.action} &nbsp;
              {item.target && (
                <span className="font-medium text-foreground">{item.target}</span>
              )}
            </span>
            {item.type === "generation" && (
              <div className="font-medium text-foreground mt-0.5">
                {item.action}
              </div>
            )}
          </div>

          {/* Time & Unread */}
          <div className="flex flex-col items-end shrink-0 gap-1.5 pl-1">
            <span className="text-[10px] text-gray-400 whitespace-nowrap">
              {item.time}
            </span>
            {item.unread && (
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            )}
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
  );
};
