"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

type StepStatus = "complete" | "current" | "upcoming" | "error"

type StepperStep = {
  /** Stable key for the step; defaults to its title (when text) plus a counter for repeats. */
  id?: string
  title: React.ReactNode
  description?: React.ReactNode
  /** Marks the step as failed, whatever the current position. */
  error?: boolean
  /** Not clickable even when the stepper is. */
  disabled?: boolean
}

/** One key per step: its `id`, else its text title, with a counter for repeats. */
function stepKeys(steps: StepperStep[]) {
  const seen = new Map<string, number>()
  return steps.map((step) => {
    const base = step.id ?? (typeof step.title === "string" ? step.title : "step")
    const n = seen.get(base) ?? 0
    seen.set(base, n + 1)
    return `${base}:${n}`
  })
}

const STATUS_LABEL: Record<StepStatus, string> = {
  complete: "completed",
  current: "current step",
  upcoming: "upcoming",
  error: "has an error",
}

function statusOf(step: StepperStep, index: number, value: number): StepStatus {
  if (step.error) return "error"
  if (index < value) return "complete"
  if (index === value) return "current"
  return "upcoming"
}

function StepMarker({ status, index }: { status: StepStatus; index: number }) {
  return (
    <span
      aria-hidden
      data-slot="stepper-marker"
      className={cn(
        "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors duration-(--ds-duration-popover) [&_svg]:size-3.5",
        status === "complete" &&
          "border-primary bg-primary text-primary-foreground",
        status === "current" && "border-primary bg-background text-primary",
        status === "upcoming" &&
          "border-border bg-background text-muted-foreground",
        status === "error" && "border-transparent bg-tone-red/12 text-tone-red"
      )}
    >
      {status === "complete" ? (
        <CheckIcon />
      ) : status === "error" ? (
        <XIcon />
      ) : (
        index + 1
      )}
    </span>
  )
}

/**
 * Progress through a multi-step flow: checkout, onboarding, a wizard. `value`
 * is the zero-based current step (or `steps.length` when everything is done);
 * earlier steps are complete, later ones upcoming, and a step with `error`
 * shows as failed. Controlled (`value` + `onValueChange`) or uncontrolled
 * (`defaultValue`). With `clickable`, steps are buttons that call
 * `onValueChange`.
 *
 * `orientation="horizontal"` lays the steps in a row once the stepper itself
 * is wide enough (a container query, 32rem) and stacks them below that, so it
 * never needs a media query or overflows a phone.
 */
function Stepper({
  steps,
  value,
  defaultValue = 0,
  onValueChange,
  orientation = "horizontal",
  clickable = false,
  className,
  ...props
}: Omit<React.ComponentProps<"ol">, "children" | "defaultValue"> & {
  steps: StepperStep[]
  /** Zero-based index of the current step. */
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  orientation?: "horizontal" | "vertical"
  /** Steps become buttons that jump to that step. */
  clickable?: boolean
}) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const horizontal = orientation === "horizontal"
  const keys = stepKeys(steps)

  return (
    <div data-slot="stepper-root" className="@container w-full min-w-0">
      <ol
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "flex flex-col",
          horizontal && "@lg:flex-row @lg:gap-2",
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const status = statusOf(step, index, current)
          const last = index === steps.length - 1
          const interactive = clickable && !step.disabled
          const Tag = interactive ? "button" : "div"
          return (
            <li
              key={keys[index]}
              data-slot="stepper-item"
              data-status={status}
              aria-current={status === "current" ? "step" : undefined}
              className={cn(
                "relative min-w-0",
                !last && "pb-6",
                horizontal && "@lg:flex-1 @lg:pb-0"
              )}
            >
              {/* The rule to the next step: down in a stack, across in a row. */}
              {!last && (
                <span
                  aria-hidden
                  data-slot="stepper-connector"
                  className={cn(
                    "absolute start-3 top-8 bottom-1 w-px -translate-x-1/2 transition-colors duration-(--ds-duration-popover) rtl:translate-x-1/2",
                    status === "complete" ? "bg-primary" : "bg-border",
                    horizontal &&
                      "@lg:start-9 @lg:end-2 @lg:top-3 @lg:bottom-auto @lg:h-px @lg:w-auto @lg:translate-x-0 @lg:rtl:translate-x-0"
                  )}
                />
              )}
              <Tag
                {...(interactive
                  ? {
                      type: "button" as const,
                      onClick: () => setCurrent(index),
                    }
                  : {})}
                data-slot="stepper-step"
                className={cn(
                  "flex w-full min-w-0 items-start gap-3 text-start",
                  horizontal && "@lg:flex-col @lg:gap-2",
                  interactive &&
                    "group/step -m-1 w-[calc(100%+--spacing(2))] rounded-control p-1 focus-ring outline-none"
                )}
              >
                <StepMarker status={status} index={index} />
                <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                  <span
                    className={cn(
                      "text-sm leading-5 font-medium wrap-anywhere",
                      status === "upcoming" && "text-muted-foreground",
                      status === "error" && "text-tone-red",
                      interactive && "group-hover/step:underline"
                    )}
                  >
                    {step.title}
                    <span className="sr-only">, {STATUS_LABEL[status]}</span>
                  </span>
                  {step.description && (
                    <span className="text-sm text-muted-foreground wrap-anywhere">
                      {step.description}
                    </span>
                  )}
                </span>
              </Tag>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export { Stepper }
export type { StepperStep, StepStatus }
