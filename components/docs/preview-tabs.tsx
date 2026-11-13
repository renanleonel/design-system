"use client"

import { cn } from "cn"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/** Preview / Code switch for a story. Both panes come from the server. */
export function PreviewTabs({
  preview,
  code,
  className,
}: {
  preview: React.ReactNode
  code: React.ReactNode
  className?: string
}) {
  return (
    <Tabs defaultValue="preview" className={cn("gap-3", className)}>
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <div className="flex min-h-56 items-center justify-center rounded-xl px-4 py-10 shadow-border sm:px-10">
          {preview}
        </div>
      </TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  )
}
