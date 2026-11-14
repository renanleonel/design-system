"use client"

import { CopyButton } from "@/components/ui/copy-button"

/** Click to copy; a check and "Copied" confirm, announced to screen readers. */
export function Default() {
  return (
    <div className="flex items-center gap-2">
      <code className="rounded-control bg-muted px-2 py-1 text-sm">
        npx shadcn add copy-button
      </code>
      <CopyButton value="npx shadcn add copy-button" label="Copy command" />
    </div>
  )
}

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CopyButton value="ghost" label="Copy ghost" />
      <CopyButton value="outline" variant="outline" label="Copy outline" />
      <CopyButton value="secondary" variant="secondary" label="Copy secondary" />
      <CopyButton value="small" size="icon-xs" label="Copy small" />
      <CopyButton value="large" size="icon-lg" variant="outline" label="Copy large" />
      <CopyButton value="x" disabled label="Copy disabled" />
    </div>
  )
}

/** `value` can be a function, read when clicked. */
export function LiveValue() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <input
        aria-label="Text to copy"
        defaultValue="Edit me, then copy"
        className="h-control min-w-0 flex-1 rounded-control border border-input bg-transparent px-2.5 text-base focus-ring outline-none pointer-fine:text-sm"
        id="copy-live-source"
      />
      <CopyButton
        label="Copy text"
        value={() =>
          (document.getElementById("copy-live-source") as HTMLInputElement)
            .value
        }
      />
    </div>
  )
}

/** A 50-character token, CJK and Arabic copy as-is; the long value stays inside its box. */
export function WorstCase() {
  const values = [
    "demo-token-51NzQxLEoAbCdEfGhIjKlMnOpQrStUvWxYz012345",
    "https://exemplo.com.br/convites/maria-eduarda-dos-santos-albuquerque-cavalcanti?token=abcdef0123456789",
    "プロジェクトのAPIキーをコピーする",
    "انسخ مفتاح الواجهة البرمجية",
  ]
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      {values.map((value) => (
        <div
          key={value}
          className="flex items-center gap-2 rounded-control bg-muted p-1 ps-2.5"
        >
          <code className="min-w-0 flex-1 truncate text-sm" title={value}>
            {value}
          </code>
          <CopyButton value={value} label={`Copy ${value.slice(0, 20)}`} />
        </div>
      ))}
    </div>
  )
}
