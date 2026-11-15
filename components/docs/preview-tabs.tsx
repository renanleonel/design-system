"use client"

import { cn } from "cn"

import { useDocsDir } from "@/components/docs/docs-direction"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PreviewTabs({
  preview,
  code,
  className,
}: {
  preview: React.ReactNode
  code: React.ReactNode
  className?: string
}) {
  const [dir, setDir] = useDocsDir()
  return (
    <Tabs defaultValue="preview" className={cn("gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <TabsList variant="line">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <button
          type="button"
          aria-pressed={dir === "rtl"}
          onClick={() => setDir(dir === "rtl" ? "ltr" : "rtl")}
          className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground aria-pressed:text-foreground"
        >
          RTL
        </button>
      </div>
      <TabsContent value="preview">
        <div
          data-slot="story-preview"
          className="flex min-h-56 items-center justify-center rounded-xl px-4 py-10 shadow-border sm:px-10"
        >
          {preview}
        </div>
      </TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  )
}
