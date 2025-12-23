import { User } from "lucide-react";
import { Button } from "../ui/button";
import { IconSearch } from "@tabler/icons-react";

import { UserDropdown } from "./UserDropdown";
import { OrgSwitcher } from "./OrgSwitcher";
import { NotificationsDropdown } from "./NotificationsDropdown";

export const Header = () => {
  return (
    <div className="h-16 px-4 flex items-center justify-center bg-white border-b border-border">
      <div className="w-full flex justify-between items-center">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <span className="font-excalifont text-[26px] font-semibold text-primary select-none whitespace-nowrap tracking-tight md:text-[22px]">
            Xcalidraw
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button variant='ghost' size="default" className="bg-gray-50 hover:bg-gray-100 shadow-none cursor-pointer ">
            <User size={16} />
            <span>Invite members</span>
          </Button>

          <NotificationsDropdown />

          <div className="h-6 w-px bg-border mx-2" /> {/* Divider */}
          
          <OrgSwitcher />
          <UserDropdown />
        </div>
      </div>
    </div>
  );
};
