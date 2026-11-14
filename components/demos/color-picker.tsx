"use client"

import * as React from "react"

import { ColorPicker, type ColorPreset } from "@/components/ui/color-picker"
import { Label } from "@/components/ui/label"

const PRESETS: ColorPreset[] = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#0f172a", label: "Slate" },
  { value: "#ffffff", label: "White" },
]

/** Drag the area or hue slider, type a hex, or arrow-key the sliders. */
export function Default() {
  const [color, setColor] = React.useState("#3b82f6")
  return (
    <div className="flex flex-col gap-2">
      <Label id="brand-color">Brand color</Label>
      <ColorPicker
        value={color}
        onValueChange={setColor}
        aria-labelledby="brand-color"
      />
    </div>
  )
}

/** Quick picks under the hex input; the matching one gets a ring and a check. */
export function Presets() {
  return (
    <ColorPicker
      defaultValue="#22c55e"
      presets={PRESETS}
      aria-label="Label color"
    />
  )
}

/** `alpha` adds an opacity slider and 8-digit hex (`#3b82f680`). */
export function WithAlpha() {
  const [color, setColor] = React.useState("#3b82f680")
  return (
    <div className="flex items-center gap-3">
      <ColorPicker
        alpha
        value={color}
        onValueChange={setColor}
        presets={PRESETS}
        aria-label="Overlay color"
      />
      <span className="text-sm text-muted-foreground tabular-nums">
        {color}
      </span>
    </div>
  )
}

export function Disabled() {
  return (
    <ColorPicker disabled defaultValue="#8b5cf6" aria-label="Locked color" />
  )
}

/**
 * Open it and type `zz12` or `12345`: the error shows, the color stays put,
 * and the input reverts on blur. 3-digit hex expands (`f80` is `#ff8800`).
 */
export function WorstCase() {
  const [color, setColor] = React.useState("#ff8800")
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <ColorPicker
        alpha
        value={color}
        onValueChange={setColor}
        presets={[
          ...PRESETS,
          { value: "#f80", label: "Laranja Água de Coco do Nordeste" },
          { value: "#0d9488", label: "青緑色の長いラベル" },
          { value: "#7c3aed", label: "بنفسجي داكن للغاية" },
        ]}
        aria-label="Cor de destaque da campanha de Maria Eduarda dos Santos Albuquerque Cavalcanti"
        className="w-full"
      />
      <p className="text-xs text-muted-foreground tabular-nums">
        Current value: {color}
      </p>
    </div>
  )
}
