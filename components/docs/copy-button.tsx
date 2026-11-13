"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "Copied" : label}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={() => {
        void navigator.clipboard.writeText(value)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), 1500)
      }}
    >
      {/* Both icons stay mounted; the swap is a quick crossfade. */}
      <span className="relative size-4">
        <CopyIcon
          className={cn(
            "absolute inset-0 size-4 transition-[opacity,scale] duration-150 ease-out",
            copied && "scale-75 opacity-0"
          )}
        />
        <CheckIcon
          className={cn(
            "absolute inset-0 size-4 transition-[opacity,scale] duration-150 ease-out",
            !copied && "scale-75 opacity-0"
          )}
        />
      </span>
    </Button>
  )
}
