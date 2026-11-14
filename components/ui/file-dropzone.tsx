"use client"

import * as React from "react"
import { cn } from "cn"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`
}

/** `accept` like the input attribute: ".pdf,image/*". */
// A stable key per File object, so removing one file doesn't remount the rest.
const fileKeys = new WeakMap<File, string>()
let nextFileKey = 0
function fileKey(file: File) {
  let key = fileKeys.get(file)
  if (!key) {
    key = `file-${nextFileKey++}`
    fileKeys.set(file, key)
  }
  return key
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true
  return accept.split(",").some((rule) => {
    const r = rule.trim().toLowerCase()
    if (r.startsWith(".")) return file.name.toLowerCase().endsWith(r)
    if (r.endsWith("/*")) return file.type.startsWith(r.slice(0, -1))
    return file.type === r
  })
}

/**
 * Drop files or browse for them. The whole zone is one button (Enter/Space
 * opens the picker), it lights up while files are dragged over the window
 * part it covers, and files that are too big or of the wrong type are listed
 * with the reason instead of silently dropped.
 */
function FileDropzone({
  value,
  defaultValue = [],
  onValueChange,
  accept,
  multiple = true,
  maxFiles,
  maxSize,
  disabled,
  hint,
  id,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  value?: File[]
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  /** Bytes. */
  maxSize?: number
  disabled?: boolean
  /** e.g. "PDF or PNG, up to 10 MB" */
  hint?: React.ReactNode
  id?: string
  className?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [internal, setInternal] = React.useState(defaultValue)
  const [rejected, setRejected] = React.useState<
    { name: string; reason: string }[]
  >([])
  // dragenter/dragleave fire for every child; count them to know when we left.
  const [dragDepth, setDragDepth] = React.useState(0)
  const files = value ?? internal

  const commit = (next: File[]) => {
    setInternal(next)
    onValueChange?.(next)
  }

  const add = (incoming: File[]) => {
    const accepted: File[] = []
    const errors: { name: string; reason: string }[] = []
    for (const file of incoming) {
      if (!matchesAccept(file, accept))
        errors.push({
          name: file.name,
          reason: "This file type isn't allowed.",
        })
      else if (maxSize && file.size > maxSize)
        errors.push({
          name: file.name,
          reason: `Larger than ${formatBytes(maxSize)}.`,
        })
      else accepted.push(file)
    }
    let next = multiple ? [...files, ...accepted] : accepted.slice(0, 1)
    if (maxFiles && next.length > maxFiles) {
      for (const file of next.slice(maxFiles))
        errors.push({
          name: file.name,
          reason:
            maxFiles === 1
              ? "Only 1 file allowed."
              : `Only ${maxFiles} files allowed.`,
        })
      next = next.slice(0, maxFiles)
    }
    setRejected(errors)
    commit(next)
  }

  const dragging = dragDepth > 0 && !disabled

  return (
    <div
      data-slot="file-dropzone"
      className={cn("flex flex-col gap-3", className)}
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        data-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        data-dragging={dragging || undefined}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragDepth((d) => d + 1)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragDepth((d) => Math.max(0, d - 1))}
        onDrop={(e) => {
          e.preventDefault()
          setDragDepth(0)
          if (!disabled) add([...e.dataTransfer.files])
        }}
        className="group/dropzone flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input px-6 py-8 text-center focus-ring transition-[border-color,background-color] duration-150 ease-out hover:border-foreground/25 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50 data-dragging:border-primary data-dragging:bg-primary/5 data-invalid:border-destructive"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-[scale,color] duration-150 ease-out group-data-dragging/dropzone:scale-110 group-data-dragging/dropzone:text-primary motion-reduce:transition-none">
          <UploadIcon className="size-4" />
        </span>
        <span className="text-sm font-medium">
          {dragging ? "Drop to upload" : "Drag files here or browse"}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          add([...(e.target.files ?? [])])
          e.target.value = ""
        }}
      />
      {(files.length > 0 || rejected.length > 0) && (
        <ul className="flex flex-col gap-1.5" aria-label="Files">
          {files.map((file) => (
            <li
              key={fileKey(file)}
              className="flex items-center gap-3 rounded-lg bg-card py-1.5 ps-3 pe-1.5 shadow-border"
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <span
                className="min-w-0 flex-1 truncate text-sm"
                title={file.name}
              >
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatBytes(file.size)}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => commit(files.filter((f) => f !== file))}
              >
                <XIcon />
              </Button>
            </li>
          ))}
          {rejected.map((file) => (
            <li
              key={`rejected-${file.name}`}
              role="alert"
              className="flex items-center gap-3 rounded-lg bg-destructive/5 px-3 py-2 text-sm"
            >
              <FileIcon className="size-4 shrink-0 text-destructive" />
              <span className="min-w-0 flex-1 truncate" title={file.name}>
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-destructive">
                {file.reason}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileDropzone, formatBytes }
