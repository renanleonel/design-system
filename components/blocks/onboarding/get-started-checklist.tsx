"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type ChecklistItem = {
  id: string
  title: string
  description: React.ReactNode
  /** The action that completes it ("Create project"). */
  action?: { label: string; href?: string; onClick?: () => void }
  done: boolean
}

/**
 * "Get started" on the dashboard: progress, then the tasks. The next open task
 * is expanded with its action; done tasks collapse to a struck line with a
 * check. Any task can be opened. Hide it with the X; when every task is done
 * it says so and offers to go away.
 */
export function GetStartedChecklist({
  title = "Get started",
  items,
  onDismiss,
  className,
}: {
  title?: React.ReactNode
  items: ChecklistItem[]
  onDismiss?: () => void
  className?: string
}) {
  const nextOpen = items.find((item) => !item.done)?.id
  // Follows the next open task until someone picks one.
  const [picked, setPicked] = React.useState<string | null>(null)
  const expanded = picked ?? nextOpen
  const done = items.filter((item) => item.done).length
  const complete = done === items.length

  return (
    <section
      aria-labelledby="get-started-title"
      className={cn("rounded-xl bg-card shadow-border", className)}
    >
      <header className="flex items-start gap-4 p-5 pb-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="get-started-title" className="font-heading font-semibold">
              {complete ? "You're all set" : title}
            </h2>
            <span className="text-sm text-muted-foreground tabular-nums">
              {done} of {items.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Setup progress"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={done}
            className="flex gap-1"
          >
            {items.map((item) => (
              <span
                key={item.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full bg-muted transition-colors duration-300",
                  item.done && "bg-tone-green"
                )}
              />
            ))}
          </div>
        </div>
        {onDismiss && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Hide checklist"
                  onClick={onDismiss}
                  className="-me-1.5 -mt-1"
                />
              }
            >
              <XIcon />
            </TooltipTrigger>
            <TooltipContent>Hide checklist</TooltipContent>
          </Tooltip>
        )}
      </header>
      <ul className="flex flex-col border-t p-2">
        {items.map((item) => {
          const open = item.id === expanded
          return (
            <li key={item.id} data-done={item.done || undefined} className="group/task">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setPicked(open ? "" : item.id)}
                className="flex w-full items-center gap-3 rounded-lg p-2.5 text-start focus-ring transition-colors hover:bg-muted/60"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 transition-[background-color,border-color] duration-200",
                    "group-data-done/task:border-solid group-data-done/task:border-tone-green group-data-done/task:bg-tone-green group-data-done/task:text-background"
                  )}
                >
                  <CheckIcon className="size-3 scale-50 opacity-0 transition-[opacity,scale] duration-200 ease-out group-data-done/task:scale-100 group-data-done/task:opacity-100" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium group-data-done/task:text-muted-foreground group-data-done/task:line-through group-data-done/task:decoration-muted-foreground/40">
                  {item.title}
                  <span className="sr-only">{item.done ? ", done" : ""}</span>
                </span>
                <ChevronDownIcon
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none",
                    open && "rotate-180"
                  )}
                />
              </button>
              {/* grid 0fr→1fr animates the height without measuring it. */}
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                  open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
                inert={!open}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col items-start gap-3 ps-10 pe-3 pb-3 text-sm text-muted-foreground">
                    <p>{item.description}</p>
                    {item.action && !item.done && (
                      <Button
                        size="sm"
                        onClick={item.action.onClick}
                        {...(item.action.href && {
                          render: <a href={item.action.href} />,
                          nativeButton: false,
                        })}
                      >
                        {item.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
