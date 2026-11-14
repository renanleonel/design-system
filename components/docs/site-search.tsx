"use client"

import { useRouter } from "next/navigation"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import type { NavGroup } from "@/lib/docs"

/** The ⌘K palette. Loaded on first open so cmdk stays out of every page's bundle. */
export default function SiteSearch({
  nav,
  open,
  onOpenChange,
}: {
  nav: NavGroup[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search docs">
      <Command>
        <CommandInput placeholder="Search components, blocks and pages…" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          {nav.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${group.label} ${item.title}`}
                  onSelect={() => {
                    onOpenChange(false)
                    router.push(item.href)
                  }}
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
