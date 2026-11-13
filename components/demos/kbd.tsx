"use client"

import { Kbd, KbdGroup } from "@/components/ui/kbd"

export function Default() {
  return (
    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
      <KbdGroup>
        <Kbd>Shift</Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>
      <p>
        Press <Kbd>Esc</Kbd> to close.
      </p>
    </div>
  )
}
