"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { toastUndo } from "@/components/ui/sonner"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Mount `<Toaster />` once, near the root of your app. */
export function Types() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => toast("Event created")}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Changes saved")}>
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("Couldn't save. Try again.")}
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(wait(1500), {
            loading: "Uploading…",
            success: "Uploaded",
            error: "Upload failed",
          })
        }
      >
        Promise
      </Button>
    </div>
  )
}

/** Reversible actions run right away and offer undo instead of asking first. */
export function Undo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toastUndo("Project archived", {
          onUndo: () => toast.success("Project restored"),
        })
      }
    >
      Archive project
    </Button>
  )
}
