import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 select-none">
      <div className="mb-6 relative w-48 h-48 opacity-90">
        {/* Simple abstract illustration using SVGs */}
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <circle cx="100" cy="100" r="80" className="fill-muted" />
          <path
            d="M60 140H140V150H60V140Z"
            className="fill-muted-foreground/30"
          />
          <rect x="50" y="50" width="100" height="80" rx="8" className="fill-white stroke-muted-foreground/30" strokeWidth="2"/>
          <circle cx="90" cy="90" r="15" className="fill-primary/20"/>
          <rect x="115" y="85" width="20" height="2" rx="1" className="fill-muted-foreground/30"/>
          <rect x="115" y="93" width="15" height="2" rx="1" className="fill-muted-foreground/30"/>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="min-w-[140px]">
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
