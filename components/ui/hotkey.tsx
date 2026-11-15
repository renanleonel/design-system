"use client"

import {
  useFormatForDisplay,
  type RegisterableHotkey,
} from "@tanstack/react-hotkeys"
import { cn } from "cn"

import { Kbd, KbdGroup } from "@/components/ui/kbd"

/** The platform is only known in the browser, so labels skip the hydration check; set `HotkeysProvider defaultOptions.platform` from the request to render it right on the server. */
function Hotkey({
  hotkey,
  variant = "keys",
  className,
}: {
  hotkey: RegisterableHotkey
  variant?: "keys" | "text"
  className?: string
}) {
  const format = useFormatForDisplay()
  const partsOf = (chord: unknown) =>
    (format as (chord: unknown, options: { parts: true }) => string[])(chord, {
      parts: true,
    })

  if (variant === "text") {
    const label = (chord: unknown) =>
      (format as (chord: unknown) => string)(chord)
    return (
      <span
        data-slot="hotkey"
        suppressHydrationWarning
        className={cn("tabular-nums pointer-coarse:hidden", className)}
      >
        {Array.isArray(hotkey) ? hotkey.map(label).join(" ") : label(hotkey)}
      </span>
    )
  }

  const steps = Array.isArray(hotkey) ? hotkey.map(partsOf) : [partsOf(hotkey)]
  return (
    <KbdGroup
      data-slot="hotkey"
      className={cn("pointer-coarse:hidden", className)}
    >
      {steps.flatMap((parts, s) =>
        parts.map((part, p) => (
          <Kbd key={`${s}-${p}`} suppressHydrationWarning>
            {part}
          </Kbd>
        ))
      )}
    </KbdGroup>
  )
}

export { Hotkey }
