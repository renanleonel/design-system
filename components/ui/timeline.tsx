import * as React from "react"
import { cn } from "cn"

/**
 * A vertical history of events, newest first by convention: audit logs,
 * order status, deploys. Each item gets a marker (a dot, or an icon) joined
 * to the next by a rule. Past ~50 events, show the latest and a "Show more",
 * or render items in a `VirtualList`.
 */
function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="timeline"
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

const MARKER_TONE = {
  gray: "text-tone-gray",
  blue: "text-tone-blue",
  green: "text-tone-green",
  amber: "text-tone-amber",
  orange: "text-tone-orange",
  red: "text-tone-red",
  purple: "text-tone-purple",
} as const

function TimelineItem({
  icon,
  tone = "gray",
  className,
  children,
  ...props
}: React.ComponentProps<"li"> & {
  /** Shown in a 24px tile; omit for a dot. */
  icon?: React.ReactNode
  tone?: keyof typeof MARKER_TONE
}) {
  return (
    <li
      data-slot="timeline-item"
      className={cn(
        "group/timeline-item relative grid grid-cols-[--spacing(6)_1fr] gap-x-3 pb-6 last:pb-0",
        className
      )}
      {...props}
    >
      {/* The rule to the next item; the last item has none. */}
      <span
        aria-hidden
        className="absolute start-3 top-7 bottom-1 w-px -translate-x-1/2 bg-border group-last/timeline-item:hidden rtl:translate-x-1/2"
      />
      <span
        aria-hidden
        className={cn(
          "flex size-6 items-center justify-center rounded-full [&_svg]:size-3.5",
          MARKER_TONE[tone],
          // Icon: the tone on a 12% tint of itself, like Badge tone. Dot: solid.
          icon
            ? "bg-current/12"
            : "after:size-2 after:rounded-full after:bg-current"
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">{children}</div>
    </li>
  )
}

function TimelineHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-header"
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5",
        className
      )}
      {...props}
    />
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

/** Pass `dateTime` (ISO) so the moment is machine-readable. */
function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time
      data-slot="timeline-time"
      className={cn(
        "shrink-0 text-xs text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

function TimelineDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineItem,
  TimelineHeader,
  TimelineTitle,
  TimelineTime,
  TimelineDescription,
}
