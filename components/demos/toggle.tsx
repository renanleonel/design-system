"use client"

import {
  BoldIcon,
  BookmarkCheckIcon,
  BookmarkIcon,
  ItalicIcon,
} from "lucide-react"

import { Toggle } from "@/components/ui/toggle"

export function Default() {
  return (
    <div className="flex gap-1">
      <Toggle aria-label="Bold" defaultPressed>
        <BoldIcon />
      </Toggle>
      <Toggle aria-label="Italic">
        <ItalicIcon />
      </Toggle>
    </div>
  )
}

export function Outline() {
  return (
    <Toggle variant="outline">
      <BookmarkIcon />
      Bookmark
    </Toggle>
  )
}

/** `pressedChildren` swaps the icon and label while on, without a width jump. */
export function PressedContent() {
  return (
    <Toggle
      variant="outline"
      pressedChildren={
        <>
          <BookmarkCheckIcon />
          Bookmarked
        </>
      }
    >
      <BookmarkIcon />
      Bookmark
    </Toggle>
  )
}

export function Sizes() {
  return (
    <div className="flex items-center gap-1">
      <Toggle size="sm" aria-label="Bold, small">
        <BoldIcon />
      </Toggle>
      <Toggle aria-label="Bold">
        <BoldIcon />
      </Toggle>
      <Toggle size="lg" aria-label="Bold, large">
        <BoldIcon />
      </Toggle>
    </div>
  )
}
