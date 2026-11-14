"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"
import { CheckIcon, CopyIcon, UploadIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { mergeRefs } from "@/hooks/use-hotkey-press"

const inputClasses =
  "h-control w-full min-w-0 rounded-control border border-input bg-transparent px-2.5 py-1 text-base focus-ring transition-colors outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 pointer-fine:text-sm"

type InputProps = React.ComponentProps<"input"> & {
  /**
   * Shows an X that empties the field and returns focus to it. When set,
   * `className` styles the wrapper (width, margins), not the `<input>`.
   */
  clearable?: boolean
  /** Fires after the X empties the field, on top of `onChange`. */
  onClear?: () => void
  /**
   * Adds a copy button for the value (share links, API keys, ids). Read-only
   * copyable fields also select their text on focus.
   */
  copyable?: boolean
}

/** Sets the value the way typing does, so `onChange` and form libraries see it. */
function clearNative(input: HTMLInputElement) {
  if (input.type === "file") {
    input.value = ""
    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))
    return
  }
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set
  setter?.call(input, "")
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

function ClearButton({
  onClear,
  label,
}: {
  onClear: () => void
  label: string
}) {
  return (
    // A sibling of the input, not inside a <label>: activating it must not
    // open the file picker or move focus away first.
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClear}
      className="absolute end-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
    >
      <XIcon />
    </Button>
  )
}

function CopyButton({
  getValue,
  offset,
}: {
  getValue: () => string
  /** Sits left of a clear button. */
  offset?: boolean
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={copied ? "Copied" : "Copy"}
        onMouseDown={(e) => e.preventDefault()}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(getValue())
          } catch {
            return
          }
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), 1500)
        }}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          offset ? "end-8" : "end-1.5"
        )}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}

/**
 * Single-line text field. `clearable` adds an X while there's a value.
 * `type="file"` renders as a field that shows the picked file's name (or
 * "3 files") in place of the browser's "Choose File" button, with an X to
 * unselect. `copyable` adds a copy button (a check confirms the copy).
 */
function Input({
  className,
  type,
  clearable,
  onClear,
  copyable,
  onChange,
  onFocus,
  ref,
  ...props
}: InputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isFile = type === "file"
  const controlled = props.value !== undefined
  const [uncontrolledFilled, setUncontrolledFilled] = React.useState(
    () => props.defaultValue != null && String(props.defaultValue) !== ""
  )
  const [files, setFiles] = React.useState<string[]>([])

  if (!clearable && !copyable && !isFile) {
    return (
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(inputClasses, className)}
        onChange={onChange}
        onFocus={onFocus}
        {...props}
      />
    )
  }

  const filled = isFile
    ? files.length > 0
    : controlled
      ? String(props.value ?? "") !== ""
      : uncontrolledFilled
  const canClear =
    (clearable || isFile) && filled && !props.disabled && !props.readOnly

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFile) {
      setFiles(Array.from(e.target.files ?? [], (f) => f.name))
    } else if (!controlled) {
      setUncontrolledFilled(e.target.value !== "")
    }
    onChange?.(e)
  }

  const clear = () => {
    const input = inputRef.current
    if (!input) return
    clearNative(input)
    input.focus()
    onClear?.()
  }

  if (isFile) {
    const summary =
      files.length > 1 ? `${files.length} files` : (files[0] ?? undefined)
    return (
      <div
        data-slot="input-wrapper"
        className={cn("relative w-full min-w-0", className)}
      >
        <label
          data-slot="input"
          data-empty={!summary || undefined}
          className={cn(
            inputClasses,
            "flex cursor-pointer items-center gap-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ds-focus-ring) has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:bg-input/50 has-disabled:opacity-50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 data-empty:text-muted-foreground dark:has-disabled:bg-input/80 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
            canClear && "pe-9"
          )}
        >
          <InputPrimitive
            ref={mergeRefs(ref, inputRef)}
            type="file"
            className="sr-only"
            onChange={handleChange}
            onFocus={onFocus}
            {...props}
          />
          <UploadIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="min-w-0 flex-1 truncate" title={files.join(", ")}>
            {summary ?? props.placeholder ?? "Choose file"}
          </span>
        </label>
        {canClear && (
          <ClearButton
            label={files.length > 1 ? "Remove files" : "Remove file"}
            onClear={clear}
          />
        )}
      </div>
    )
  }

  return (
    <div
      data-slot="input-wrapper"
      className={cn("relative w-full min-w-0", className)}
    >
      <InputPrimitive
        ref={mergeRefs(ref, inputRef)}
        type={type}
        data-slot="input"
        className={cn(
          inputClasses,
          (canClear || copyable) && "pe-9",
          canClear && copyable && "pe-16"
        )}
        onChange={handleChange}
        onFocus={(e) => {
          if (copyable && props.readOnly) e.currentTarget.select()
          onFocus?.(e)
        }}
        {...props}
      />
      {canClear && <ClearButton label="Clear" onClear={clear} />}
      {copyable && (
        <CopyButton
          offset={canClear}
          getValue={() => inputRef.current?.value ?? ""}
        />
      )}
    </div>
  )
}

export { Input }
