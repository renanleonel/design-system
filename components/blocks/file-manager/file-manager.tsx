"use client"

import * as React from "react"
import { cn } from "cn"
import { toast } from "sonner"

import { useControllableState } from "@/hooks/use-controllable-state"
import { useIsTouch } from "@/hooks/use-media-query"

import { FileList } from "./file-list"
import {
  useContextTargets,
  useEntryActions,
  useExpandedFolders,
  useFolderParams,
  useFolderSelection,
  useListHandlers,
  useUploads,
} from "./file-manager-hooks"
import {
  DeleteDialog,
  EmptyFolder,
  FolderSheet,
  ItemMenu,
  MoveDialog,
  NO_IDS,
  Sidebar,
  PathBar,
  Toolbar,
  UploadDialog,
  plural,
} from "./file-manager-parts"
import {
  ROOT_ID,
  folderTree,
  indexEntries,
  pathTo,
  sortEntries,
  type FileEntry,
} from "./file-utils"

export type { FileEntry } from "./file-utils"

export type UploadFn = (
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal
) => Promise<void>

/** Demo uploader: climbs to 100% in about two seconds; names containing "error" fail. */
export const simulateUpload: UploadFn = (file, onProgress, signal) =>
  new Promise((resolve, reject) => {
    let percent = 0
    const tick = () => {
      if (signal.aborted) return reject(new Error("Cancelled"))
      percent = Math.min(100, percent + 6 + Math.round(Math.random() * 12))
      onProgress(percent)
      if (/error/i.test(file.name) && percent > 40)
        return reject(new Error("The connection dropped. Try again."))
      if (percent >= 100) return resolve()
      setTimeout(tick, 140)
    }
    setTimeout(tick, 140)
  })

const NO_ENTRIES: FileEntry[] = []

export type FileManagerProps = {
  /** The files, when the parent owns them. Pair with `onFilesChange`. */
  files?: FileEntry[]
  /** The files to start with when `files` is left out. */
  defaultFiles?: FileEntry[]
  /** Called with the next list after every rename, move, delete or upload. */
  onFilesChange?: (files: FileEntry[]) => void
  /** Bytes the plan allows. */
  storageTotal: number
  /** Bytes used by things outside `files` (backups, other drives). */
  storageOther?: number
  rootLabel?: string
  /** The folder to show when the URL has none. */
  initialFolder?: string
  upload?: UploadFn
  onRename?: (entry: FileEntry, name: string) => void | Promise<void>
  onMove?: (entries: FileEntry[], to: string | null) => void | Promise<void>
  onDelete?: (entries: FileEntry[]) => void | Promise<void>
  onDownload?: (entries: FileEntry[]) => void
  onOpenFile?: (entry: FileEntry) => void
  onUploaded?: (entry: FileEntry) => void
  className?: string
}

/**
 * A file browser: folder tree, breadcrumb path, grid and list views, multi
 * select (click, Shift, Ctrl/Cmd, or the keyboard), a context menu (open,
 * rename, move, download, delete), uploads with progress and a storage meter.
 * Folder, view and sort live in the URL (`?folder=&view=&sort=&dir=`). Below
 * the `3xl` container width the tree moves into a sheet.
 *
 * It keeps its own copy of the files (seeded from `defaultFiles`, or driven by
 * `files` + `onFilesChange`) and reports every change through the callbacks; a
 * callback that throws or rejects rolls that change back.
 */
