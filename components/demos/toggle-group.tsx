"use client"

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  LayoutGridIcon,
  ListIcon,
  UnderlineIcon,
} from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Single choice: one item is always on. */
export function Default() {
  return (
    <ToggleGroup defaultValue={["left"]} aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeftIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenterIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRightIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export function Multiple() {
  return (
    <ToggleGroup multiple defaultValue={["bold"]} aria-label="Text style">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

/** `spacing={0}` joins the items into one control. */
export function Joined() {
  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
      defaultValue={["grid"]}
      aria-label="View"
    >
      <ToggleGroupItem value="grid">
        <LayoutGridIcon />
        Grid
      </ToggleGroupItem>
      <ToggleGroupItem value="list">
        <ListIcon />
        List
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
