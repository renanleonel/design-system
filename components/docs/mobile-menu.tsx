"use client"

import { DocsNav } from "@/components/docs/docs-nav"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import type { NavGroup } from "@/lib/docs"

export default function MobileMenu({
  nav,
  open,
  onOpenChange,
}: {
  nav: NavGroup[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="inline-start" className="w-72 overflow-y-auto p-4">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <DocsNav
          groups={[
            { label: "Site", items: [{ title: "Blocks", href: "/blocks" }] },
            ...nav,
          ]}
          onNavigate={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
