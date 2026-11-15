"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

/** Place it last inside the `<form>`: Save submits it. */
function UnsavedChangesBar({
  open,
  onDiscard,
  saving = false,
  message = "Unsaved changes",
  saveLabel = "Save changes",
  className,
}: {
  open: boolean
  onDiscard: () => void
  saving?: boolean
  message?: React.ReactNode
  saveLabel?: React.ReactNode
  className?: string
}) {
  React.useEffect(() => {
    if (!open) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [open])

  return (
    <div
      data-slot="unsaved-changes-bar"
      className={cn(
        "pointer-events-none sticky bottom-4 z-30 flex justify-center",
        className
      )}
    >
      <div
        role="region"
        aria-label="Unsaved changes"
        data-open={open || undefined}
        inert={!open}
        className="pointer-events-auto flex max-w-full translate-y-2 items-center gap-3 rounded-xl bg-popover p-1.5 ps-3.5 text-sm opacity-0 shadow-popover transition-[opacity,translate] duration-(--ds-duration-press) ease-in motion-reduce:translate-y-0 data-open:translate-y-0 data-open:opacity-100 data-open:duration-(--ds-duration-popover) data-open:ease-out"
      >
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full bg-tone-amber"
        />
        <p
          role="status"
          className="-ms-1.5 min-w-0 flex-1 truncate font-medium"
        >
          {open ? message : null}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            type="submit"
            size="sm"
            loading={saving}
            hotkey={open ? "Mod+S" : undefined}
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { UnsavedChangesBar }
