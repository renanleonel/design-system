"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function Default() {
  const [volume, setVolume] = React.useState(60)
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="flex justify-between text-sm">
        <Label id="slider-volume">Volume</Label>
        <span className="text-muted-foreground tabular-nums">{volume}%</span>
      </div>
      <Slider
        value={volume}
        onValueChange={(v) => setVolume(v as number)}
        aria-labelledby="slider-volume"
      />
    </div>
  )
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`

/** Pass an array for a range. */
export function Range() {
  const [range, setRange] = React.useState([200, 800])
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="flex justify-between text-sm">
        <Label id="slider-price">Price</Label>
        <span className="text-muted-foreground tabular-nums">
          {usd(range[0])} – {usd(range[1])}
        </span>
      </div>
      <Slider
        value={range}
        onValueChange={(v) => setRange(v as number[])}
        min={0}
        max={1000}
        step={50}
        minStepsBetweenValues={1}
        aria-labelledby="slider-price"
      />
    </div>
  )
}

export function Disabled() {
  return (
    <Slider defaultValue={40} disabled aria-label="Opacity" className="max-w-xs" />
  )
}
