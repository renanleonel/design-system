import { cn } from "cn"

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

/** Appears only after 200ms so fast responses never flash a skeleton (`delay={false}` shows it at once). */
function SkeletonGroup({
  label,
  delay = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
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
