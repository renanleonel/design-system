"use client"

import { CircleAlertIcon, RotateCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/**
 * A region that failed to load (interaction.md: say what failed, keep the rest
 * of the screen usable, offer retry). Render it per section, not per page.
 */
function ErrorState({
  title = "Couldn't load this",
  description = "Check your connection and try again.",
  onRetry,
  retrying = false,
  requestId,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  onRetry?: () => void
  retrying?: boolean
  /** Shown small so support can trace a 5xx. */
  requestId?: string
  className?: string
}) {
  return (
    <Empty data-slot="error-state" role="alert" className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="text-destructive">
          <CircleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {(onRetry || requestId) && (
        <EmptyContent>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} loading={retrying}>
              <RotateCwIcon data-icon="inline-start" />
              Try again
            </Button>
          )}
          {requestId && (
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              Request ID {requestId}
            </p>
          )}
        </EmptyContent>
      )}
    </Empty>
  )
}

export { ErrorState }
