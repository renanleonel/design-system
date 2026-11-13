import { cn } from "cn"

/** A placeholder block. Shape it like the content it stands in for. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-muted motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * Wraps the skeletons of one loading region. Names what is loading for screen
 * readers, and appears only after 200ms, so fast responses never flash a
 * skeleton (`delay={false}` shows it at once).
 */
function SkeletonGroup({
  label,
  delay = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** e.g. "Loading your projects" */
  label: string
  delay?: boolean
}) {
  return (
    <div
      data-slot="skeleton-group"
      role="status"
      aria-busy
      className={cn(delay && "appear-delayed", className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export { Skeleton, SkeletonGroup }
