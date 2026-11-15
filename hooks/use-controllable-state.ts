"use client"

import * as React from "react"

type SetState<T> = (next: T | ((prev: T) => T)) => void

/**
 * ```tsx
 * const [count, setCount] = useControllableState({
 *   value: props.value,
 *   defaultValue: props.defaultValue ?? 0,
 *   onChange: props.onValueChange,
 * })
 * ```
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}): [T, SetState<T>] {
  const [inner, setInner] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner

  // Latest values for the stable setter, without re-creating it per render.
  const ref = React.useRef({ current, controlled, onChange })
  React.useLayoutEffect(() => {
    ref.current = { current, controlled, onChange }
  })

  const setValue = React.useCallback<SetState<T>>((next) => {
    const {
      current: prev,
      controlled: isControlled,
      onChange: notify,
    } = ref.current
    const resolved =
      typeof next === "function" ? (next as (prev: T) => T)(prev) : next
    if (Object.is(resolved, prev)) return
    // Keep the ref fresh so two calls in one tick chain correctly.
    ref.current.current = resolved
    if (!isControlled) setInner(resolved)
    notify?.(resolved)
  }, [])

  return [current, setValue]
}
