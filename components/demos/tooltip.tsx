"use client"

import { BoldIcon, ItalicIcon, PlusIcon, UnderlineIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Default() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="outline" size="icon" aria-label="New project" />}
      >
        <PlusIcon />
      </TooltipTrigger>
      <TooltipContent>New project</TooltipContent>
    </Tooltip>
  )
}

const MARKS = [
  { label: "Bold", hotkey: "Mod+B", icon: <BoldIcon /> },
  { label: "Italic", hotkey: "Mod+I", icon: <ItalicIcon /> },
  { label: "Underline", hotkey: "Mod+U", icon: <UnderlineIcon /> },
] as const

/** Hover one, then slide across: the next opens instantly. The hotkeys work too. */
export function WithHotkey() {
  return (
    <TooltipProvider>
      <div className="flex gap-1">
        {MARKS.map((mark) => (
          <Tooltip key={mark.label}>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={mark.label}
                  hotkey={mark.hotkey}
                  onClick={() => toast(`${mark.label} toggled`)}
                />
              }
            >
              {mark.icon}
            </TooltipTrigger>
            <TooltipContent hotkey={mark.hotkey}>{mark.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
