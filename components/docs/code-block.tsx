import { CodeFigure } from "@/components/docs/code-figure"
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
    <CodeFigure html={html} code={code} title={title} className={className} />
  )
}
