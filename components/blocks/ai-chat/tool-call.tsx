"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, WrenchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CopyButton } from "@/components/ui/copy-button"
import { Spinner } from "@/components/ui/spinner"

export type ToolCallStatus = "running" | "done" | "error"

export type ToolCall = {
  id: string
  /** Tool name as the model called it: `search_docs`. */
  name: string
  status: ToolCallStatus
  /** Arguments; objects are shown as JSON. */
  args?: unknown
  /** Output once done; objects are shown as JSON. */
  result?: unknown
  /** First line of the failure, shown in the row and in full when expanded. */
  error?: string
  /** Already formatted: "1.2s". */
  duration?: string
}

const STATUS_LABEL: Record<ToolCallStatus, string> = {
  running: "Running",
  done: "Done",
  error: "Failed",
}

function format(value: unknown) {
  if (value === undefined) return ""
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

/** One line of the arguments for the collapsed row: `query: "billing", limit: 5`. */
function summarize(args: unknown) {
  if (args === undefined || args === null) return ""
  if (typeof args !== "object") return String(args)
  return Object.entries(args as Record<string, unknown>)
    .map(
      ([k, v]) =>
        `${k}: ${typeof v === "string" ? `"${v}"` : JSON.stringify(v)}`
    )
    .join(", ")
}

export function StatusGlyph({ status }: { status: ToolCallStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full",
        status === "done" && "bg-tone-green/12 text-tone-green",
        status === "error" && "bg-tone-red/12 text-tone-red",
        status === "running" && "text-muted-foreground"
      )}
    >
      {status === "running" ? (
        <Spinner role={undefined} aria-label={undefined} className="size-3.5" />
      ) : status === "done" ? (
        <CheckIcon className="size-3" />
      ) : (
        <XIcon className="size-3" />
      )}
    </span>
  )
}

function Section({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "red"
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex h-6 items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <CopyButton
          value={value}
          label={`Copy ${label.toLowerCase()}`}
          size="icon-xs"
        />
      </div>
      <pre
        tabIndex={0}
        aria-label={label}
        className={cn(
          "max-h-64 overflow-auto rounded-lg bg-background px-2.5 py-2 font-mono text-xs leading-relaxed focus-ring outline-none",
          // Errors wrap so the whole message reads without scrolling.
          tone === "red" && "wrap-anywhere whitespace-pre-wrap text-tone-red"
        )}
      >
        {value}
      </pre>
    </div>
  )
}

/**
 * A tool call as one inspectable row: status, name, arguments at a glance and
 * the duration; expand for the full arguments and result. Failed calls open by
 * default so the error is never hidden.
 */
export function ToolCallCard({ call }: { call: ToolCall }) {
  const args = format(call.args)
  const result = format(call.result)
  const summary = summarize(call.args)
  return (
    <Collapsible
      defaultOpen={call.status === "error"}
      data-slot="tool-call"
      data-status={call.status}
      className="rounded-xl bg-card shadow-border"
    >
      <CollapsibleTrigger className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-sm transition-colors hover:bg-muted/50">
        <StatusGlyph status={call.status} />
        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="shrink-0 font-mono text-xs font-medium">
            {call.name}
          </span>
          {summary && (
            <span className="truncate font-mono text-xs text-muted-foreground">
              {summary}
            </span>
          )}
        </span>
        <span
          className={cn(
            "shrink-0 text-xs tabular-nums",
            call.status === "error" ? "text-tone-red" : "text-muted-foreground"
          )}
        >
          {call.status === "done" && call.duration
            ? call.duration
            : STATUS_LABEL[call.status]}
          {call.status === "done" && call.duration && (
            <span className="sr-only">, done</span>
          )}
        </span>
        <ChevronDownIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--ds-duration-popover) ease-out group-data-panel-open/collapsible-trigger:rotate-180 motion-reduce:transition-none"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 border-t px-2.5 pt-2 pb-3">
          {args && <Section label="Arguments" value={args} />}
          {call.status === "error" && call.error ? (
            <Section label="Error" value={call.error} tone="red" />
          ) : call.status === "running" ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner
                role={undefined}
                aria-label={undefined}
                className="size-3.5"
              />
              Waiting for the result
            </p>
          ) : (
            result && <Section label="Result" value={result} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * Several calls in one message: up to three show as rows; more collapse into
 * a "6 tool calls" summary (open while running or when one failed).
 */
export function ToolCallList({ calls }: { calls: ToolCall[] }) {
  const running = calls.some((c) => c.status === "running")
  const failed = calls.filter((c) => c.status === "error").length
  const rows = (
    <ul className="flex flex-col gap-1.5">
      {calls.map((call) => (
        <li key={call.id}>
          <ToolCallCard call={call} />
        </li>
      ))}
    </ul>
  )
  if (calls.length <= 3) return rows
  return (
    <Collapsible defaultOpen={running || failed > 0}>
      <CollapsibleTrigger className="-ms-1 flex h-7 items-center gap-1.5 px-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <WrenchIcon aria-hidden className="size-3.5" />
        <span className="tabular-nums">
          {calls.length} tool calls
          {failed > 0 && ` · ${failed} failed`}
        </span>
        <ChevronDownIcon
          aria-hidden
          className="size-3.5 transition-transform duration-(--ds-duration-popover) ease-out group-data-panel-open/collapsible-trigger:rotate-180 motion-reduce:transition-none"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-1.5">{rows}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
