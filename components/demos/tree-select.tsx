"use client"

import * as React from "react"
import { FileIcon, FolderIcon } from "lucide-react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { TreeSelect } from "@/components/ui/tree-select"
import type { TreeNode } from "@/components/ui/tree"

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
      file("components/ui/tree-select.tsx", "tree-select.tsx"),
    ]),
  ]),
  folder("hooks", "hooks", [file("hooks/use-debounce.ts", "use-debounce.ts")]),
  file("package.json", "package.json"),
]

/** Pick one node; the popup closes on pick and opens on the value's folder. */
export function Default() {
  const [value, setValue] = React.useState<string | null>(
    "components/ui/tree.tsx"
  )
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="tree-select-file">Entry file</FieldLabel>
      <TreeSelect
        id="tree-select-file"
        nodes={PROJECT}
        value={value}
        onValueChange={setValue}
        placeholder="Choose a file…"
        searchPlaceholder="Search files…"
      />
    </Field>
  )
}

const TEAMS: TreeNode[] = [
  {
    id: "eng",
    label: "Engineering",
    children: [
      {
        id: "eng/platform",
        label: "Platform",
        children: [
          { id: "eng/platform/infra", label: "Infrastructure" },
          { id: "eng/platform/dx", label: "Developer experience" },
        ],
      },
      { id: "eng/product", label: "Product engineering" },
      { id: "eng/mobile", label: "Mobile" },
    ],
  },
  {
    id: "design",
    label: "Design",
    children: [
      { id: "design/brand", label: "Brand" },
      { id: "design/product", label: "Product design" },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    children: [
      { id: "ops/finance", label: "Finance" },
      { id: "ops/people", label: "People" },
      { id: "ops/legal", label: "Legal", disabled: true },
    ],
  },
]

/** `multiple`: check several nodes; tags past two fold into "+N". */
export function Multiple() {
  const [value, setValue] = React.useState<string[]>([
    "eng/platform/infra",
    "design/product",
  ])
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="tree-select-teams">Notify teams</FieldLabel>
      <TreeSelect
        multiple
        id="tree-select-teams"
        nodes={TEAMS}
        value={value}
        onValueChange={setValue}
        placeholder="Choose teams…"
        searchPlaceholder="Search teams…"
      />
      <FieldDescription>Legal is managed by your admin.</FieldDescription>
    </Field>
  )
}
