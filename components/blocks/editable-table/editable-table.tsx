"use client"

import * as React from "react"
import { cn } from "cn"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type CellValue = string | number

export type CellEditor =
  | { type: "text"; placeholder?: string }
  | { type: "number"; min?: number; max?: number }
  | { type: "select"; options: { value: string; label: string }[] }

export type EditableColumn<Row> = {
  id: string
  header: string
  value: (row: Row) => CellValue
  /** How the cell edits; leave out for a read-only column. */
  editor?: CellEditor
  /** Display; defaults to the value as text. */
  render?: (value: CellValue, row: Row) => React.ReactNode
  /** Runs before saving; return a message to keep the old value. */
  validate?: (value: CellValue, row: Row) => string | undefined
  align?: "start" | "end"
  /** Width and other classes for the column's cells, e.g. `w-40`. */
  className?: string
}

export type CellChange<Row> = {
  row: Row
  rowId: string
  columnId: string
  value: CellValue
  previous: CellValue
}

type Pending = { value: CellValue }
type Pos = { r: number; c: number }

const keyOf = (rowId: string, columnId: string) => `${rowId}\u0000${columnId}`

function parse(
  editor: CellEditor,
  text: string
): CellValue | { error: string } {
  if (editor.type !== "number") return text.trim()
  const n = Number(text.replace(/[^\d.,-]/g, "").replace(",", "."))
  if (!text.trim() || Number.isNaN(n)) return { error: "Enter a number." }
  if (editor.min !== undefined && n < editor.min)
    return { error: `Enter ${editor.min} or more.` }
  if (editor.max !== undefined && n > editor.max)
    return { error: `Enter ${editor.max} or less.` }
  return n
}

/**
 * A grid whose cells edit in place and save one at a time, optimistically.
 *
 * - The new value shows at once with a spinner while `onCommit` runs. Resolve
 *   after your data holds the new value (setState, `setQueryData`); reject to
 *   roll the cell back: it keeps an error ring and a toast offers Retry.
 *   A newer save of the same cell wins over an older one still in flight.
 * - Keyboard (WAI-ARIA data grid): arrows move, Home/End jump in the row,
 *   Enter or F2 or typing edits, Enter saves and moves down, Tab saves and
 *   moves right, Escape cancels. Double-click edits.
 */
