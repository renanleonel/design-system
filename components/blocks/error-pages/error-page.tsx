import { cn } from "cn"
import { ArrowLeftIcon, LifeBuoyIcon, RotateCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type Variant = "not-found" | "forbidden" | "server-error" | "maintenance"

const COPY: Record<Variant, { code: string; title: string; description: string }> = {
  "not-found": {
    code: "404",
    title: "This page doesn't exist",
    description:
      "The link may be broken, or the page was moved or deleted. Check the address, or head back home.",
  },
  forbidden: {
    code: "403",
    title: "You don't have access",
    description:
      "This belongs to a workspace you're not a member of. Ask an admin to invite you, or switch accounts.",
  },
  "server-error": {
    code: "500",
    title: "Something went wrong on our side",
    description:
      "It's not you. We've been notified and are looking into it. Try again in a moment.",
  },
  maintenance: {
    code: "503",
    title: "Down for scheduled maintenance",
    description:
      "We're upgrading the database and will be back by 14:00 UTC. Your data is safe.",
  },
}

/**
 * Full-page errors: what happened, whose fault it is, and the way out. Pass
 * `onRetry` for transient failures and `requestId` so support can trace a 5xx.
 * Links are plain `<a>` (or your router's Link via `render`).
 */
export function ErrorPage({
  variant,
  title,
  description,
  homeHref = "/",
  supportHref,
  onRetry,
  requestId,
  className,
}: {
  variant: Variant
  title?: string
  description?: string
  homeHref?: string
  supportHref?: string
  onRetry?: () => void
  requestId?: string
  className?: string
}) {
  const copy = COPY[variant]
  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-16 text-center",
        className
      )}
    >
      <div className="flex max-w-md flex-col items-center gap-4">
        <p
          aria-hidden
          className="bg-linear-to-b from-foreground to-foreground/20 bg-clip-text font-heading text-8xl leading-none font-semibold tracking-tighter text-transparent tabular-nums"
        >
          {copy.code}
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          <span className="sr-only">Error {copy.code}: </span>
          {title ?? copy.title}
        </h1>
        <p className="text-muted-foreground">{description ?? copy.description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry}>
              <RotateCwIcon data-icon="inline-start" />
              Try again
            </Button>
          )}
          <Button
            variant={onRetry ? "outline" : "default"}
            render={<a href={homeHref} />}
            nativeButton={false}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Back home
          </Button>
          {supportHref && (
            <Button
              variant="ghost"
              render={<a href={supportHref} />}
              nativeButton={false}
            >
              <LifeBuoyIcon data-icon="inline-start" />
              Contact support
            </Button>
          )}
        </div>
        {requestId && (
          <p className="mt-4 font-mono text-xs text-muted-foreground tabular-nums">
            Request ID {requestId}
          </p>
        )}
      </div>
    </main>
  )
}
