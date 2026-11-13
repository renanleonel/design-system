"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

import { Hotkey } from "@/components/ui/hotkey"
import { Spinner } from "@/components/ui/spinner"
import {
  mergeRefs,
  toAriaKeyShortcuts,
  useHotkeyPress,
} from "@/hooks/use-hotkey-press"

const buttonVariants = cva(
  "group/button hit-area inline-flex shrink-0 motion-press items-center justify-center rounded-control border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap focus-ring outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>svg]:transition-[width,opacity,margin-inline-end] [&>svg]:duration-200 [&>svg]:ease-out aria-busy:[&>svg]:-me-(--btn-gap) aria-busy:[&>svg]:w-0! aria-busy:[&>svg]:opacity-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive [--ds-focus-ring:var(--destructive)] hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
        // White surface with the ring shadow: secondary actions on a tray.
        surface:
          "bg-card text-foreground shadow-border hover:shadow-border-hover aria-expanded:shadow-border-hover",
      },
      size: {
        default:
          "h-control gap-(--btn-gap) px-2.5 [--btn-gap:--spacing(1.5)] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-control-xs gap-(--btn-gap) rounded-control px-2 text-xs [--btn-gap:--spacing(1)] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_[data-slot=spinner]]:size-3 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-control-sm gap-(--btn-gap) rounded-control px-2.5 text-[0.8rem] [--btn-gap:--spacing(1)] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_[data-slot=spinner]]:size-3.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-control-lg gap-(--btn-gap) px-2.5 [--btn-gap:--spacing(1.5)] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-control",
        "icon-xs":
          "size-control-xs rounded-control in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-control-sm rounded-control in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-control-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  hotkey,
  showHotkey = false,
  ref,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Busy state: keeps the label, slides a spinner in, blocks clicks, keeps focus. */
    loading?: boolean
    /** Presses the button from anywhere, e.g. `"Mod+S"`. Off while disabled or loading. */
    hotkey?: RegisterableHotkey
    /** Shows the hotkey as key caps at the end of the label. */
    showHotkey?: boolean
  }) {
  const innerRef = React.useRef<HTMLButtonElement>(null)
  useHotkeyPress(innerRef, hotkey, { enabled: !disabled && !loading })

  // The spinner mounts as soon as loading starts (state adjusted during render, no
  // effect) and unmounts when the collapse transition ends, so it keeps spinning
  // while it fades out instead of freezing.
  const [spinning, setSpinning] = React.useState(loading)
  if (loading && !spinning) setSpinning(true)

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      ref={mergeRefs(ref, innerRef)}
      aria-keyshortcuts={toAriaKeyShortcuts(hotkey)}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      focusableWhenDisabled={loading || undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {/* Always mounted: width animates 0fr -> 1fr, and the negative margin cancels
          the flex gap while collapsed, so idle buttons keep their exact width. */}
      <span
        data-slot="button-spinner"
        aria-hidden
        onTransitionEnd={(event) => {
          if (!loading && event.propertyName === "grid-template-columns") {
            setSpinning(false)
          }
        }}
        className="-me-(--btn-gap) grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity,margin-inline-end] duration-200 ease-out group-aria-busy/button:me-0 group-aria-busy/button:grid-cols-[1fr] group-aria-busy/button:opacity-100"
      >
        <span className="flex min-w-0 overflow-hidden">
          {spinning && <Spinner role={undefined} aria-label={undefined} />}
        </span>
      </span>
      {children}
      {hotkey && showHotkey && (
        <Hotkey
          hotkey={hotkey}
          className="-me-1 in-data-[variant=default]:*:bg-primary-foreground/15 in-data-[variant=default]:*:text-primary-foreground"
        />
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
