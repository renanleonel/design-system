"use client"

import * as React from "react"
import { cn } from "cn"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DownloadIcon,
  FolderInputIcon,
  FolderOpenIcon,
  FolderTreeIcon,
  LayoutGridIcon,
  ListIcon,
  PencilIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileDropzone } from "@/components/ui/file-dropzone"
import { Meter, MeterLabel, MeterValue } from "@/components/ui/meter"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tree } from "@/components/ui/tree"

import {
  ROOT_ID,
  folderTree,
  formatBytes,
  indexEntries,
  subtreeIds,
  type FileEntry,
} from "./file-utils"

export type Upload = {
  id: string
  name: string
  percent: number
  status: "uploading" | "done" | "error"
  error?: string
}

export const NO_IDS: ReadonlySet<string> = new Set()
export const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`

export const SORTS = [
  { value: "name", label: "Name" },
  { value: "modified", label: "Modified" },
  { value: "size", label: "Size" },
]

const NO_FILES: File[] = []

export function Crumbs({
  path,
  rootLabel,
  onGo,
}: {
  path: { id: string; name: string }[]
  rootLabel: string
  onGo: (id: string) => void
}) {
  const crumbs = [{ id: ROOT_ID, name: rootLabel }, ...path]
  const collapsed = crumbs.length > 4
  const shown = collapsed ? [crumbs[0], ...crumbs.slice(-2)] : crumbs
  const hidden = collapsed ? crumbs.slice(1, -2) : []
  return (
    <Breadcrumb className="order-last w-full min-w-0 @xl/files:order-none @xl/files:w-auto @xl/files:flex-1">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {shown.map((c, i) => (
          <React.Fragment key={c.id}>
            {i > 0 && <BreadcrumbSeparator />}
            {collapsed && i === 1 && (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="xs"
                          aria-label={`Show ${plural(hidden.length, "hidden folder")}`}
                        />
                      }
                    >
                      …
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {hidden.map((h) => (
                        <DropdownMenuItem key={h.id} onClick={() => onGo(h.id)}>
                          <span className="truncate" title={h.name}>
                            {h.name}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem className="min-w-0">
              {i === shown.length - 1 ? (
                <BreadcrumbPage
                  title={c.name}
                  className="block max-w-40 truncate sm:max-w-64"
                >
                  {c.name}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  title={c.name}
                  render={<button type="button" onClick={() => onGo(c.id)} />}
                  className="block max-w-32 truncate sm:max-w-48"
                >
                  {c.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function Toolbar({
  selected,
  itemCount,
  view,
  sort,
  dir,
  onDownload,
  onMove,
  onDelete,
  onClear,
  onSortChange,
  onToggleDir,
  onViewChange,
}: {
  selected: FileEntry[]
  itemCount: number
  view: "grid" | "list"
  sort: string
  dir: "asc" | "desc"
  onDownload: (entries: FileEntry[]) => void
  onMove: (entries: FileEntry[]) => void
  onDelete: (entries: FileEntry[]) => void
  onClear: () => void
  onSortChange: (sort: string | null) => void
  onToggleDir: () => void
  onViewChange: (view: string | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b px-4 pb-2">
      {selected.length > 0 ? (
        <>
          <p role="status" className="me-auto text-sm font-medium tabular-nums">
            {selected.length} selected
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(selected)}
          >
            <DownloadIcon data-icon="inline-start" />
            Download
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onMove(selected)}>
            <FolderInputIcon data-icon="inline-start" />
            Move
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onDelete(selected)}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear selection"
            onClick={onClear}
          >
            <XIcon />
          </Button>
        </>
      ) : (
        <>
          <p className="me-auto min-w-0 truncate text-sm text-muted-foreground tabular-nums">
            {plural(itemCount, "item")}
          </p>
          {view === "grid" && (
            <>
              {/* Fixed width: on touch the native picker replaces the trigger
                  after hydration, and must take the same space (no shift). */}
              <div className="w-32 shrink-0">
                <Select
                  items={SORTS}
                  // Names the native picker on touch, where the trigger isn't rendered.
                  aria-label="Sort by"
                  value={sort}
                  onValueChange={(v) =>
                    v && onSortChange(String(v) === "name" ? null : String(v))
                  }
                >
                  <SelectTrigger aria-label="Sort by" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label={
                  dir === "asc"
                    ? "Ascending, switch to descending"
                    : "Descending, switch to ascending"
                }
                onClick={onToggleDir}
              >
                {dir === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </Button>
            </>
          )}
        </>
      )}
      <ToggleGroup
        value={[view]}
        onValueChange={(v) =>
          v[0] && onViewChange(v[0] === "grid" ? null : v[0])
        }
        aria-label="View"
      >
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <LayoutGridIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view">
          <ListIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export function ItemMenu({
  targets,
  onUpload,
  onOpen,
  onRename,
  onMove,
  onDownload,
  onDelete,
}: {
  targets: FileEntry[]
  onUpload: () => void
  onOpen: (entry: FileEntry) => void
  onRename: (entry: FileEntry) => void
  onMove: (entries: FileEntry[]) => void
  onDownload: (entries: FileEntry[]) => void
  onDelete: (entries: FileEntry[]) => void
}) {
  return (
    <ContextMenuContent finalFocus={false} className="min-w-48">
      {targets.length === 0 ? (
        <ContextMenuItem onClick={onUpload}>
          <UploadIcon />
          Upload files
        </ContextMenuItem>
      ) : (
        <>
          <ContextMenuItem
            disabled={targets.length !== 1}
            onClick={() => onOpen(targets[0])}
          >
            <FolderOpenIcon />
            Open
            <ContextMenuShortcut>Enter</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={targets.length !== 1}
            onClick={() => onRename(targets[0])}
          >
            <PencilIcon />
            Rename
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onMove(targets)}>
            <FolderInputIcon />
            Move to…
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDownload(targets)}>
            <DownloadIcon />
            Download
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onClick={() => onDelete(targets)}
          >
            <Trash2Icon />
            Delete
            <ContextMenuShortcut>Del</ContextMenuShortcut>
          </ContextMenuItem>
        </>
      )}
    </ContextMenuContent>
  )
}

export function UploadDialog({
  open,
  onOpenChange,
  folderName,
  uploads,
  onFiles,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderName: string
  uploads: Upload[]
  onFiles: (files: File[]) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription className="wrap-anywhere">
            They go to {folderName}.
          </DialogDescription>
        </DialogHeader>
        <FileDropzone
          value={NO_FILES}
          onValueChange={onFiles}
          maxSize={2 * 1024 ** 3}
          hint="Any file, up to 2 GB"
        />
        {uploads.length > 0 && (
          <ul className="flex max-h-56 flex-col gap-3 overflow-y-auto">
            {uploads.map((u) => (
              <li key={u.id} className="min-w-0">
                <Progress
                  value={u.percent}
                  className={cn(
                    "gap-x-3 gap-y-1.5",
                    u.status === "error" &&
                      "[&_[data-slot=progress-indicator]]:bg-destructive"
                  )}
                >
                  <ProgressLabel
                    className="min-w-0 flex-1 truncate"
                    title={u.name}
                  >
                    {u.name}
                  </ProgressLabel>
                  <ProgressValue>
                    {() =>
                      u.status === "done"
                        ? "Done"
                        : u.status === "error"
                          ? "Failed"
                          : `${u.percent}%`
                    }
                  </ProgressValue>
                </Progress>
                {u.error && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {u.error}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {uploads.some((u) => u.status === "uploading") ? "Hide" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteDialog({
  entries,
  onClose,
  onConfirm,
}: {
  entries: FileEntry[] | null
  onClose: () => void
  onConfirm: (entries: FileEntry[]) => void
}) {
  return (
    <AlertDialog open={entries !== null} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {entries ? plural(entries.length, "item") : ""}?
          </AlertDialogTitle>
          <AlertDialogDescription className="wrap-anywhere">
            {entries?.length === 1 ? `“${entries[0].name}” ` : "These items "}
            {entries?.some((d) => d.type === "folder")
              ? "and everything inside "
              : ""}
            will be removed for good. You can’t undo this.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => entries && onConfirm(entries)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function Sidebar({
  nodes,
  value,
  expanded,
  onExpandedChange,
  onSelect,
  used,
  total,
  tone,
}: {
  nodes: ReturnType<typeof folderTree>
  value: string
  expanded: string[]
  onExpandedChange: (ids: string[]) => void
  onSelect: (id: string) => void
  used: number
  total: number
  tone: "green" | "amber" | "red"
}) {
  const treeRef = React.useRef<HTMLDivElement>(null)
  // The tree only mounts rows near its scroll position; bring the open folder into view.
  React.useEffect(() => {
    treeRef.current
      ?.querySelector('[role="treeitem"][aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" })
  }, [value])
  return (
    <>
      <Tree
        aria-label="Folders"
        ref={treeRef}
        nodes={nodes}
        value={value}
        onValueChange={(id) => onSelect(id)}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
        // Indent stops at 5 levels, so a 15-deep path keeps readable labels.
        className="min-h-0 flex-1 p-2 [&_[role=treeitem]]:ps-[calc(min(var(--depth),5)*--spacing(4)+--spacing(1))]!"
      />
      <div className="border-t p-4">
        <Meter
          value={Math.min(used, total)}
          min={0}
          max={total}
          tone={tone}
          aria-label="Storage used"
        >
          <MeterLabel>Storage</MeterLabel>
          <MeterValue>
            {() => `${formatBytes(used)} of ${formatBytes(total)}`}
          </MeterValue>
        </Meter>
        {used > total && (
          <p role="alert" className="mt-2 text-xs text-destructive">
            Over your limit. Delete files or upgrade.
          </p>
        )}
      </div>
    </>
  )
}

export function MoveDialog({
  entries,
  index,
  rootLabel,
  value,
  onValueChange,
  current,
  onClose,
  onMove,
}: {
  entries: FileEntry[] | null
  index: ReturnType<typeof indexEntries>
  rootLabel: string
  value: string
  onValueChange: (id: string) => void
  current: string
  onClose: () => void
  onMove: (entries: FileEntry[], to: string) => void
}) {
  const nodes = React.useMemo(() => {
    const blocked = new Set<string>()
    for (const e of entries ?? [])
      if (e.type === "folder")
        for (const id of subtreeIds(index, e.id)) blocked.add(id)
    return folderTree(index, rootLabel, blocked)
  }, [entries, index, rootLabel])
  const [expanded, setExpanded] = React.useState([ROOT_ID])
  return (
    <Dialog open={entries !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Move {entries ? plural(entries.length, "item") : ""} to…
          </DialogTitle>
          <DialogDescription>Pick the destination folder.</DialogDescription>
        </DialogHeader>
        <div className="h-72 overflow-hidden rounded-lg shadow-border">
          <Tree
            aria-label="Destination folder"
            nodes={nodes}
            value={value}
            onValueChange={onValueChange}
            expanded={expanded}
            onExpandedChange={setExpanded}
            className="h-full p-1"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={value === current}
            onClick={() => entries && onMove(entries, value)}
          >
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function EmptyFolder({
  folderName,
  onUpload,
}: {
  folderName: string
  onUpload: () => void
}) {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>This folder is empty</EmptyTitle>
        <EmptyDescription>
          Drop files here or upload them to {folderName}.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onUpload}>
          <UploadIcon data-icon="inline-start" />
          Upload files
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export function PathBar({
  path,
  rootLabel,
  onGo,
  onShowFolders,
  onUpload,
}: {
  path: { id: string; name: string }[]
  rootLabel: string
  onGo: (id: string) => void
  onShowFolders: () => void
  onUpload: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Show folders"
        className="@3xl/files:hidden"
        onClick={onShowFolders}
      >
        <FolderTreeIcon />
      </Button>
      <Crumbs path={path} rootLabel={rootLabel} onGo={onGo} />
      <Button className="ms-auto @xl/files:ms-0" onClick={onUpload}>
        <UploadIcon data-icon="inline-start" />
        Upload
      </Button>
    </div>
  )
}

export function FolderSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="inline-start" className="gap-0 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Folders</SheetTitle>
          <SheetDescription className="sr-only">
            Pick a folder to open
          </SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
