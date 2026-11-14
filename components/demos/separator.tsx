"use client"

import { Separator } from "@/components/ui/separator"

export function Default() {
  return (
    <div className="w-full max-w-xs text-sm">
      <p className="font-medium">renanleonel/ui</p>
      <p className="text-muted-foreground">Components for shipping SaaS.</p>
      <Separator className="my-3" />
      <div className="flex h-5 items-center gap-3">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Blocks</span>
        <Separator orientation="vertical" />
        <span>Themes</span>
      </div>
    </div>
  )
}
