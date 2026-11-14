"use client"

import * as React from "react"

/** How long `copied` stays true after a successful copy. */
export const COPIED_RESET_MS = 1500

/**
 * Copies text to the clipboard and reports it:
 *
 * ```tsx
 * const { copy, copied, error } = useCopyToClipboard()
 * <button onClick={() => copy(url)}>{copied ? "Copied" : "Copy"}</button>
 * ```
 *
 * `copy` resolves `true` on success and `false` when the Clipboard API is
 * missing (insecure context, old browser) or the browser refuses (permission,
 * no user gesture); it never throws. `copied` resets after `resetAfter` ms;
 * `error` holds the failure until the next attempt or `reset()`. `copy` and
 * `reset` are stable, and the pending timer is dropped on unmount.
 */
export function useCopyToClipboard({
  resetAfter = COPIED_RESET_MS,
}: {
  /** Milliseconds until `copied` goes back to false. */
  resetAfter?: number
} = {}) {
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const delay = React.useRef(resetAfter)
  React.useLayoutEffect(() => {
    delay.current = resetAfter
  })

  // Cleanup only: a timer is outside React.
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const reset = React.useCallback(() => {
    clearTimeout(timer.current)
    setCopied(false)
    setError(null)
  }, [])

  const copy = React.useCallback(async (text: string) => {
    clearTimeout(timer.current)
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText)
        throw new Error("Clipboard is not available in this browser.")
      await navigator.clipboard.writeText(text)
    } catch (cause) {
      setCopied(false)
      setError(cause instanceof Error ? cause : new Error("Couldn't copy."))
      return false
    }
    setError(null)
    setCopied(true)
    timer.current = setTimeout(() => setCopied(false), delay.current)
    return true
  }, [])

  return { copy, copied, error, reset }
}
