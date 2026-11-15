"use client"

import * as React from "react"
import { PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useControllableState } from "@/hooks/use-controllable-state"

function InlineEdit({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  validate,
  label,
  placeholder = "Add a value",
  disabled = false,
  className,
  inputClassName,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Persists the new value. Throw (or reject) to roll back. */
  onSubmit?: (value: string) => void | Promise<unknown>
  validate?: (value: string) => string | null | undefined | void
  label: string
  placeholder?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
}) {
  const [saved, setSaved] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(saved)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState("")
  const errorId = React.useId()
  // Set when Enter or Escape closes the field so focus returns to the text;
  // a blur leaves focus where the user sent it.
  const refocus = React.useRef(false)
  // Escape or a finished save: the unmounting input's blur must not save again.
  const closing = React.useRef(false)

  const shown = pending ?? saved
  const busy = pending !== null

  const open = () => {
    if (disabled || busy) return
    closing.current = false
    setDraft(saved)
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    closing.current = true
    refocus.current = true
    setError(null)
    setEditing(false)
  }

  const save = async (next: string, fromBlur: boolean) => {
    if (closing.current) return
    if (next === saved) {
      closing.current = true
      refocus.current = !fromBlur
      setEditing(false)
      setError(null)
      return
    }
    const invalid = validate?.(next)
    if (invalid) {
      setError(invalid)
      setStatus(`${label} not saved: ${invalid}`)
      return
    }
    closing.current = true
    refocus.current = !fromBlur
    setEditing(false)
    setError(null)
    setPending(next)
    setStatus(`Saving ${label}…`)
    try {
      await onSubmit?.(next)
      setSaved(next)
      setStatus(`Saved ${label}.`)
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Couldn't save the change."
      setError(message)
      setStatus(`${label} not saved. ${message}`)
      toast.error(`Couldn't save ${label}`, {
        description: message,
        action: {
          label: "Retry",
          onClick: () => {
            closing.current = false
            void save(next, true)
          },
        },
      })
    } finally {
      setPending(null)
    }
  }

  return (
    <div data-slot="inline-edit" className={cn("relative min-w-0", className)}>
      {editing ? (
        <InlineEditField
          label={label}
          error={error}
          errorId={errorId}
          draft={draft}
          inputClassName={inputClassName}
          onDraftChange={(next) => {
            setDraft(next)
            if (error) setError(null)
          }}
          onCommit={(fromBlur) => void save(draft, fromBlur)}
          onCancel={cancel}
        />
      ) : (
        <InlineEditTrigger
          label={label}
          placeholder={placeholder}
          shown={shown}
          busy={busy}
          disabled={disabled}
          invalid={!!error}
          describedBy={error ? errorId : undefined}
          inputClassName={inputClassName}
          refocusRef={refocus}
          onOpen={open}
        />
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-sm wrap-anywhere text-destructive"
        >
          {error}
        </p>
      )}
      <span role="status" className="sr-only">
        {status}
      </span>
    </div>
  )
}

function InlineEditField({
  label,
  error,
  errorId,
  draft,
  inputClassName,
  onDraftChange,
  onCommit,
  onCancel,
}: {
  label: string
  error: string | null
  errorId: string
  draft: string
  inputClassName?: string
  onDraftChange: (value: string) => void
  onCommit: (fromBlur: boolean) => void
  onCancel: () => void
}) {
  return (
    <Input
      autoFocus
      aria-label={label}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      value={draft}
      onFocus={(e) => e.target.select()}
      onChange={(e) => onDraftChange(e.target.value)}
      onBlur={() => onCommit(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          onCommit(false)
        } else if (e.key === "Escape") {
          // Keep Escape from closing a surrounding dialog or sheet.
          e.preventDefault()
          e.stopPropagation()
          onCancel()
        }
      }}
      className={cn("-mx-px", inputClassName)}
    />
  )
}

function InlineEditTrigger({
  label,
  placeholder,
  shown,
  busy,
  disabled,
  invalid,
  describedBy,
  inputClassName,
  refocusRef,
  onOpen,
}: {
  label: string
  placeholder: string
  shown: string
  busy: boolean
  disabled: boolean
  invalid: boolean
  describedBy?: string
  inputClassName?: string
  refocusRef: React.RefObject<boolean>
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      ref={(el) => {
        if (el && refocusRef.current) {
          refocusRef.current = false
          el.focus()
        }
      }}
      onClick={onOpen}
      aria-disabled={disabled || busy || undefined}
      aria-busy={busy || undefined}
      data-invalid={invalid ? "" : undefined}
      aria-describedby={describedBy}
      title={shown || undefined}
      data-slot="inline-edit-trigger"
      className={cn(
        "group/inline-edit hit-area flex h-control w-full min-w-0 items-center gap-2 rounded-control border border-transparent px-2.5 text-start text-base focus-ring outline-none pointer-fine:text-sm",
        "hover:bg-muted aria-disabled:cursor-default aria-disabled:hover:bg-transparent data-invalid:border-destructive",
        disabled && "opacity-50",
        inputClassName
      )}
    >
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          !shown && "text-muted-foreground",
          busy && "opacity-70"
        )}
      >
        <span className="sr-only">Edit {label}: </span>
        {shown || placeholder}
      </span>
      {busy ? (
        <Spinner className="size-3.5 shrink-0 text-muted-foreground" />
      ) : (
        !disabled && (
          <PencilIcon
            aria-hidden
            className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-(--ds-duration-press) group-hover/inline-edit:opacity-100 group-focus-visible/inline-edit:opacity-100 pointer-coarse:opacity-100"
          />
        )
      )}
    </button>
  )
}

export { InlineEdit }
