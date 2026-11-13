import { cn } from "cn"

/**
 * The compact first-run card for a list page ("Add your products"): what goes
 * here, one primary and one secondary action, and up to four media tiles
 * showing the kind of thing that will fill it. The tiles drop below the text
 * on narrow containers (container query, so it follows its column).
 */
export function EmptyStateCard({
  title,
  description,
  actions,
  tiles = [],
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** Up to four decorative tiles (images or icons). */
  tiles?: React.ReactNode[]
  className?: string
}) {
  return (
    <section
      data-slot="empty-state-card"
      className={cn("@container rounded-xl bg-card shadow-border", className)}
    >
      <div className="flex flex-col gap-8 p-6 @2xl:flex-row @2xl:items-center @2xl:p-10">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {actions && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
        {tiles.length > 0 && (
          <div
            aria-hidden
            className="grid w-full max-w-xs grid-cols-2 gap-2 @2xl:w-64"
          >
            {tiles.slice(0, 4).map((tile, i) => (
              <div
                key={i}
                className={cn(
                  "flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-muted/70 transition-[opacity,translate] duration-500 ease-out starting:translate-y-1.5 starting:opacity-0 motion-reduce:transition-none [&_svg]:size-7 [&_svg]:text-muted-foreground",
                  i === 1 && "delay-75",
                  i === 2 && "delay-150",
                  i === 3 && "delay-200"
                )}
              >
                {tile}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
