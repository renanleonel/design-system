"use client"

import * as React from "react"
import { cn } from "cn"
import {
  ExternalLinkIcon,
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%", icon: <MonitorIcon /> },
  { id: "tablet", label: "Tablet", width: "768px", icon: <TabletIcon /> },
  { id: "mobile", label: "Phone", width: "375px", icon: <SmartphoneIcon /> },
] as const

/**
 * A block running in an iframe at a device width, with its source beside it.
 * The frame's width animates between devices, so the layout visibly reflows.
 */
export function BlockFrame({
  title,
  src,
  files,
}: {
  title: string
  src: string
  files: { path: string; code: React.ReactNode }[]
}) {
  const [device, setDevice] = React.useState<string>("desktop")
  const [file, setFile] = React.useState(files[0]?.path)
  const width = DEVICES.find((d) => d.id === device)?.width

  return (
    <Tabs defaultValue="preview" className="gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TabsList variant="line">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <div className="ms-auto flex items-center gap-2">
          <Tabs
            value={device}
            onValueChange={(v) => setDevice(String(v))}
            className="hidden md:flex"
          >
            <TabsList variant="segmented" aria-label="Preview size">
              {DEVICES.map((d) => (
                <TabsTrigger
                  key={d.id}
                  value={d.id}
                  aria-label={d.label}
                  className="px-2.5"
                >
                  {d.icon}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Open ${title} in a new tab`}
            render={<a href={src} target="_blank" rel="noreferrer" />}
            nativeButton={false}
          >
            <ExternalLinkIcon />
          </Button>
        </div>
      </div>
      <TabsContent value="preview">
        <div className="flex justify-center overflow-hidden rounded-xl bg-muted/40 shadow-border">
          <iframe
            src={src}
            title={title}
            loading="lazy"
            style={{ width }}
            className={cn(
              "h-[42rem] max-w-full bg-background transition-[width] duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none",
              device !== "desktop" && "shadow-border"
            )}
          />
        </div>
      </TabsContent>
      <TabsContent value="code" className="flex flex-col gap-2">
        {files.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {files.map((f) => (
              <Button
                key={f.path}
                size="sm"
                variant={f.path === file ? "secondary" : "ghost"}
                onClick={() => setFile(f.path)}
                className="font-mono text-xs"
              >
                {f.path.split("/").pop()}
              </Button>
            ))}
          </div>
        )}
        {files.find((f) => f.path === file)?.code}
      </TabsContent>
    </Tabs>
  )
}
