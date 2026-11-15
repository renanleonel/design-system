"use client"

import * as React from "react"

import { toast } from "sonner"

import { useUrlState } from "@/hooks/use-url-state"

import type { ListKey } from "./file-list"
import { NO_IDS, SORTS, plural, type Upload } from "./file-manager-parts"
import {
  ROOT_ID,
  subtreeIds,
  type FileEntry,
  type indexEntries,
  type SortDir,
  type SortKey,
} from "./file-utils"

export type Selection = {
  folder: string
  ids: ReadonlySet<string>
  anchor: string | null
  active: string | null
}

export type SetSelection = (patch: Partial<Omit<Selection, "folder">>) => void

export function useFolderParams(
  index: ReturnType<typeof indexEntries>,
  initialFolder: string | undefined
) {
  const [folderParam, setFolder] = useUrlState(
    "folder",
    initialFolder ?? ROOT_ID,
    "push"
  )
  const folderId =
    folderParam === ROOT_ID || index.byId.get(folderParam)?.type === "folder"
      ? folderParam
      : ROOT_ID
  const [viewParam, setView] = useUrlState("view", "grid")
  const view: "grid" | "list" = viewParam === "list" ? "list" : "grid"
  const [sortParam, setSortParam] = useUrlState("sort", "name")
  const sort = (
    SORTS.some((s) => s.value === sortParam) ? sortParam : "name"
  ) as SortKey
  const [dirParam, setDirParam] = useUrlState("dir", "asc")
  const dir: SortDir = dirParam === "desc" ? "desc" : "asc"

  const toggleDir = () => setDirParam(dir === "asc" ? "desc" : "asc")
  const handleSort = (key: SortKey) => {
    if (key === sort) toggleDir()
    else {
      setSortParam(key)
      setDirParam(key === "name" ? "asc" : "desc")
    }
  }
  return {
    folderId,
    setFolder,
    view,
    setView,
    sort,
    setSortParam,
    dir,
    toggleDir,
    handleSort,
  }
}

export function useExpandedFolders(folderId: string, ancestors: string[]) {
  const [expanded, setExpanded] = React.useState(() => [ROOT_ID, ...ancestors])
  const [seenFolder, setSeenFolder] = React.useState(folderId)
  if (seenFolder !== folderId) {
    setSeenFolder(folderId)
    setExpanded((prev) => [...new Set([...prev, ROOT_ID, ...ancestors])])
  }
  return [expanded, setExpanded] as const
}

let nextUploadId = 0

export function useUploads({
  upload,
  parentId,
  onAdded,
  onUploaded,
}: {
  upload: (
    file: File,
    onProgress: (percent: number) => void,
    signal: AbortSignal
  ) => Promise<void>
  parentId: string | null
  onAdded: (entry: FileEntry) => void
  onUploaded?: (entry: FileEntry) => void
}) {
  const [uploads, setUploads] = React.useState<Upload[]>([])

  const startUploads = (picked: File[]) => {
    for (const file of picked) {
      const id = `up-${nextUploadId++}`
      const controller = new AbortController()
      const patch = (p: Partial<Upload>) =>
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, ...p } : u))
        )
      setUploads((prev) => [
        { id, name: file.name, percent: 0, status: "uploading" },
        ...prev,
      ])
      upload(file, (percent) => patch({ percent }), controller.signal).then(
        () => {
          patch({ percent: 100, status: "done" })
          const entry: FileEntry = {
            id: `new-${id}`,
            name: file.name,
            parentId,
            type: "file",
            size: file.size,
            modified: new Date().toISOString(),
          }
          onAdded(entry)
          onUploaded?.(entry)
        },
        (error: unknown) =>
          patch({
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed.",
          })
      )
    }
  }
  return { uploads, startUploads }
}

