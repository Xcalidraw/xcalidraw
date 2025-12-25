import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

export const NavItem = ({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
}: NavItemProps) => {
  return (
    <button
      type="button"
      className={cn(
        "relative flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <Icon
          className={active ? "text-primary" : "text-muted-foreground"}
          size={18}
          strokeWidth={active ? 2 : 1.5}
        />
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
            active
              ? "bg-primary text-white"
              : "bg-muted-foreground/10 text-muted-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
