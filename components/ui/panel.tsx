import { cn } from "cn"

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

function PanelCard({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & {
  interactive?: boolean
}) {
  return (
    <div
      data-slot="panel-card"
      className={cn(
        "relative flex min-w-0 flex-col gap-4 rounded-[calc(var(--ds-panel-radius)-var(--ds-panel-pad))] bg-card p-(--ds-card-pad) text-card-foreground shadow-border",
        interactive &&
          "transition-shadow duration-(--ds-duration-press) ease-out hover:shadow-border-hover",
        className
      )}
      {...props}
    />
  )
}

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
