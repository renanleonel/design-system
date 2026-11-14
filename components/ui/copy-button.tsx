"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

type CopyButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "value" | "children" | "onClick" | "onError"
> & {
  /** Text to copy; a function is read at click time (current input value, selection). */
  value: string | (() => string)
  /** Accessible name and tooltip while idle. Name what is copied: "Copy API key". */
  label?: string
  /** Tooltip after a successful copy. */
  copiedLabel?: string
  /** Milliseconds the check stays before it swaps back. */
  resetAfter?: number
  /** Runs after a successful copy. */
  onCopy?: (value: string) => void
  /** Runs when the browser refuses or has no Clipboard API. */
  onCopyError?: (error: Error) => void
}

/**
 * An icon button that copies a value. A check replaces the copy icon for a
 * moment, the tooltip changes to "Copied", and a live region announces the
 * result to screen readers. Needs a secure context (https or localhost); where
 * the Clipboard API is missing it says "Couldn't copy" instead of failing
 * silently.
 */
function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  resetAfter,
  onCopy,
  onCopyError,
  variant = "ghost",
  size = "icon-sm",
  className,
  ...props
}: CopyButtonProps) {
  const { copy, copied, error } = useCopyToClipboard({ resetAfter })
  const text = error ? "Couldn't copy" : copied ? copiedLabel : label
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant={variant}
              size={size}
              aria-label={label}
              data-slot="copy-button"
              data-copied={copied || undefined}
              className={cn("text-muted-foreground", className)}
              onClick={async () => {
                const next = typeof value === "function" ? value() : value
                if (await copy(next)) onCopy?.(next)
                else onCopyError?.(new Error("Couldn't copy."))
              }}
              {...props}
            />
          }
        >
          {/* Two stacked icons cross-fade with a small scale; reduced motion
              keeps the fade and drops the scale. */}
          <span aria-hidden className="relative block size-4">
            <CopyIcon
              className={cn(
                "absolute inset-0 transition-[opacity,transform] duration-(--ds-duration-popover) ease-out motion-reduce:scale-100",
                copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
              )}
            />
            <CheckIcon
              className={cn(
                "absolute inset-0 text-tone-green transition-[opacity,transform] duration-(--ds-duration-popover) ease-out motion-reduce:scale-100",
                copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
              )}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
      <span role="status" className="sr-only">
        {error
          ? "Couldn't copy to clipboard"
          : copied
            ? "Copied to clipboard"
            : ""}
      </span>
    </>
  )
}

export { CopyButton }
export type { CopyButtonProps }
