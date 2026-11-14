"use client"

import * as React from "react"
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { cn } from "cn"
import { MinusIcon, MoveHorizontalIcon, PlusIcon } from "lucide-react"

const stepperClasses =
  "hit-area inline-flex h-full w-9 shrink-0 motion-press items-center justify-center text-muted-foreground outline-none select-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ds-focus-ring) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4"

type NumberFieldProps = NumberFieldPrimitive.Root.Props & {
  /** Visible label. Omit it and pass `aria-label` on the input instead. */
  label?: React.ReactNode
  /** Drag the label sideways to change the value (mouse and pen; arrows still work). */
  scrub?: boolean
  /** Hides the − and + buttons for a plain numeric field. */
  hideSteppers?: boolean
  /** Names the input when there's no `label`. */
  "aria-label"?: string
  placeholder?: string
}

/**
 * Numeric input with stepper buttons. `format` takes `Intl.NumberFormat`
 * options (currency, percent, units); the value stays a plain number.
 * Min/max clamp on blur, arrows step by `step`, Shift by `largeStep`, Alt by
 * `smallStep`.
 */
function NumberField({
  className,
  label,
  scrub = false,
  hideSteppers = false,
  placeholder,
  id,
  "aria-label": ariaLabel,
  ...props
}: NumberFieldProps) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  return (
    <NumberFieldPrimitive.Root
      id={inputId}
      data-slot="number-field"
      className={cn("flex w-full min-w-0 flex-col gap-1.5", className)}
      {...props}
    >
      {label != null &&
        (scrub ? (
          <NumberFieldScrubLabel htmlFor={inputId}>{label}</NumberFieldScrubLabel>
        ) : (
          <label
            htmlFor={inputId}
            data-slot="number-field-label"
            className="min-w-0 truncate text-sm font-medium"
          >
            {label}
          </label>
        ))}
      <NumberFieldGroup>
        {!hideSteppers && <NumberFieldDecrement />}
        <NumberFieldInput aria-label={ariaLabel} placeholder={placeholder} />
        {!hideSteppers && <NumberFieldIncrement />}
      </NumberFieldGroup>
    </NumberFieldPrimitive.Root>
  )
}

function NumberFieldGroup({
  className,
  ...props
}: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(
        "group/number-field flex h-control w-full min-w-0 items-stretch overflow-hidden rounded-control border border-input transition-colors has-[[data-slot=number-field-input]:focus-visible]:outline-2 has-[[data-slot=number-field-input]:focus-visible]:outline-offset-2 has-[[data-slot=number-field-input]:focus-visible]:outline-(--ds-focus-ring) has-[[data-slot=number-field-input]:disabled]:bg-input/50 has-[[data-slot=number-field-input]:disabled]:opacity-50 has-[[data-slot=number-field-input][aria-invalid=true]]:border-destructive has-[[data-slot=number-field-input][aria-invalid=true]]:ring-3 has-[[data-slot=number-field-input][aria-invalid=true]]:ring-destructive/20 dark:bg-input/30 dark:has-[[data-slot=number-field-input][aria-invalid=true]]:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function NumberFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-2.5 text-center text-base outline-none tabular-nums placeholder:text-muted-foreground disabled:cursor-not-allowed pointer-fine:text-sm",
        className
      )}
      {...props}
    />
  )
}

function NumberFieldDecrement({
  className,
  children,
  ...props
}: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      aria-label="Decrease"
      className={cn(stepperClasses, "border-e border-input", className)}
      {...props}
    >
      {children ?? <MinusIcon />}
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({
  className,
  children,
  ...props
}: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      aria-label="Increase"
      className={cn(stepperClasses, "border-s border-input", className)}
      {...props}
    >
      {children ?? <PlusIcon />}
    </NumberFieldPrimitive.Increment>
  )
}

/** A label that doubles as a drag handle: slide left or right to change the value. */
function NumberFieldScrubLabel({
  className,
  children,
  htmlFor,
  ...props
}: NumberFieldPrimitive.ScrubArea.Props & { htmlFor?: string }) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn("w-fit max-w-full cursor-ew-resize", className)}
      {...props}
    >
      <label
        htmlFor={htmlFor}
        data-slot="number-field-label"
        className="block min-w-0 cursor-ew-resize truncate text-sm font-medium"
      >
        {children}
      </label>
      <NumberFieldPrimitive.ScrubAreaCursor
        data-slot="number-field-scrub-cursor"
        className="drop-shadow-sm"
      >
        <MoveHorizontalIcon aria-hidden className="size-5 text-foreground" />
      </NumberFieldPrimitive.ScrubAreaCursor>
    </NumberFieldPrimitive.ScrubArea>
  )
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldScrubLabel,
}
