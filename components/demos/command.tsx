"use client"

import * as React from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import {
  CalendarIcon,
  CreditCardIcon,
  FolderIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Hotkey } from "@/components/ui/hotkey"

export function Default() {
  return (
    <Command className="max-w-sm rounded-xl shadow-border">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <CalendarIcon /> Calendar
          </CommandItem>
          <CommandItem>
            <FolderIcon /> Projects
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <UserIcon /> Profile
            <CommandShortcut>
              <Hotkey hotkey="Mod+P" variant="text" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCardIcon /> Billing
          </CommandItem>
          <CommandItem>
            <SettingsIcon /> Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const PAGES = ["Projects", "Members", "Billing", "Settings"]

/** Press Mod+J (Mod+K is the docs search). */
export function Palette() {
  const [open, setOpen] = React.useState(false)
  useHotkey("Mod+J", () => setOpen((o) => !o))
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open palette <Hotkey hotkey="Mod+J" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Go to">
        <Command>
          <CommandInput placeholder="Go to…" />
          <CommandList>
            <CommandEmpty>No pages match.</CommandEmpty>
            <CommandGroup heading="Pages">
              {PAGES.map((page) => (
                <CommandItem
                  key={page}
                  onSelect={() => {
                    setOpen(false)
                    toast(`Opened ${page}`)
                  }}
                >
                  {page}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
