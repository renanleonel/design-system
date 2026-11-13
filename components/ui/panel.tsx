import { cn } from "cn"

/**
 * Nested surfaces: a tinted tray that holds white cards (surfaces.md).
 *
 * - Radii are concentric: a card's radius is the tray's minus the tray padding,
 *   computed from `--ds-panel-radius` / `--ds-panel-pad`, so changing either
 *   keeps every corner parallel.
 * - The header text sits on the same edge as the cards' content
 *   (tray padding + card padding), so the column reads as one straight line.
 * - Controls inside default to pill shape (`--ds-radius-control: 9999px`).
 *
 *   <Panel>
 *     <PanelHeader icon={<BriefcaseIcon />} title="Releases" actions={<Tabs …/>} />
 *     <PanelContent className="md:grid-cols-[1.1fr_1fr]">
 *       <PanelCard>…</PanelCard>
 *     </PanelContent>
 *   </Panel>
 */
function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="panel"
      className={cn(
        "flex flex-col gap-(--ds-panel-pad) rounded-(--ds-panel-radius) bg-panel p-(--ds-panel-pad) text-sm text-foreground shadow-border [--ds-card-pad:--spacing(4)] [--ds-control-h-lg:2.75rem] [--ds-radius-control:9999px]",
        className
      )}
      {...props}
    />
  )
}

function PanelHeader({
  icon,
  title,
  description,
  actions,
  className,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <header
      data-slot="panel-header"
      className={cn(
        "flex min-h-control-lg items-center gap-3 py-2 ps-(--ds-card-pad) pe-1",
        className
      )}
      {...props}
    >
      {icon && (
        <span
          aria-hidden
          className="text-muted-foreground [&_svg]:size-5 [&_svg]:shrink-0"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-heading text-lg leading-tight font-medium tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  )
}

/** Grid of cards. Pass the column template per breakpoint; one column on mobile. */
function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-content"
      className={cn(
        "grid grid-cols-[minmax(0,1fr)] gap-(--ds-panel-pad)",
        className
      )}
      {...props}
    />
  )
}

/** A white card inside the tray, radius concentric with it. */
function PanelCard({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** Clickable cards lift on hover (static cards never do). */
  interactive?: boolean
}) {
  return (
    <div
      data-slot="panel-card"
      className={cn(
        "relative flex min-w-0 flex-col gap-4 rounded-[calc(var(--ds-panel-radius)-var(--ds-panel-pad))] bg-card p-(--ds-card-pad) text-card-foreground shadow-border",
        interactive &&
          "transition-shadow duration-150 ease-out hover:shadow-border-hover",
        className
      )}
      {...props}
    />
  )
}

/** Bottom row of actions on the tray: one primary, then round secondaries. */
function PanelActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-actions"
      className={cn("flex items-center gap-(--ds-panel-pad)", className)}
      {...props}
    />
  )
}

export { Panel, PanelActions, PanelCard, PanelContent, PanelHeader }
