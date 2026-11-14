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

// Facade: previews are whole block apps, so none boots until the visitor first
// engages with the page (scroll, pointer, touch, key). Real visitors do that at
// once; a page that's only been loaded doesn't pay for apps nobody looked at.
const ENGAGE_EVENTS = ["pointermove", "pointerdown", "wheel", "scroll", "keydown", "touchstart"]
let engaged = false
function subscribeEngaged(notify: () => void) {
  if (engaged) return () => {}
  const onEngage = () => {
    engaged = true
    for (const type of ENGAGE_EVENTS) window.removeEventListener(type, onEngage)
    notify()
  }
  for (const type of ENGAGE_EVENTS)
    window.addEventListener(type, onEngage, { passive: true, once: true })
  return () => {
    for (const type of ENGAGE_EVENTS) window.removeEventListener(type, onEngage)
  }
}
const useEngaged = () =>
  React.useSyncExternalStore(subscribeEngaged, () => engaged, () => false)

const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%", icon: <MonitorIcon /> },
  { id: "tablet", label: "Tablet", width: "768px", icon: <TabletIcon /> },
  { id: "mobile", label: "Phone", width: "375px", icon: <SmartphoneIcon /> },
] as const

/**
 * A block running in an iframe at a device width, with its source beside it.
 * The frame's width animates between devices, so the layout visibly reflows.
 * `variants` (layouts of one block) add a switch that swaps the frame's URL.
 */
export function BlockFrame({
  title,
  src: defaultSrc,
  variants,
  files,
}: {
  title: string
  src: string
  variants?: { label: string; src: string }[]
  files: { path: string; code: React.ReactNode }[]
}) {
  // The picked layout, if any; otherwise the block's default URL.
  const [picked, setPicked] = React.useState<string | null>(null)
  const src = picked ?? defaultSrc
  const [device, setDevice] = React.useState<string>("desktop")
  const [pickedFile, setFile] = React.useState<string | null>(null)
  const file = pickedFile ?? files[0]?.path
  const width = DEVICES.find((d) => d.id === device)?.width
  // Native lazy loading starts iframes 1250px+ away, booting several block apps
  // on first load. Mount the frame only once it's close to the viewport.
  const frameRef = React.useRef<HTMLDivElement>(null)
  const [near, setNear] = React.useState(false)
  const live = useEngaged() && near
  React.useEffect(() => {
    const el = frameRef.current
    if (!el || near) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true)
      },
      { rootMargin: "200px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [near])

  return (
    <Tabs defaultValue="preview" className="gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TabsList variant="line">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
          {variants && variants.length > 1 && (
            <Tabs value={src} onValueChange={(v) => setPicked(String(v))}>
              <TabsList variant="segmented" aria-label={`${title} layout`}>
                {variants.map((v) => (
                  <TabsTrigger key={v.src} value={v.src}>
                    {v.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
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
        <div
          ref={frameRef}
          className="flex justify-center overflow-hidden rounded-xl bg-muted/40 shadow-border"
        >
          <iframe
            src={live ? src : undefined}
            title={title}
            loading="lazy"
            // Blocks are this site's own pages: scripts, URL state (same origin),
            // JS-handled forms, new-tab links and links that leave the preview.
            // Scripts + same origin is required for history-based URL state.
            // react-doctor-disable-next-line react-doctor/iframe-missing-sandbox
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
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
