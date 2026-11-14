"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

export function Default() {
  const [toolbar, setToolbar] = React.useState(true)
  const [sidebar, setSidebar] = React.useState(false)
  const [density, setDensity] = React.useState("comfortable")
  return (
    <Menubar aria-label="Application">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem hotkey="Mod+N" onClick={() => toast("New file")}>
            New
          </MenubarItem>
          <MenubarItem hotkey="Mod+O" onClick={() => toast("Open")}>
            Open
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Export</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>PNG</MenubarItem>
              <MenubarItem>SVG</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Delete project</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarLabel>Panels</MenubarLabel>
            <MenubarCheckboxItem checked={toolbar} onCheckedChange={setToolbar}>
              Toolbar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={sidebar} onCheckedChange={setSidebar}>
              Sidebar
            </MenubarCheckboxItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarLabel>Density</MenubarLabel>
            <MenubarRadioGroup value={density} onValueChange={setDensity}>
              <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
              <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem>Keyboard shortcuts</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

/** Long labels, compound names, CJK and Arabic text, and an unbroken 50-character word. */
export function WorstCase() {
  return (
    <Menubar aria-label="Worst case">
      <MenubarMenu>
        <MenubarTrigger>Arquivo de Maria Eduarda dos Santos Albuquerque Cavalcanti</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Enviar para João Pedro de Oliveira Neto e toda a equipe de produto
          </MenubarItem>
          <MenubarItem>Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</MenubarItem>
          <MenubarItem>名前を付けて保存して共有フォルダに移動する</MenubarItem>
          <MenubarItem>حفظ نسخة من الملف في المجلد المشترك</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>ファイル</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>新規作成</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>ملف</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>جديد</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export function One() {
  return (
    <Menubar aria-label="Single menu">
      <MenubarMenu>
        <MenubarTrigger>Account</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Sign out</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export function Empty() {
  return (
    <Menubar aria-label="Empty menu">
      <MenubarMenu>
        <MenubarTrigger>Recent</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>No recent files</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