export function useListHandlers({
  items,
  sel,
  setSel,
  activeId,
  selectedEntries,
  renamingId,
  touch,
  path,
  stopRenaming,
  open,
  go,
  startRename,
  askDelete,
}: {
  items: FileEntry[]
  sel: Selection
  setSel: SetSelection
  activeId: string | null
  selectedEntries: FileEntry[]
  renamingId: string | null
  touch: boolean
  path: FileEntry[]
  stopRenaming: () => void
  open: (entry: FileEntry) => void
  go: (id: string) => void
  startRename: (entry: FileEntry) => void
  askDelete: (entries: FileEntry[]) => void
}) {
  const rangeIds = (from: string | null, to: string) => {
    const a = from ? items.findIndex((e) => e.id === from) : -1
    const b = items.findIndex((e) => e.id === to)
    if (a < 0 || b < 0) return [to]
    return items.slice(Math.min(a, b), Math.max(a, b) + 1).map((e) => e.id)
  }

  const onItemClick = (entry: FileEntry, e: React.MouseEvent) => {
    if (renamingId) stopRenaming()
    // Click focus: a click on an item leaves the keyboard on the list.
    ;(e.currentTarget as HTMLElement)
      .closest<HTMLElement>("[role=listbox]")
      ?.focus({ preventScroll: true })
    if (e.shiftKey) {
      const range = rangeIds(sel.anchor ?? activeId, entry.id)
      setSel({
        ids: new Set(e.ctrlKey || e.metaKey ? [...sel.ids, ...range] : range),
        anchor: sel.anchor ?? activeId,
        active: entry.id,
      })
    } else if (e.ctrlKey || e.metaKey || (touch && sel.ids.size > 0)) {
      const ids = new Set(sel.ids)
      if (!ids.delete(entry.id)) ids.add(entry.id)
      setSel({ ids, anchor: entry.id, active: entry.id })
    } else if (touch) {
      open(entry)
    } else {
      setSel({ ids: new Set([entry.id]), anchor: entry.id, active: entry.id })
    }
  }

  const onKey = (key: ListKey) => {
    const cur = items.find((e) => e.id === activeId)
    switch (key.type) {
      case "move": {
        const to = items[key.to]
        if (!to) return
        if (key.extend) {
          const anchor = sel.anchor ?? activeId
          setSel({
            ids: new Set(rangeIds(anchor, to.id)),
            anchor,
            active: to.id,
          })
        } else if (key.keepSelection) setSel({ active: to.id })
        else setSel({ ids: new Set([to.id]), anchor: to.id, active: to.id })
        return
      }
      case "toggle": {
        if (!cur) return
        const ids = new Set(sel.ids)
        if (!ids.delete(cur.id)) ids.add(cur.id)
        setSel({ ids, anchor: cur.id })
        return
      }
      case "all":
        setSel({ ids: new Set(items.map((e) => e.id)) })
        return
      case "clear":
        setSel({ ids: NO_IDS, anchor: null })
        return
      case "open":
        if (selectedEntries.length > 1) return
        if (cur) open(cur)
        return
      case "rename": {
        const target = selectedEntries.length === 1 ? selectedEntries[0] : cur
        if (target) startRename(target)
        return
      }
      case "delete": {
        const targets = selectedEntries.length
          ? selectedEntries
          : cur
            ? [cur]
            : []
        if (targets.length) askDelete(targets)
        return
      }
      case "parent":
        if (path.length)
          go(path.length > 1 ? path[path.length - 2].id : ROOT_ID)
        return
    }
  }

  return { onItemClick, onKey }
}

