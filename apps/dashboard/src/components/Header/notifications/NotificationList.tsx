import { Notification } from "../header.store";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
  items: Notification[];
}

export const NotificationList = ({ items }: NotificationListProps) => {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No notifications
      </div>
    );
  }

  return (
    <div className="max-h-[500px] overflow-y-auto scrollbar-hover">
      {items.map((item) => (
        <NotificationItem key={item.id} item={item} />
      ))}
    </div>
  );
};
