import { cn } from "cn"

/**
 * Label/value pairs ("Region  eu-west-1"): quiet label over a medium value,
 * numbers tabular. `layout="row"` spreads short pairs across one line (wrapping
 * on narrow widths); `layout="stack"` puts label and value on one line each row,
 * value at the trailing edge.
 */
function DataList({
  layout = "row",
  className,
  ...props
}: React.ComponentProps<"dl"> & { layout?: "row" | "stack" }) {
  return (
    <div className="@container">
      <dl
        data-slot="data-list"
        data-layout={layout}
        className={cn(
          "group/data-list",
          // Row: a 2-column grid when narrow, one spread line once the container
          // fits it (container query, so it follows its card, not the viewport).
          layout === "row"
            ? "grid grid-cols-2 gap-x-6 gap-y-3 @xs:flex @xs:justify-between"
            : "flex flex-col gap-2",
          className
        )}
        {...props}
      />
    </div>
  )
}

function DataItem({
  label,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="data-item"
      className={cn(
        "flex min-w-0 flex-col gap-0.5 group-data-[layout=stack]/data-list:flex-row group-data-[layout=stack]/data-list:items-baseline group-data-[layout=stack]/data-list:justify-between group-data-[layout=stack]/data-list:gap-4",
        className
      )}
      {...props}
    >
      <dt className="text-sm text-muted-foreground group-data-[layout=stack]/data-list:max-w-1/2 group-data-[layout=stack]/data-list:shrink-0">
        {label}
      </dt>
      <dd className="min-w-0 text-base font-medium tabular-nums group-data-[layout=stack]/data-list:text-end">
        {children}
      </dd>
    </div>
  )
}

export { DataItem, DataList }
