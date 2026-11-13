"use client"

import * as React from "react"
import { cn } from "cn"
import { format, type Locale as DateFnsLocale } from "date-fns"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type DropdownProps,
} from "react-day-picker"

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(8)] pointer-coarse:[--cell-size:min(--spacing(10),calc((100vw-3rem)/7))] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      labels={{
        labelDayButton: (date, modifiers) =>
          `${format(date, "d")}, ${format(date, "EEEE, MMMM yyyy", { locale: locale as DateFnsLocale | undefined })}${modifiers.today ? ", today" : ""}${modifiers.selected ? ", selected" : ""}`,
        ...props.labels,
      }}
      formatters={{
        formatMonthDropdown: (date) =>
          // date-fns, not toLocaleString: the server's and the browser's
          // default locales differ, which breaks hydration.
          format(date, "LLL", { locale: locale as DateFnsLocale | undefined }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          // Spans the caption to place the arrows at its ends; clicks pass
          // through to the month/year pickers underneath.
          "pointer-events-none absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 *:pointer-events-auto",
          defaultClassNames.nav
        ),
        button_previous: cn(
          // size: null drops the default h-control, so --cell-size alone sizes it.
          buttonVariants({ variant: buttonVariant, size: null }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: null }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        caption_label: cn(
          "text-sm font-medium select-none",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        // Month and year pickers are our Select, not the browser's <select>.
        Dropdown: CalendarDropdown,
        DayButton: ({ ...props }) => (
          <CalendarDayButton {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

/**
 * The caption's month/year picker. DayPicker expects a `<select>` change
 * event; Select reports a value, so it's handed over in that shape.
 */
function CalendarDropdown({
  options = [],
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const items = options.map((o) => ({ value: o.value, label: o.label }))
  return (
    <Select
      items={items}
      value={Number(value)}
      onValueChange={(next) =>
        onChange?.({
          target: { value: String(next) },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
      disabled={disabled}
      // Inside a calendar popup: our list, not the platform picker.
      native={false}
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className="h-7 gap-1 border-transparent px-1.5 pe-1 font-medium shadow-none hover:bg-muted dark:bg-transparent dark:hover:bg-muted"
      >
        <SelectValue />
      </SelectTrigger>
      {/* Compact trigger padding would offset a popup aligned to the value: open below. */}
      <SelectContent alignItemWithTrigger={false} className="max-h-72">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <Button
      // size="icon" grows to 44px on touch; cells keep --cell-size instead
      // (size-auto!), and hit-area still gives each day a 44px target.
      // Keyboard navigation moves DayPicker's focused day; follow it in the DOM.
      ref={(el) => {
        if (modifiers.focused) el?.focus()
      }}
      variant="ghost"
      size="icon"
      data-day={format(day.date, "yyyy-MM-dd")}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto! w-full! min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal tabular-nums data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span:not([data-slot=label])]:text-xs [&>span:not([data-slot=label])]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
