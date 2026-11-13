"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

/** Drag the handle, or focus it and use the arrow keys; double-click resets. */
export function Default() {
  return (
    <div className="h-64 w-full max-w-xl overflow-hidden rounded-lg shadow-border">
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="35%" minSize="20%">
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            List
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize list" />
        <ResizablePanel minSize="30%">
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            Detail
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

/** Vertical: an editor above its output. */
export function Vertical() {
  return (
    <div className="h-72 w-full max-w-md overflow-hidden rounded-lg shadow-border">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize="60%" minSize="25%">
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            Editor
          </div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize output" />
        <ResizablePanel minSize="20%">
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            Output
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
