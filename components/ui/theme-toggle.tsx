"use client"

import * as React from "react"
import { cn } from "cn"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/**
 * Light/dark in one button. Which icon shows is decided by CSS (`.dark`), not
 * by `resolvedTheme`, which is unknown during SSR, so there is no hydration
 * flash. The icons swap with a quick rotate-and-fade; with a `hotkey` the
 * switch is instant, like every keyboard action.
 */
function ThemeToggle({
  hotkey,
  className,
}: {
  hotkey?: RegisterableHotkey
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const icon =
    "absolute size-4 transition-[opacity,rotate,scale] duration-200 ease-out in-data-ds-instant:transition-none motion-reduce:transition-none"
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
        className={cn(icon, "scale-50 -rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100")}
      />
      <MoonIcon
        className={cn(icon, "dark:scale-50 dark:rotate-90 dark:opacity-0")}
      />
    </Button>
  )
}

const noop = () => () => {}
/** True after hydration: the stored theme only exists in the browser. */
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

/**
 * System / light / dark as a joined segmented control, for settings pages and
 * footers. Shows nothing selected until mounted (the stored choice is only
 * known in the browser), then the saved one.
 */
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
