import * as React from "react"
import {
  FileArchiveIcon,
  FileCodeIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  MusicIcon,
  PresentationIcon,
  VideoIcon,
} from "lucide-react"

import type { TreeNode } from "@/components/ui/tree"
import type { iconTileVariants } from "@/components/ui/icon-tile"
import type { VariantProps } from "class-variance-authority"

export const ROOT_ID = "root"

export type FileEntry = {
  id: string
  name: string
  parentId: string | null
  type: "folder" | "file"
  size?: number
  modified: string
}

export type SortKey = "name" | "modified" | "size"
export type SortDir = "asc" | "desc"

type Tone = VariantProps<typeof iconTileVariants>["tone"]

const BY_EXT: Record<string, [React.ReactElement, Tone, string]> = {}
function register(
  exts: string,
  icon: React.ReactElement,
  tone: Tone,
  label: string
) {
  for (const ext of exts.split(" ")) BY_EXT[ext] = [icon, tone, label]
}
register(
  "png jpg jpeg gif webp svg heic avif",
  <ImageIcon />,
  "purple",
  "Image"
)
register("mp4 mov webm mkv avi", <VideoIcon />, "red", "Video")
register("mp3 wav flac ogg m4a", <MusicIcon />, "orange", "Audio")
register("pdf doc docx txt md rtf odt", <FileTextIcon />, "blue", "Document")
register("xls xlsx csv ods", <FileSpreadsheetIcon />, "green", "Spreadsheet")
register("ppt pptx key", <PresentationIcon />, "amber", "Presentation")
register("zip rar 7z tar gz", <FileArchiveIcon />, "gray", "Archive")
register("ts tsx js json html css py sh", <FileCodeIcon />, "gray", "Code")

export function describe(entry: Pick<FileEntry, "name" | "type">) {
  if (entry.type === "folder")
    return { icon: <FolderIcon />, tone: "amber" as Tone, kind: "Folder" }
  const ext = entry.name.split(".").pop()?.toLowerCase() ?? ""
  const hit = BY_EXT[ext]
  return hit
    ? { icon: hit[0], tone: hit[1], kind: hit[2] }
    : { icon: <FileIcon />, tone: "neutral" as Tone, kind: "File" }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`
}

// Fixed locale and zone, so server and browser render the same text.
const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})
export const formatDate = (iso: string) => DATE.format(new Date(iso))

const COLLATOR = new Intl.Collator("pt-BR", {
  numeric: true,
  sensitivity: "base",
})

export function sortEntries(
  entries: FileEntry[],
  key: SortKey,
  dir: SortDir
): FileEntry[] {
  const sign = dir === "asc" ? 1 : -1
  return [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1
    let diff = 0
    if (key === "modified") diff = a.modified.localeCompare(b.modified)
    else if (key === "size") diff = (a.size ?? 0) - (b.size ?? 0)
    return diff
      ? diff * sign
      : COLLATOR.compare(a.name, b.name) * (key === "name" ? sign : 1)
  })
}

export type FileIndex = {
  byId: Map<string, FileEntry>
  children: Map<string, FileEntry[]>
}

export function indexEntries(entries: FileEntry[]): FileIndex {
  const byId = new Map<string, FileEntry>()
  const children = new Map<string, FileEntry[]>()
  for (const e of entries) {
    byId.set(e.id, e)
    const key = e.parentId ?? ROOT_ID
    const list = children.get(key)
    if (list) list.push(e)
    else children.set(key, [e])
  }
  return { byId, children }
}

export function pathTo(index: FileIndex, id: string) {
  const path: FileEntry[] = []
  let at = index.byId.get(id)
  // The bound guards a corrupt cycle.
  for (let i = 0; at && i < 100; i++) {
    path.unshift(at)
    at = at.parentId ? index.byId.get(at.parentId) : undefined
  }
  return path
}

export function subtreeIds(index: FileIndex, id: string) {
  const out = new Set<string>()
  const stack = [id]
  while (stack.length) {
    const next = stack.pop()!
    if (out.has(next)) continue
    out.add(next)
    for (const c of index.children.get(next) ?? []) stack.push(c.id)
  }
  return out
}

export function folderTree(
  index: FileIndex,
  rootLabel: string,
  exclude?: Set<string>
): TreeNode[] {
  const build = (parent: string): TreeNode[] =>
    (index.children.get(parent) ?? [])
      .filter((e) => e.type === "folder" && !exclude?.has(e.id))
      .sort((a, b) => COLLATOR.compare(a.name, b.name))
      .map((e) => {
        const kids = build(e.id)
        return {
          id: e.id,
          label: e.name,
          icon: <FolderIcon />,
          children: kids.length ? kids : undefined,
        }
      })
  const kids = build(ROOT_ID)
  return [
    {
      id: ROOT_ID,
      label: rootLabel,
      icon: <FolderIcon />,
      children: kids.length ? kids : undefined,
    },
  ]
}
