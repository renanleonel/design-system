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

const PEOPLE = Array.from({ length: 5000 }, (_, i) => {
  const first = ["Ana", "João", "Pedro", "Maria", "Lucas", "Beatriz"][i % 6]
  const last = ["Souza", "Silva", "Santos", "Oliveira", "Costa", "Lima"][
    Math.floor(i / 6) % 6
  ]
  return { value: `u${i}`, label: `${first} ${last} ${Math.floor(i / 36) + 1}` }
})

/** 5,000 people: the list is virtualized, so it opens and filters instantly. */
export function ManyOptions() {
  return (
    <MultiSelect
      options={PEOPLE}
      defaultValue={["u0", "u7"]}
      placeholder="Add people…"
      aria-label="Reviewers"
      className="w-80"
    />
  )
}

/** Worst case: every option selected, plus one long label, in a narrow trigger. */
export function WorstCase() {
  const options = [
    ...TAGS,
    {
      label: "Customer feedback from enterprise onboarding",
      value: "feedback",
    },
  ]
  return (
    <MultiSelect
      options={options}
      defaultValue={options.map((o) => o.value)}
      aria-label="Tags"
      className="w-60"
    />
  )
}
