import { Bell, Search, User } from "lucide-react";
import { Button } from "@shadcn/components/ui/button";

import { UserDropdown } from "./UserDropdown";
import { OrgSwitcher } from "./OrgSwitcher";

export const Header = () => {
  return (
    <div className="h-16 px-8 flex items-center justify-center bg-white border-b border-border md:px-4 md:h-14">
      <div className="w-full flex justify-between items-center">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <span className="font-excalifont text-[26px] font-semibold text-primary select-none whitespace-nowrap tracking-tight md:text-[22px]">
            Xcalidraw
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button variant='secondary' size="default" className="max-[480px]:w-7 max-[480px]:h-7 max-[480px]:p-0 max-[480px]:rounded-full max-[480px]:[&>span]:hidden">
            <User size={16} />
            <span>Invite members</span>
          </Button>

          <Button variant="ghost" size="icon">
            <Search size={20} />
          </Button>

          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>

          <div className="h-6 w-px bg-border mx-2" /> {/* Divider */}
          
          <OrgSwitcher />
          <UserDropdown />
        </div>
      </div>
    </div>
  );
};
