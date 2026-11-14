"use client"

import * as React from "react"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react"

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
} from "@/components/ui/toolbar"

export function Default() {
  return (
    <Toolbar aria-label="Text formatting">
      <ToolbarGroup>
        <ToolbarButton size="icon-sm" aria-label="Bold">
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Italic">
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Underline">
          <UnderlineIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarButton size="icon-sm" aria-label="Align left">
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Align center">
          <AlignCenterIcon />
        </ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Align right">
          <AlignRightIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarLink href="#help">Help</ToolbarLink>
    </Toolbar>
  )
}

/** Toggle buttons: `aria-pressed` and `data-pressed` drive the pressed look. */
export function Toggles() {
  const [on, setOn] = React.useState({ bold: true, italic: false })
  return (
    <Toolbar aria-label="Toggle formatting">
      <ToolbarButton
        size="icon-sm"
        aria-label="Bold"
        aria-pressed={on.bold}
        data-pressed={on.bold ? "" : undefined}
        onClick={() => setOn((s) => ({ ...s, bold: !s.bold }))}
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        size="icon-sm"
        aria-label="Italic"
        aria-pressed={on.italic}
        data-pressed={on.italic ? "" : undefined}
        onClick={() => setOn((s) => ({ ...s, italic: !s.italic }))}
      >
        <ItalicIcon />
      </ToolbarButton>
    </Toolbar>
  )
}

export function WithInput() {
  return (
    <Toolbar aria-label="Filters" className="max-w-full">
      <ToolbarInput aria-label="Search" placeholder="Search" className="w-40" />
      <ToolbarSeparator />
      <ToolbarButton variant="outline">Filter</ToolbarButton>
      <ToolbarButton>Export</ToolbarButton>
      <ToolbarButton disabled>Archive</ToolbarButton>
    </Toolbar>
  )
}

export function Vertical() {
  return (
    <Toolbar orientation="vertical" aria-label="Tools">
      <ToolbarButton size="icon-sm" aria-label="Bold">
        <BoldIcon />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton size="icon-sm" aria-label="Italic">
        <ItalicIcon />
      </ToolbarButton>
    </Toolbar>
  )
}

export function WorstCase() {
  return (
    <Toolbar
      aria-label="Worst case"
      className="w-full max-w-xs overflow-x-auto"
    >
      <ToolbarButton className="max-w-40 truncate">
        Maria Eduarda dos Santos Albuquerque Cavalcanti
      </ToolbarButton>
      <ToolbarButton>这是一个非常长的中文按钮标签</ToolbarButton>
      <ToolbarButton dir="rtl">هذا نص طويل جدا</ToolbarButton>
      <ToolbarButton>
        Supercalifragilisticexpialidocious_Supercalifragilistic
      </ToolbarButton>
    </Toolbar>
  )
}

export function One() {
  return (
    <Toolbar aria-label="Single action">
      <ToolbarButton>Save</ToolbarButton>
    </Toolbar>
  )
}