export function FileManager({
  files,
  defaultFiles = NO_ENTRIES,
  onFilesChange,
  storageTotal,
  storageOther = 0,
  rootLabel = "My files",
  initialFolder,
  upload = simulateUpload,
  onRename,
  onMove,
  onDelete,
  onDownload,
  onOpenFile,
  onUploaded,
  className,
}: FileManagerProps) {
  const baseId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  // The button that opened a dialog is gone once the selection clears, so the
  // keyboard goes back to the list after a move or delete.
  const focusList = () =>
    setTimeout(
      () =>
        rootRef.current
          ?.querySelector<HTMLElement>("[role=listbox]")
          ?.focus({ preventScroll: true }),
      60
    )
  const touch = useIsTouch()
  const [entries, setEntries] = useControllableState({
    value: files,
    defaultValue: defaultFiles,
    onChange: onFilesChange,
  })
  const index = React.useMemo(() => indexEntries(entries), [entries])

  const {
    folderId,
    setFolder,
    view,
    setView,
    sort,
    setSortParam,
    dir,
    toggleDir,
    handleSort,
  } = useFolderParams(index, initialFolder)

  const path = React.useMemo(
    () => (folderId === ROOT_ID ? [] : pathTo(index, folderId)),
    [index, folderId]
  )
  const items = React.useMemo(
    () => sortEntries(index.children.get(folderId) ?? [], sort, dir),
    [index, folderId, sort, dir]
  )
  const folderName = path.at(-1)?.name ?? rootLabel

  const [expanded, setExpanded] = useExpandedFolders(
    folderId,
    path.slice(0, -1).map((e) => e.id)
  )
  const nodes = React.useMemo(
    () => folderTree(index, rootLabel),
    [index, rootLabel]
  )

  const { sel, setSel, activeId, selectedEntries } = useFolderSelection(
    folderId,
    index,
    items
  )

  const [renamingId, setRenamingId] = React.useState<string | null>(null)
  const [treeOpen, setTreeOpen] = React.useState(false)
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState<FileEntry[] | null>(null)
  const [moving, setMoving] = React.useState<FileEntry[] | null>(null)
  const [moveTo, setMoveTo] = React.useState<string>(ROOT_ID)
  const [announce, setAnnounce] = React.useState("")

  const used = React.useMemo(
    () => entries.reduce((sum, e) => sum + (e.size ?? 0), storageOther),
    [entries, storageOther]
  )
  const ratio = storageTotal ? used / storageTotal : 0
  const tone = ratio > 0.9 ? "red" : ratio > 0.7 ? "amber" : "green"

  const parentOf = (id: string) => (id === ROOT_ID ? null : id)

  const go = (id: string) => {
    setFolder(id)
    setTreeOpen(false)
    setRenamingId(null)
    const count = index.children.get(id)?.length ?? 0
    setAnnounce(
      `${id === ROOT_ID ? rootLabel : (index.byId.get(id)?.name ?? "Folder")}, ${plural(count, "item")}`
    )
  }

  const open = (entry: FileEntry) => {
    if (entry.type === "folder") go(entry.id)
    else if (onOpenFile) onOpenFile(entry)
    else
      toast(`Opening “${entry.name}”`, {
        description: "Hook up onOpenFile to preview it.",
      })
  }

  const { menuTargets, onContextItem } = useContextTargets(
    sel,
    setSel,
    selectedEntries
  )

  const startRename = (entry: FileEntry) => {
    setSel({ ids: new Set([entry.id]), anchor: entry.id, active: entry.id })
    setRenamingId(entry.id)
  }

  const { validateName, rename, remove, move, download } = useEntryActions({
    index,
    rootLabel,
    setEntries,
    onRename,
    onMove,
    onDelete,
    onDownload,
    onRenamed: () => setRenamingId(null),
    onRemoved: () => {
      setSel({ ids: NO_IDS, anchor: null, active: null })
      setDeleting(null)
      focusList()
    },
    onMoved: () => {
      setSel({ ids: NO_IDS, anchor: null, active: null })
      setMoving(null)
      focusList()
    },
  })

  const openMove = (list: FileEntry[]) => {
    setMoveTo(folderId)
    setMoving(list)
  }

  const { uploads, startUploads } = useUploads({
    upload,
    parentId: parentOf(folderId),
    onAdded: (entry) => setEntries((prev) => [...prev, entry]),
    onUploaded,
  })

  const { onItemClick, onKey } = useListHandlers({
    items,
    sel,
    setSel,
    activeId,
    selectedEntries,
    renamingId,
    touch,
    path,
    stopRenaming: () => setRenamingId(null),
    open,
    go,
    startRename,
    askDelete: setDeleting,
  })

  const sidebar = (
    <Sidebar
      nodes={nodes}
      value={folderId}
      expanded={expanded}
      onExpandedChange={setExpanded}
      onSelect={go}
      used={used}
      total={storageTotal}
      tone={tone}
    />
  )

  return (
    <div
      ref={rootRef}
      data-slot="file-manager"
      className={cn(
        "@container/files flex h-full min-h-0 overflow-hidden bg-background",
        className
      )}
    >
      <aside
        aria-label="Folders"
        className="hidden w-64 shrink-0 flex-col border-e @3xl/files:flex"
      >
        {sidebar}
      </aside>

      <FolderSheet open={treeOpen} onOpenChange={setTreeOpen}>
        {sidebar}
      </FolderSheet>

      <section aria-label="Files" className="flex min-w-0 flex-1 flex-col">
        <PathBar
          path={path}
          rootLabel={rootLabel}
          onGo={go}
          onShowFolders={() => setTreeOpen(true)}
          onUpload={() => setUploadOpen(true)}
        />

        <Toolbar
          selected={selectedEntries}
          itemCount={items.length}
          view={view}
          sort={sort}
          dir={dir}
          onDownload={download}
          onMove={openMove}
          onDelete={setDeleting}
          onClear={() => setSel({ ids: NO_IDS, anchor: null })}
          onSortChange={setSortParam}
          onToggleDir={toggleDir}
          onViewChange={setView}
        />

        {items.length === 0 ? (
          <EmptyFolder
            folderName={folderName}
            onUpload={() => setUploadOpen(true)}
          />
        ) : (
          <FileList
            // A new view or folder starts at the top with fresh measurements.
            key={`${view}-${folderId}`}
            items={items}
            view={view}
            baseId={baseId}
            selected={sel.ids}
            activeId={activeId}
            renamingId={renamingId}
            childCount={(id) => index.children.get(id)?.length ?? 0}
            sort={sort}
            dir={dir}
            onSort={handleSort}
            onItemClick={onItemClick}
            onItemOpen={open}
            onContextItem={onContextItem}
            onKey={onKey}
            onRenamed={rename}
            onRenameCancel={() => setRenamingId(null)}
            validateName={validateName}
            label={`Contents of ${folderName}`}
            menu={
              <ItemMenu
                targets={menuTargets}
                onUpload={() => setUploadOpen(true)}
                onOpen={open}
                onRename={startRename}
                onMove={openMove}
                onDownload={download}
                onDelete={setDeleting}
              />
            }
          />
        )}
        <p role="status" className="sr-only">
          {announce}
        </p>
      </section>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderName={folderName}
        uploads={uploads}
        onFiles={startUploads}
      />

      <DeleteDialog
        entries={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      />

      <MoveDialog
        entries={moving}
        index={index}
        rootLabel={rootLabel}
        value={moveTo}
        onValueChange={setMoveTo}
        current={folderId}
        onClose={() => setMoving(null)}
        onMove={move}
      />
    </div>
  )
}
