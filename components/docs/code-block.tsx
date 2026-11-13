import { cn } from "cn"

import { CopyButton } from "@/components/docs/copy-button"
import { highlight } from "@/lib/docs"

/** Highlighted at build time (shiki, light and dark), with a copy button. */
export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  className,
}: {
  code: string
  lang?: "tsx" | "bash"
  title?: string
  className?: string
}) {
  const html = await highlight(code, lang)
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
        className="docs-code max-h-[32rem] overflow-auto focus-ring-inset py-3.5 text-[0.8125rem] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  )
}
