"use client"

import * as React from "react"
import { FileIcon, FolderIcon, SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tree, type TreeNode } from "@/components/ui/tree"
import { useDebouncedState } from "@/hooks/use-debounce"

const folder = (id: string, label: string, children: TreeNode[]): TreeNode => ({
  id,
  label,
  icon: <FolderIcon />,
  children,
})
const file = (id: string, label: string): TreeNode => ({
  id,
  label,
  icon: <FileIcon />,
})

const PROJECT: TreeNode[] = [
  folder("app", "app", [
    folder("app/(site)", "(site)", [
      file("app/(site)/page.tsx", "page.tsx"),
      file("app/(site)/layout.tsx", "layout.tsx"),
    ]),
    file("app/globals.css", "globals.css"),
  ]),
  folder("components", "components", [
    folder("components/ui", "ui", [
      file("components/ui/button.tsx", "button.tsx"),
      file("components/ui/tree.tsx", "tree.tsx"),
      file("components/ui/virtual-list.tsx", "virtual-list.tsx"),
    ]),
  ]),
  folder("hooks", "hooks", [file("hooks/use-debounce.ts", "use-debounce.ts")]),
  file("package.json", "package.json"),
  file("README.md", "README.md"),
]

/** Arrows move and open folders, Enter selects, typing jumps to a name. */
export function Default() {
  const [value, setValue] = React.useState<string | null>(
    "components/ui/tree.tsx"
  )
  return (
    <Tree
      nodes={PROJECT}
      value={value}
      onValueChange={setValue}
      defaultExpanded={["components", "components/ui"]}
      aria-label="Project files"
      className="w-72"
    />
  )
}

/** `multiple`: rows become checkboxes; each node toggles on its own. */
export function Multiple() {
  const [value, setValue] = React.useState<string[]>([
    "components/ui/tree.tsx",
    "package.json",
  ])
  return (
    <Tree
      multiple
      nodes={PROJECT}
      value={value}
      onValueChange={setValue}
      defaultExpanded={["components", "components/ui"]}
      aria-label="Files to commit"
      className="w-72"
    />
  )
}

// 20 folders × 25 subfolders × 20 files: 10,520 nodes.
const LARGE: TreeNode[] = Array.from({ length: 20 }, (_, a) =>
  folder(
    `${a}`,
    `Region ${a + 1}`,
    Array.from({ length: 25 }, (_, b) =>
      folder(
        `${a}/${b}`,
        `Team ${a + 1}.${b + 1}`,
        Array.from({ length: 20 }, (_, c) =>
          file(`${a}/${b}/${c}`, `report-${a + 1}-${b + 1}-${c + 1}.pdf`)
        )
      )
    )
  )
)

/**
 * 10,520 nodes: only the rows in view render. The search box updates as you
 * type; the tree filters once typing pauses (useDebouncedState).
 */
export function LargeWithSearch() {
  const [query, debouncedQuery, setQuery] = useDebouncedState("")
  return (
    <div className="flex w-80 flex-col gap-2">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Filter reports"
          placeholder="Filter reports…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>
      <Tree
        nodes={LARGE}
        filter={debouncedQuery}
        defaultExpanded={["0", "0/0"]}
        aria-label="Reports"
        className="h-80 rounded-lg shadow-border"
        empty={`No reports match “${debouncedQuery}”.`}
      />
    </div>
  )
}
