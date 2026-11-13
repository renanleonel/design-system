"use client"

import { CircleCheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function Variants() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  )
}

const TONES = ["gray", "blue", "green", "amber", "orange", "red", "purple"] as const

/** Status pills: the tone's text on a 12% tint of itself, contrast-checked in every theme. */
export function Tones() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {TONES.map((tone) => (
        <Badge key={tone} tone={tone} className="capitalize">
          {tone}
        </Badge>
      ))}
    </div>
  )
}

export function WithIcon() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge tone="green">
        <CircleCheckIcon />
        Deployed
      </Badge>
      <Badge tone="green" size="md">
        <CircleCheckIcon />
        Deployed
      </Badge>
    </div>
  )
}

export function AsLink() {
  return (
    <Badge variant="outline" render={<a href="#changelog" />}>
      v2.4 changelog
    </Badge>
  )
}
