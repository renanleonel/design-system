"use client"

import * as React from "react"

export const DEBOUNCE_MS = 300

type Debounced<Args extends unknown[]> = ((...args: Args) => void) & {
  cancel: () => void
  flush: () => void
}

export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = DEBOUNCE_MS
): Debounced<Args> {
  // Created once; the timer and the latest fn/delay live in this closure, so
  // the returned function keeps its identity across renders.
  const [api] = React.useState(() => createDebounced(fn, delay))
  React.useLayoutEffect(() => api.update(fn, delay))
  // Cleanup only: a timer is outside React.
  React.useEffect(() => api.debounced.cancel, [api])
  return api.debounced
}

function createDebounced<Args extends unknown[]>(
  initialFn: (...args: Args) => void,
  initialDelay: number
) {
  let fn = initialFn
  let delay = initialDelay
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: Args | null = null
  const cancel = () => {
    clearTimeout(timer)
    pending = null
  }
  const flush = () => {
    const args = pending
    cancel()
    if (args) fn(...args)
  }
  const debounced = Object.assign(
    (...args: Args) => {
      clearTimeout(timer)
      pending = args
      timer = setTimeout(flush, delay)
    },
    { cancel, flush }
  )
  return {
    debounced,
    update: (nextFn: (...args: Args) => void, nextDelay: number) => {
      fn = nextFn
      delay = nextDelay
    },
  }
}

/**
 * ```tsx
 * const [query, debouncedQuery, setQuery] = useDebouncedState("")
 * <Input value={query} onChange={(e) => setQuery(e.target.value)} />
 * useQuery({ queryKey: ["people", debouncedQuery], … })
 * ```
 *
 * `setQuery(value, { immediate: true })` skips the wait (clear buttons, Enter).
 */
export function useDebouncedState<T>(initial: T, delay = DEBOUNCE_MS) {
  const [value, setValueNow] = React.useState(initial)
  const [debounced, setDebounced] = React.useState(initial)
  const commit = useDebouncedCallback(setDebounced, delay)
  const setValue = React.useCallback(
    (next: T, { immediate = false }: { immediate?: boolean } = {}) => {
      setValueNow(next)
      if (immediate) {
        commit.cancel()
        setDebounced(next)
      } else commit(next)
    },
    [commit]
  )
  return [value, debounced, setValue] as const
}