export function EditableTable<Row>({
  rows,
  columns,
  getRowId,
  getRowLabel,
  onCommit,
  "aria-label": ariaLabel,
  className,
}: {
  rows: Row[]
  columns: EditableColumn<Row>[]
  getRowId: (row: Row) => string
  /** Names the row in announcements and toasts ("Value for Acme"). */
  getRowLabel: (row: Row) => string
  onCommit: (change: CellChange<Row>) => Promise<void>
  "aria-label": string
  className?: string
}) {
  const [pending, setPending] = React.useState<Map<string, Pending>>(
    () => new Map()
  )
  const [errors, setErrors] = React.useState<Map<string, string>>(
    () => new Map()
  )
  const [active, setActive] = React.useState<Pos>({ r: 0, c: 0 })
  const [editing, setEditing] = React.useState<{
    pos: Pos
    initial: string
    typed: boolean
  } | null>(null)
  const [status, setStatus] = React.useState("")
  const seq = React.useRef(0)
  // The newest save per cell; an older one settling never overwrites it.
  const latest = React.useRef(new Map<string, number>())
  const cells = React.useRef(new Map<string, HTMLTableCellElement>())

  const valueAt = (row: Row, column: EditableColumn<Row>) =>
    pending.get(keyOf(getRowId(row), column.id))?.value ?? column.value(row)

  const focusCell = (pos: Pos) => {
    const r = Math.max(0, Math.min(rows.length - 1, pos.r))
    const c = Math.max(0, Math.min(columns.length - 1, pos.c))
    setActive({ r, c })
    cells.current.get(`${r}:${c}`)?.focus()
  }

  const setError = (key: string, message: string | null) =>
    setErrors((prev) => {
      const next = new Map(prev)
      if (message) next.set(key, message)
      else next.delete(key)
      return next
    })

  const commit = async (
    row: Row,
    column: EditableColumn<Row>,
    value: CellValue
  ) => {
    const rowId = getRowId(row)
    const key = keyOf(rowId, column.id)
    const previous = column.value(row)
    const what = `${column.header} for ${getRowLabel(row)}`
    if (value === valueAt(row, column)) return

    const invalid = column.validate?.(value, row)
    if (invalid) {
      setError(key, invalid)
      setStatus(`${what} not saved: ${invalid}`)
      toast.error(invalid)
      return
    }

    // Optimistic: show the value now, remember which save this is.
    const mine = ++seq.current
    latest.current.set(key, mine)
    setError(key, null)
    setPending((prev) => new Map(prev).set(key, { value }))
    setStatus(`Saving ${what}…`)

    // Drops the optimistic value: on success the row now holds it, on
    // failure this is the rollback.
    const settle = () => {
      latest.current.delete(key)
      setPending((prev) => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
    }

    try {
      await onCommit({ row, rowId, columnId: column.id, value, previous })
      if (latest.current.get(key) !== mine) return // a newer save owns the cell
      settle()
      setStatus(`Saved ${what}.`)
    } catch (error) {
      if (latest.current.get(key) !== mine) return
      settle()
      const message =
        error instanceof Error ? error.message : "Couldn't save the change."
      setError(key, message)
      setStatus(`${what} not saved. ${message}`)
      toast.error(`Couldn't save ${what}`, {
        description: message,
        action: {
          label: "Retry",
          onClick: () => void commit(row, column, value),
        },
      })
    }
  }

  const startEdit = (pos: Pos, initial?: string) => {
    const column = columns[pos.c]
    const row = rows[pos.r]
    if (!column?.editor || !row) return
    setActive(pos)
    setEditing({
      pos,
      initial: initial ?? String(valueAt(row, column)),
      typed: initial !== undefined,
    })
  }

  const finishEdit = (
    text: string | null,
    move: Pos | null,
    { refocus = true }: { refocus?: boolean } = {}
  ) => {
    if (!editing) return
    const { pos } = editing
    const row = rows[pos.r]
    const column = columns[pos.c]
    setEditing(null)
    if (text !== null && row && column.editor) {
      const parsed = parse(column.editor, text)
      if (typeof parsed === "object") {
        const key = keyOf(getRowId(row), column.id)
        setError(key, parsed.error)
        setStatus(
          `${column.header} for ${getRowLabel(row)} not saved: ${parsed.error}`
        )
      } else void commit(row, column, parsed)
    }
    if (refocus) focusCell(move ?? pos)
  }

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    if (editing || e.target instanceof HTMLInputElement) return
    // The focused cell, not `active`: a key can land before focus re-renders.
    const td = (e.target as HTMLElement).closest<HTMLElement>("td[data-r]")
    if (!td) return
    const r = Number(td.dataset.r)
    const c = Number(td.dataset.c)
    const here = { r, c }
    const mod = e.ctrlKey || e.metaKey
    const moves: Record<string, Pos> = {
      ArrowUp: { r: r - 1, c },
      ArrowDown: { r: r + 1, c },
      ArrowLeft: { r, c: c - 1 },
      ArrowRight: { r, c: c + 1 },
      Home: mod ? { r: 0, c: 0 } : { r, c: 0 },
      End: mod
        ? { r: rows.length - 1, c: columns.length - 1 }
        : { r, c: columns.length - 1 },
    }
    if (moves[e.key]) {
      e.preventDefault()
      focusCell(moves[e.key])
      return
    }
    if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault()
      startEdit(here)
      return
    }
    const editor = columns[c]?.editor
    if (
      editor &&
      editor.type !== "select" &&
      e.key.length === 1 &&
      !mod &&
      !e.altKey
    ) {
      // Typing replaces the value, like a spreadsheet.
      e.preventDefault()
      startEdit(here, e.key)
    }
  }

  const saving = pending.size
  const failed = errors.size

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="overflow-hidden rounded-xl bg-card shadow-border">
        <Table
          role="grid"
          aria-label={ariaLabel}
          aria-rowcount={rows.length + 1}
          onKeyDown={onGridKeyDown}
          className="border-separate border-spacing-0"
        >
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "h-9 bg-muted/40 px-3 text-xs text-muted-foreground shadow-[inset_0_-1px_0_var(--border)]",
                    column.align === "end" && "text-end",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, r) => {
              const rowId = getRowId(row)
              return (
                <TableRow key={rowId} className="border-0 hover:bg-transparent">
                  {columns.map((column, c) => {
                    const key = keyOf(rowId, column.id)
                    const value = valueAt(row, column)
                    const isActive = active.r === r && active.c === c
                    const isEditing =
                      editing?.pos.r === r && editing.pos.c === c
                    const isSaving = pending.has(key)
                    const error = errors.get(key)
                    const editable = Boolean(column.editor)
                    return (
                      <TableCell
                        key={column.id}
                        ref={(el) => {
                          if (el) cells.current.set(`${r}:${c}`, el)
                          else cells.current.delete(`${r}:${c}`)
                        }}
                        role="gridcell"
                        tabIndex={isActive && !isEditing ? 0 : -1}
                        aria-readonly={!editable || undefined}
                        aria-busy={isSaving || undefined}
                        aria-invalid={error ? true : undefined}
                        title={error}
                        data-r={r}
                        data-c={c}
                        data-editable={editable || undefined}
                        onFocus={() => {
                          if (!isActive) setActive({ r, c })
                        }}
                        onClick={() => setActive({ r, c })}
                        onDoubleClick={() => startEdit({ r, c })}
                        className={cn(
                          "relative h-10 p-0 shadow-[inset_0_-1px_0_var(--border)] outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ds-focus-ring)",
                          "data-editable:cursor-text data-editable:hover:bg-muted/40",
                          error &&
                            "bg-destructive/5 shadow-[inset_0_0_0_1px_var(--destructive)]",
                          column.className
                        )}
                      >
                        {isEditing && column.editor ? (
                          <CellEditorControl
                            editor={column.editor}
                            label={`${column.header} for ${getRowLabel(row)}`}
                            initial={editing.initial}
                            typed={editing.typed}
                            align={column.align}
                            onDone={finishEdit}
                            pos={{ r, c }}
                          />
                        ) : (
                          <div
                            className={cn(
                              "flex h-10 min-w-0 items-center gap-2 px-3",
                              column.align === "end" && "justify-end"
                            )}
                          >
                            {isSaving && column.align === "end" && (
                              <Spinner
                                aria-label="Saving"
                                className="size-3 text-muted-foreground"
                              />
                            )}
                            <span
                              className={cn(
                                "min-w-0 truncate",
                                column.align === "end" && "tabular-nums"
                              )}
                            >
                              {column.render
                                ? column.render(value, row)
                                : String(value)}
                            </span>
                            {isSaving && column.align !== "end" && (
                              <Spinner
                                aria-label="Saving"
                                className="ms-auto size-3 shrink-0 text-muted-foreground"
                              />
                            )}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <p className="hidden sm:block">
          Enter or type to edit · Enter saves · Esc cancels
        </p>
        <p className="tabular-nums sm:ms-auto">
          {saving > 0
            ? `Saving ${saving} ${saving === 1 ? "change" : "changes"}…`
            : failed > 0
              ? `${failed} ${failed === 1 ? "change" : "changes"} not saved`
              : "All changes saved"}
        </p>
      </div>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  )
}

function CellEditorControl({
  editor,
  label,
  initial,
  typed,
  align,
  pos,
  onDone,
}: {
  editor: CellEditor
  label: string
  initial: string
  /** Editing began with a keystroke (`initial` is that key). */
  typed: boolean
  align?: "start" | "end"
  pos: Pos
  onDone: (
    text: string | null,
    move: Pos | null,
    options?: { refocus?: boolean }
  ) => void
}) {
  const [text, setText] = React.useState(initial)
  const done = React.useRef(false)
  const finish = (
    value: string | null,
    move: Pos | null,
    options?: { refocus?: boolean }
  ) => {
    if (done.current) return
    done.current = true
    onDone(value, move, options)
  }

  if (editor.type === "select")
    return (
      <Select
        items={editor.options}
        defaultOpen
        value={initial}
        onValueChange={(v) => finish(v == null ? null : String(v), null)}
        onOpenChange={(open) => {
          if (!open) finish(null, null)
        }}
      >
        <SelectTrigger
          aria-label={label}
          className="h-10! w-full rounded-none border-0 bg-background px-3 shadow-none"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {editor.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )

  return (
    <Input
      autoFocus
      aria-label={label}
      value={text}
      inputMode={editor.type === "number" ? "decimal" : undefined}
      placeholder={editor.type === "text" ? editor.placeholder : undefined}
      onFocus={(e) => {
        // Opened by typing: caret after the typed key; otherwise select all.
        if (typed) e.target.setSelectionRange(1, 1)
        else e.target.select()
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => finish(text, null, { refocus: false })}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          finish(text, { r: pos.r + (e.shiftKey ? -1 : 1), c: pos.c })
        } else if (e.key === "Tab") {
          e.preventDefault()
          finish(text, { r: pos.r, c: pos.c + (e.shiftKey ? -1 : 1) })
        } else if (e.key === "Escape") {
          // Keep Escape from closing a surrounding dialog or sheet.
          e.preventDefault()
          e.stopPropagation()
          finish(null, null)
        }
      }}
      className={cn(
        "h-10 rounded-none border-0 bg-background px-3 shadow-none outline-2 -outline-offset-2 outline-(--ds-focus-ring) focus-visible:outline-2 dark:bg-background",
        align === "end" && "text-end tabular-nums"
      )}
    />
  )
}
