"use client"

import { BellIcon, BoltIcon, RocketIcon } from "lucide-react"

import { IconTile } from "@/components/ui/icon-tile"

const TONES = [
  "neutral",
  "inverse",
  "gray",
  "blue",
  "green",
  "amber",
  "orange",
  "red",
  "purple",
] as const

export function Tones() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {TONES.map((tone) => (
        <IconTile key={tone} tone={tone} title={tone}>
          <RocketIcon />
        </IconTile>
      ))}
    </div>
  )
}

export function Sizes() {
  return (
    <div className="flex items-center gap-3">
      <IconTile size="sm" tone="blue">
        <BellIcon />
      </IconTile>
      <IconTile size="md" tone="blue">
        <BellIcon />
      </IconTile>
      <IconTile size="lg" tone="blue">
        <BoltIcon />
      </IconTile>
    </div>
  )
}
