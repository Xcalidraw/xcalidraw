import clsx from "clsx";
import "./skeleton.scss";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("skeleton", className)}
      {...props}
    />
  )
}

export { Skeleton }
