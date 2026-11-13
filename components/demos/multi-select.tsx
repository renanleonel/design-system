"use client"

import * as React from "react"

import { MultiSelect } from "@/components/ui/multi-select"

const TAGS = [
  "Analytics",
  "Billing",
  "Design",
  "Growth",
  "Infrastructure",
  "Marketing",
  "Mobile",
  "Security",
].map((label) => ({ label, value: label.toLowerCase() }))

export function Default() {
  const [value, setValue] = React.useState(["design", "growth"])
  return (
    <MultiSelect
      options={TAGS}
      value={value}
      onValueChange={setValue}
      placeholder="Add tags…"
      aria-label="Tags"
      className="w-72"
    />
  )
}

export function Empty() {
  return (
    <MultiSelect
      options={TAGS}
      placeholder="Add tags…"
      aria-label="Tags"
      className="w-72"
    />
  )
}

export function Disabled() {
  return (
    <MultiSelect
      options={TAGS}
      defaultValue={["security"]}
      disabled
      aria-label="Tags"
      className="w-72"
    />
  )
}
