import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import "./EmptyState.scss";

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
    <div className="empty-state-container">
      <div className="illustration-wrapper">
            {/* Simple abstract illustration using SVGs */}
            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%' }}
            >
                <circle cx="100" cy="100" r="80" fill="var(--color-gray-10)" />
                <path
                    d="M60 140H140V150H60V140Z"
                    fill="var(--color-gray-30)"
                />
                 <rect x="50" y="50" width="100" height="80" rx="8" fill="white" stroke="var(--color-gray-30)" strokeWidth="2"/>
                 <circle cx="90" cy="90" r="15" fill="var(--color-primary-light)" opacity="0.5"/>
                 <rect x="115" y="85" width="20" height="2" rx="1" fill="var(--color-gray-30)"/>
                 <rect x="115" y="93" width="15" height="2" rx="1" fill="var(--color-gray-30)"/>
            </svg>
      </div>
      <h3 className="empty-title">
        {title}
      </h3>
      <p className="empty-description">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="empty-action-btn">
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