export function useFolderSelection(
  folderId: string,
  index: ReturnType<typeof indexEntries>,
  items: FileEntry[]
) {
  const [selState, setSelState] = React.useState<Selection>({
    folder: folderId,
    ids: NO_IDS,
    anchor: null,
    active: null,
  })
  const sel: Selection =
    selState.folder === folderId
      ? selState
      : { folder: folderId, ids: NO_IDS, anchor: null, active: null }
  const setSel: SetSelection = (patch) =>
    setSelState({ ...sel, ...patch, folder: folderId })
  const activeId =
    sel.active &&
    index.byId.get(sel.active)?.parentId ===
      (folderId === ROOT_ID ? null : folderId)
      ? sel.active
      : (items[0]?.id ?? null)
  const selectedEntries = React.useMemo(
    () => items.filter((e) => sel.ids.has(e.id)),
    [items, sel.ids]
  )
  return { sel, setSel, activeId, selectedEntries }
}

export function useEntryActions({
  index,
  rootLabel,
  setEntries,
  onRename,
  onMove,
  onDelete,
  onDownload,
  onRenamed,
  onRemoved,
  onMoved,
}: {
  index: ReturnType<typeof indexEntries>
  rootLabel: string
  setEntries: (update: (prev: FileEntry[]) => FileEntry[]) => void
  onRename?: (entry: FileEntry, name: string) => void | Promise<void>
  onMove?: (entries: FileEntry[], to: string | null) => void | Promise<void>
  onDelete?: (entries: FileEntry[]) => void | Promise<void>
  onDownload?: (entries: FileEntry[]) => void
  onRenamed: () => void
  onRemoved: () => void
  onMoved: () => void
}) {
  const validateName = (entry: FileEntry, name: string) => {
    const next = name.trim()
    if (!next) return "Enter a name."
    if (/[\\/]/.test(next)) return "Names can’t contain / or \\."
    const clash = (index.children.get(entry.parentId ?? ROOT_ID) ?? []).some(
      (e) => e.id !== entry.id && e.name.toLowerCase() === next.toLowerCase()
    )
    return clash ? `“${next}” already exists in this folder.` : undefined
  }

  const rename = async (entry: FileEntry, name: string) => {
    const next = name.trim()
    await onRename?.(entry, next)
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, name: next } : e))
    )
    onRenamed()
  }

  const remove = async (targets: FileEntry[]) => {
    try {
      await onDelete?.(targets)
    } catch {
      toast.error("Couldn’t delete. Nothing was removed.")
      return
    }
    const gone = new Set<string>()
    for (const t of targets)
      for (const id of subtreeIds(index, t.id)) gone.add(id)
    setEntries((prev) => prev.filter((e) => !gone.has(e.id)))
    onRemoved()
    toast.success(`Deleted ${plural(targets.length, "item")}`)
  }

  const move = async (targets: FileEntry[], to: string) => {
    const parent = to === ROOT_ID ? null : to
    try {
      await onMove?.(targets, parent)
    } catch {
      toast.error("Couldn’t move. Nothing changed.")
      return
    }
    const ids = new Set(targets.map((t) => t.id))
    setEntries((prev) =>
      prev.map((e) => (ids.has(e.id) ? { ...e, parentId: parent } : e))
    )
    onMoved()
    toast.success(
      `Moved ${plural(targets.length, "item")} to ${to === ROOT_ID ? rootLabel : (index.byId.get(to)?.name ?? "folder")}`
    )
  }

  const download = (targets: FileEntry[]) => {
    if (onDownload) return onDownload(targets)
    toast.success(`Preparing ${plural(targets.length, "download")}`, {
      description: "Hook up onDownload to save the files.",
    })
  }

  return { validateName, rename, remove, move, download }
}

export function useContextTargets(
  sel: Selection,
  setSel: SetSelection,
  selectedEntries: FileEntry[]
) {
  const [menuTargets, setMenuTargets] = React.useState<FileEntry[]>([])
  const onContextItem = (entry: FileEntry | null) => {
    if (!entry) {
      setMenuTargets([])
      return
    }
    if (sel.ids.has(entry.id)) setMenuTargets(selectedEntries)
    else {
      setSel({ ids: new Set([entry.id]), anchor: entry.id, active: entry.id })
      setMenuTargets([entry])
    }
  }
  return { menuTargets, onContextItem }
}
