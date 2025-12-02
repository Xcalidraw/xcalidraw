import * as React from "react";
import clsx from "clsx";

import "./dialog.scss";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

import { createPortal } from "react-dom";

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="xcalidraw">
      <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("dialog-content-wrapper", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={clsx("dialog-header", className)}>{children}</div>;
};

const DialogTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <h2 className={clsx("dialog-title", className)}>{children}</h2>;
};

const DialogDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <p className={clsx("dialog-description", className)}>{children}</p>;
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
