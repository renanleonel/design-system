"use client"

import * as React from "react"

import { CopyButton } from "@/components/ui/copy-button"

// A small Markdown subset for model output, with no dependency: paragraphs,
// headings, lists, fenced code (copy button, unclosed fences while streaming),
// inline code, bold, italics and http(s) links. React escapes every string, so
// model output can't inject markup.

// `key` is the block's first source line: it stays put as streamed text grows.
type Block = { key: number } & (
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul" | "ol"; items: ListItem[]; start?: number }
  | { type: "code"; lang: string; code: string }
  | { type: "quote"; text: string }
)

type ListItem = { key: number; text: string }

const FENCE = /^\s*```\s*([\w+#.-]*)\s*$/
const UL = /^\s*[-*+]\s+(.*)$/
const OL = /^\s*(\d+)[.)]\s+(.*)$/
const HEADING = /^#{1,4}\s+(.*)$/
const QUOTE = /^>\s?(.*)$/

function parse(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const key = i
    const fence = line.match(FENCE)
    if (fence) {
      const code: string[] = []
      i++
      // An unclosed fence (mid-stream) runs to the end of the text.
      while (i < lines.length && !FENCE.test(lines[i])) code.push(lines[i++])
      i++
      blocks.push({ key, type: "code", lang: fence[1], code: code.join("\n") })
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    const heading = line.match(HEADING)
    if (heading) {
      blocks.push({ key, type: "h", text: heading[1] })
      i++
      continue
    }
    if (UL.test(line) || OL.test(line)) {
      const ordered = !UL.test(line)
      const pattern = ordered ? OL : UL
      const items: ListItem[] = []
      const start = ordered ? Number(line.match(OL)?.[1]) : undefined
      let m: RegExpMatchArray | null
      while (i < lines.length && (m = lines[i].match(pattern))) {
        items.push({ key: i, text: ordered ? m[2] : m[1] })
        i++
      }
      blocks.push({ key, type: ordered ? "ol" : "ul", items, start })
      continue
    }
    if (QUOTE.test(line)) {
      const text: string[] = []
      let m: RegExpMatchArray | null
      while (i < lines.length && (m = lines[i].match(QUOTE))) {
        text.push(m[1])
        i++
      }
      blocks.push({ key, type: "quote", text: text.join("\n") })
      continue
    }
    const text: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !FENCE.test(lines[i]) &&
      !HEADING.test(lines[i]) &&
      !UL.test(lines[i]) &&
      !OL.test(lines[i]) &&
      !QUOTE.test(lines[i])
    )
      text.push(lines[i++])
    blocks.push({ key, type: "p", text: text.join("\n") })
  }
  return blocks
}

// `code`, **bold**, *italic*, [label](https://…) and bare https:// URLs.
const INLINE =
  /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g

const LINK_CLASS =
  "rounded-sm font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-3 focus-ring hover:decoration-foreground"

function Inline({ text }: { text: string }) {
  const out: React.ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of text.matchAll(INLINE)) {
    const index = m.index ?? 0
    if (index > last) out.push(withBreaks(text.slice(last, index), key++))
    const [token] = m
    if (m[1])
      out.push(
        <code
          key={key++}
          className="rounded-md bg-muted px-1 py-0.5 font-mono text-[0.875em] wrap-anywhere"
        >
          {token.slice(1, -1)}
        </code>
      )
    else if (m[2])
      out.push(
        <strong key={key++} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      )
    else if (m[3]) out.push(<em key={key++}>{token.slice(1, -1)}</em>)
    else if (m[4]) {
      const split = token.indexOf("](")
      out.push(
        <a
          key={key++}
          href={token.slice(split + 2, -1)}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          {token.slice(1, split)}
        </a>
      )
    } else
      out.push(
        <a
          key={key++}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          {token}
        </a>
      )
    last = index + token.length
  }
  if (last < text.length) out.push(withBreaks(text.slice(last), key++))
  return out
}

function withBreaks(text: string, key: number) {
  const parts = text.split("\n")
  return (
    <React.Fragment key={key}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {part}
        </React.Fragment>
      ))}
    </React.Fragment>
  )
}

function CodeBlock({
  lang,
  code,
  caret,
}: {
  lang: string
  code: string
  caret?: React.ReactNode
}) {
  return (
    <figure
      data-slot="chat-code-block"
      className="my-3 overflow-hidden rounded-xl bg-muted/60 shadow-border"
    >
      <figcaption className="flex h-9 items-center justify-between gap-2 ps-3 pe-1 text-xs text-muted-foreground">
        <span className="truncate font-mono">{lang || "text"}</span>
        <CopyButton
          value={code}
          label={lang ? `Copy ${lang} code` : "Copy code"}
          size="icon-xs"
        />
      </figcaption>
      {/* Focusable so the keyboard can scroll long lines; capped height for huge blocks. */}
      <pre
        tabIndex={0}
        aria-label={lang ? `${lang} code` : "Code"}
        className="max-h-96 overflow-auto bg-card px-3 py-2.5 font-mono text-[0.8125rem] leading-relaxed focus-ring outline-none"
      >
        <code>{code}</code>
        {caret}
      </pre>
    </figure>
  )
}

/**
 * Renders model output. `caret` is placed at the end of the last block, so a
 * streaming caret stays on the line being written.
 */
export function Markdown({
  content,
  caret,
}: {
  content: string
  caret?: React.ReactNode
}) {
  const blocks = React.useMemo(() => parse(content), [content])
  if (!blocks.length) return caret ? <p>{caret}</p> : null
  return blocks.map((block, i) => {
    const end = i === blocks.length - 1 ? caret : null
    switch (block.type) {
      case "code":
        return (
          <CodeBlock
            key={block.key}
            lang={block.lang}
            code={block.code}
            caret={end}
          />
        )
      case "h":
        return (
          <h3
            key={block.key}
            dir="auto"
            className="mt-4 mb-1 text-base font-semibold first:mt-0"
          >
            <Inline text={block.text} />
            {end}
          </h3>
        )
      case "quote":
        return (
          <blockquote
            key={block.key}
            dir="auto"
            className="my-2 border-s-2 ps-3 text-muted-foreground"
          >
            <Inline text={block.text} />
            {end}
          </blockquote>
        )
      case "ul":
      case "ol": {
        const List = block.type
        return (
          <List
            key={block.key}
            start={block.start !== 1 ? block.start : undefined}
            className={
              block.type === "ul"
                ? "my-2 list-disc space-y-1 ps-5 marker:text-muted-foreground"
                : "my-2 list-decimal space-y-1 ps-5 marker:text-muted-foreground marker:tabular-nums"
            }
          >
            {block.items.map((item, j) => (
              <li key={item.key} dir="auto">
                <Inline text={item.text} />
                {j === block.items.length - 1 && end}
              </li>
            ))}
          </List>
        )
      }
      default:
        return (
          <p key={block.key} dir="auto" className="my-2 first:mt-0 last:mb-0">
            <Inline text={block.text} />
            {end}
          </p>
        )
    }
  })
}
