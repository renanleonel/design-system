"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Default() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor="label-name">Full name</Label>
      <Input id="label-name" placeholder="Ada Lovelace" />
    </div>
  )
}

/** Wrapping a control makes the whole label its hit area. */
export function Wrapping() {
  return (
    <Label>
      <Checkbox defaultChecked />
      Remember this device
    </Label>
  )
}
