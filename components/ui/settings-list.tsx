import * as React from "react"
import { cn } from "cn"

import { Label } from "@/components/ui/label"

/**
 * A flat list of settings: one row per setting, separated by hairlines, no
 * cards. Rows lay out by the list's own width (container query), so it works
 * beside a sidebar. For grouped forms (profile, members) use sections with
 * cards instead.
 */
function SettingsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-list"
      className={cn("@container/settings flex flex-col divide-y", className)}
      {...props}
    />
  )
}

/**
 * One setting: title and description on the leading side, the control in a
 * fixed-width column on the trailing side; stacked when narrow. Short controls
 * (buttons, swatches) keep their size; inputs and selects with `w-full` fill
 * the column.
 *
 * Name the control: `htmlFor` makes the title its `<label>`; for a group
 * (radios, swatches, several fields) give the group `aria-labelledby={labelId}`.
 * `descriptionId` goes on the control's `aria-describedby`.
 */
function SettingsRow({
  label,
  description,
  badge,
  htmlFor,
  labelId,
  descriptionId,
  className,
  children,
}: {
  label: React.ReactNode
  description?: React.ReactNode
  /** Status or plan marker beside the title (a `Badge`). */
  badge?: React.ReactNode
  htmlFor?: string
  labelId?: string
  descriptionId?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="settings-row"
      className={cn(
        "grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-3 py-5 first:pt-0 last:pb-0 @2xl/settings:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {htmlFor ? (
            <Label id={labelId} htmlFor={htmlFor} className="font-medium">
              {label}
            </Label>
          ) : (
            <p id={labelId} className="text-sm leading-snug font-medium">
              {label}
            </p>
          )}
          {badge}
        </div>
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {/* justify-items-start: buttons keep their width, w-full controls fill. */}
      <div className="grid min-w-0 content-start justify-items-start gap-2 *:max-w-full">
        {children}
      </div>
    </div>
  )
}

export { SettingsList, SettingsRow }
