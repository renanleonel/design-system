"use client"

import * as React from "react"
import { cn } from "cn"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** The icon is chosen by CSS (`.dark`), not `resolvedTheme`, which is unknown during SSR: no hydration flash. */
function ThemeToggle({
  hotkey,
  className,
}: {
  hotkey?: RegisterableHotkey
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const icon =
    "absolute size-4 transition-[opacity,rotate,scale] duration-(--ds-duration-popover) ease-out in-data-ds-instant:transition-none motion-reduce:transition-none"
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      hotkey={hotkey}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn("relative", className)}
    >
      <SunIcon
        className={cn(
          icon,
          "scale-50 -rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100"
        )}
      />
      <MoonIcon
        className={cn(icon, "dark:scale-50 dark:rotate-90 dark:opacity-0")}
      />
    </Button>
  )
}

const noop = () => () => {}
const useMounted = () =>
  React.useSyncExternalStore(
    noop,
    () => true,
    () => false
  )

const MODES = [
  { value: "system", label: "System", icon: <MonitorIcon /> },
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
]

function ThemeSwitcher({
  showLabels = false,
  className,
}: {
  showLabels?: boolean
  className?: string
}) {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      spacing={0}
      value={mounted && theme ? [theme] : []}
      onValueChange={(value) => value[0] && setTheme(value[0])}
      aria-label="Theme"
      className={className}
    >
      {MODES.map((mode) => (
        <ToggleGroupItem
          key={mode.value}
          value={mode.value}
          aria-label={showLabels ? undefined : mode.label}
        >
          {mode.icon}
          {showLabels && mode.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { ThemeSwitcher, ThemeToggle }
