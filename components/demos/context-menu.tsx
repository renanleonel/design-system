"use client"

import * as React from "react"
import { CopyIcon, PencilIcon, ShareIcon, TrashIcon } from "lucide-react"
import { toast } from "sonner"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

const areaClassName =
  "flex h-32 w-full max-w-sm items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground select-none"

/** Right click (or long press on touch) the area. Hotkeys fire while the menu is open. */
export function Default() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className={areaClassName}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem hotkey="Mod+E" onClick={() => toast("Renamed")}>
          <PencilIcon /> Rename
        </ContextMenuItem>
        <ContextMenuItem hotkey="Mod+D" onClick={() => toast("Duplicated")}>
          <CopyIcon /> Duplicate
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <ShareIcon /> Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <TrashIcon /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function CheckboxesAndRadios() {
  const [grid, setGrid] = React.useState(true)
  const [rulers, setRulers] = React.useState(false)
  const [zoom, setZoom] = React.useState("100")
  return (
    <ContextMenu>
      <ContextMenuTrigger className={areaClassName}>
        Right click the canvas
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
            Grid
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={rulers} onCheckedChange={setRulers}>
            Rulers
          </ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Zoom</ContextMenuLabel>
          <ContextMenuRadioGroup value={zoom} onValueChange={setZoom}>
            <ContextMenuRadioItem value="50">50%</ContextMenuRadioItem>
            <ContextMenuRadioItem value="100">100%</ContextMenuRadioItem>
            <ContextMenuRadioItem value="200">200%</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** Long labels, compound names, CJK and Arabic text, and an unbroken 50-character word. */
export function WorstCase() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className={areaClassName}>
        Maria Eduarda dos Santos Albuquerque Cavalcanti
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Enviar para João Pedro de Oliveira Neto e toda a equipe de produto
        </ContextMenuItem>
        <ContextMenuItem>Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</ContextMenuItem>
        <ContextMenuItem>名前を付けて保存して共有フォルダに移動する</ContextMenuItem>
        <ContextMenuItem>حفظ نسخة من الملف في المجلد المشترك</ContextMenuItem>
        <ContextMenuItem disabled>Disabled action</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** A menu with nothing to offer says so instead of opening blank. */
export function Empty() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className={areaClassName}>
        Right click: no actions
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled>No actions available</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function One() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className={areaClassName}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => toast("Copied")}>
          <CopyIcon /> Copy
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
