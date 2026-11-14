import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

/**
 * Customizable select (`appearance: base-select`, Chromium 135+): the open
 * list is drawn like `SelectContent` (popover surface, 36px rows, check at
 * the end). Elsewhere the OS picker shows, following the color scheme.
 */
const picker = [
  "supports-[appearance:base-select]:[appearance:base-select] [&::picker-icon]:hidden",
  "[&::picker(select)]:[appearance:base-select] [&::picker(select)]:my-1.5 [&::picker(select)]:max-h-72 [&::picker(select)]:rounded-lg [&::picker(select)]:border-0 [&::picker(select)]:bg-popover [&::picker(select)]:p-1 [&::picker(select)]:text-popover-foreground [&::picker(select)]:shadow-popover",
  "supports-[appearance:base-select]:[&_option]:flex supports-[appearance:base-select]:[&_option]:min-h-9 supports-[appearance:base-select]:[&_option]:items-center supports-[appearance:base-select]:[&_option]:gap-2 supports-[appearance:base-select]:[&_option]:rounded-sm supports-[appearance:base-select]:[&_option]:px-2 supports-[appearance:base-select]:[&_option]:py-1 supports-[appearance:base-select]:[&_option]:text-sm supports-[appearance:base-select]:[&_option]:outline-none pointer-coarse:supports-[appearance:base-select]:[&_option]:min-h-11",
  "[&_option:is(:hover,:focus-visible)]:bg-accent [&_option:is(:hover,:focus-visible)]:text-accent-foreground [&_option:disabled]:opacity-50 [&_option::checkmark]:order-1 [&_option::checkmark]:ms-auto [&_option::checkmark]:text-muted-foreground",
  "supports-[appearance:base-select]:[&_optgroup]:text-xs supports-[appearance:base-select]:[&_optgroup]:font-medium supports-[appearance:base-select]:[&_optgroup]:text-muted-foreground supports-[appearance:base-select]:[&_optgroup]:not-first:mt-1 supports-[appearance:base-select]:[&_optgroup_option]:font-normal supports-[appearance:base-select]:[&_optgroup_option]:text-popover-foreground supports-[appearance:base-select]:[&_optgroup_option]:text-sm",
]

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}

function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "h-control w-full min-w-0 appearance-none rounded-control border border-input bg-transparent py-1 pr-8 pl-2.5 text-base scheme-light focus-ring transition-colors outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:h-control-sm data-[size=sm]:py-0.5 sm:text-sm dark:bg-input/30 dark:scheme-dark dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          picker
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn(
        "not-supports-[appearance:base-select]:bg-[Canvas] not-supports-[appearance:base-select]:text-[CanvasText]",
        className
      )}
      {...props}
    />
  )
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn(
        "not-supports-[appearance:base-select]:bg-[Canvas] not-supports-[appearance:base-select]:text-[CanvasText]",
        className
      )}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
