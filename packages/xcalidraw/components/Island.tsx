import React from "react";
import clsx from "clsx";

import "./Island.scss";

type IslandProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  padding?: number;
  className?: string | boolean;
  style?: object;
};

export const Island = React.forwardRef<HTMLDivElement, IslandProps>(
  ({ children, padding, className, style, ...rest }, ref) => (
    <div
      className={clsx("Island", className)}
      style={{ "--padding": padding, ...style }}
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  ),
);
