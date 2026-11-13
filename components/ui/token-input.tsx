"use client"

import * as React from "react"
import { cn } from "cn"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Splits pasted or typed text into tokens. */
const SEPARATORS = /[,;\n\t]+/

/**
 * Free-form values as removable tokens: emails, keywords, domains. Enter,
 * comma or Tab adds what's typed (Tab only when there's text); pasting a
 * list adds each entry; blur keeps a half-typed one. Backspace in the empty
 * input removes the last token. Duplicates are skipped (case-insensitive).
 * Tokens that fail `validate` stay, marked invalid with the reason as their
 * title, so people see what to fix instead of losing what they typed.
 */
function TokenInput({
  value,
  defaultValue = [],
  onValueChange,
  validate,
  max,
  placeholder = "Add…",
  id,
  name,
  disabled,
  className,
  ref,
  onBlur,
  ...aria
}: {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Returns an error message for an invalid token, or nothing. */
  validate?: (token: string) => string | undefined
  /** Stops adding once reached. */
  max?: number
  placeholder?: string
  id?: string
  /** Submits the tokens comma-joined. */
  name?: string
  disabled?: boolean
  className?: string
  ref?: React.Ref<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
}) {
  const [own, setOwn] = React.useState(defaultValue)
  const tokens = value ?? own
  const [draft, setDraft] = React.useState("")
  const [announcement, setAnnouncement] = React.useState("")
  const input = React.useRef<HTMLInputElement | null>(null)

  const commit = (next: string[], message: string) => {
    setOwn(next)
    onValueChange?.(next)
    setAnnouncement(message)
  }

  const add = (text: string) => {
    const seen = new Set(tokens.map((t) => t.toLowerCase()))
    const added: string[] = []
    for (const raw of text.split(SEPARATORS)) {
      const token = raw.trim()
      if (!token || seen.has(token.toLowerCase())) continue
      if (max !== undefined && tokens.length + added.length >= max) break
      seen.add(token.toLowerCase())
      added.push(token)
    }
    setDraft("")
    if (added.length)
      commit(
        [...tokens, ...added],
        added.length === 1 ? `Added ${added[0]}` : `Added ${added.length}`
      )
  }

  const remove = (index: number) => {
    const token = tokens[index]
    commit(
      tokens.filter((_, i) => i !== index),
      `Removed ${token}`
    )
    input.current?.focus()
  }

  const full = max !== undefined && tokens.length >= max

  return (
    <div
      data-slot="token-input"
      data-disabled={disabled || undefined}
      // Inactive controls are exempt from contrast (WCAG 1.4.3); say so.
      aria-disabled={disabled || undefined}
      // Clicking the padding or between tokens types into the input.
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault()
          input.current?.focus()
        }
      }}
      className={cn(
        "flex min-h-control w-full flex-wrap items-center gap-1 rounded-control border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-base transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--ds-focus-ring) has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=token]:ps-1 data-disabled:pointer-events-none data-disabled:opacity-50 sm:text-sm dark:bg-input/30",
        className
      )}
    >
      {tokens.map((token, i) => {
        const error = validate?.(token)
        return (
          <span
            key={token}
            data-slot="token"
            data-invalid={error ? true : undefined}
            title={error ? `${token}: ${error}` : token}
            className="flex h-[calc(--spacing(5.25))] max-w-full min-w-0 items-center gap-1 rounded-sm bg-muted ps-1.5 text-xs font-medium whitespace-nowrap text-foreground data-invalid:bg-tone-red/12 data-invalid:text-tone-red"
          >
            <span className="truncate">{token}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={error ? `Remove ${token} (${error})` : `Remove ${token}`}
              disabled={disabled}
              onClick={() => remove(i)}
              className="-ms-1 text-current opacity-60 hover:opacity-100"
            >
              <XIcon className="pointer-events-none" />
            </Button>
          </span>
        )
      })}
      <input
        ref={(el) => {
          input.current = el
          if (typeof ref === "function") return ref(el)
          if (ref) ref.current = el
        }}
        id={id}
        value={draft}
        disabled={disabled}
        readOnly={full}
        // Only while empty: beside tokens it gets clipped to a fragment.
        placeholder={tokens.length ? undefined : placeholder}
        enterKeyHint="enter"
        autoComplete="off"
        onChange={(e) => {
          const text = e.target.value
          // A typed separator commits; Android keyboards skip keydown for it.
          if (SEPARATORS.test(text)) add(text)
          else setDraft(text)
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return
          // Enter in an empty input still submits the form.
          if ((e.key === "Enter" || e.key === "Tab") && draft.trim()) {
            e.preventDefault()
            add(draft)
          } else if (e.key === "Backspace" && !draft && tokens.length) {
            remove(tokens.length - 1)
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text")
          if (!SEPARATORS.test(text)) return
          e.preventDefault()
          add(draft + text)
        }}
        onBlur={(e) => {
          if (draft.trim()) add(draft)
          onBlur?.(e)
        }}
        className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        {...aria}
      />
      {name && <input type="hidden" name={name} value={tokens.join(",")} />}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}

export { TokenInput }
