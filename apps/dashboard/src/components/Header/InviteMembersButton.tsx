import { User } from "lucide-react";
import { Button } from "../ui/button";

export const InviteMembersButton = () => {
  return (
    <Button
      variant="ghost"
      size="default"
      className="bg-gray-50 hover:bg-gray-100 shadow-none cursor-pointer"
    >
      <User size={16} />
      <span>Invite members</span>
    </Button>
  );
};
