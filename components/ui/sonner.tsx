"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      // interaction.md: >= 5s, paused on hover/focus/hidden tab (sonner does both),
      // and a toast with an action stays long enough to use it.
      duration={6000}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

/**
 * "Deleted. Undo" (interaction.md: prefer undo over confirm for reversible
 * actions). Run the action right away, and offer to revert it for 10s.
 */
function toastUndo(
  message: React.ReactNode,
  { onUndo, duration = 10_000 }: { onUndo: () => void; duration?: number }
) {
  return toast(message, {
    duration,
    action: { label: "Undo", onClick: onUndo },
  })
}

export { Toaster, toastUndo }
