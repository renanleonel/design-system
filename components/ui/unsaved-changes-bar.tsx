"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

/**
 * A floating bar for pages that save as a whole (settings): it rises in once
 * something changed, with Discard and Save (Mod+S) beside the edits instead of
 * at the top of the page. Place it last inside the `<form>`: Save submits it.
 * While open, leaving the page asks first.
 */
function UnsavedChangesBar({
  open,
  onDiscard,
  saving = false,
  message = "You have unsaved changes",
  saveLabel = "Save changes",
  className,
}: {
  /** Usually `form.formState.isDirty`. */
  open: boolean
  onDiscard: () => void
  /** Busy state on Save (`form.formState.isSubmitting`). */
  saving?: boolean
  message?: React.ReactNode
  saveLabel?: React.ReactNode
  className?: string
}) {
  // Subscription only: warn before closing the tab with edits pending.
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
        className="pointer-events-auto flex max-w-full translate-y-2 flex-wrap items-center gap-2 rounded-xl bg-popover p-1.5 ps-3 text-sm opacity-0 shadow-popover transition-[opacity,translate] duration-150 ease-in motion-reduce:translate-y-0 data-open:translate-y-0 data-open:opacity-100 data-open:duration-200 data-open:ease-out"
      >
        <p role="status" className="me-2 font-medium">
          {open ? message : null}
        </p>
        <div className="ms-auto flex items-center gap-1.5">
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
