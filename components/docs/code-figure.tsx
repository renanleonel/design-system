import { cn } from "cn"

import { CopyButton } from "@/components/docs/copy-button"

/** Pre-highlighted code (shiki HTML) with a copy button; shared by server and client views. */
export function CodeFigure({
  html,
  code,
  title,
  className,
}: {
  html: string
  code: string
  title?: string
  className?: string
}) {
  return (
    <figure
      data-slot="code-block"
      className={cn(
        "group/code relative overflow-hidden rounded-xl bg-card shadow-border",
        className
      )}
    >
      {title && (
        <figcaption className="border-b px-4 py-2 font-mono text-xs text-muted-foreground">
          {title}
        </figcaption>
      )}
      <CopyButton value={code} className="absolute top-1.5 right-1.5 z-10" />
      <div
        tabIndex={0}
        role="region"
        aria-label={title ? `Code: ${title}` : "Code"}
        className="docs-code max-h-[32rem] overflow-auto py-3.5 text-[0.8125rem] leading-relaxed focus-ring-inset"
        // shiki's output, generated at build time from this repo's own files
        // (lib/docs.ts highlight); shiki escapes the source it tokenizes.
        // react-doctor-disable-next-line react-doctor/dangerous-html-sink
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  )
}
