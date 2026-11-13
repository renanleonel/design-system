"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PLANS = [
  { label: "Hobby", value: "hobby" },
  { label: "Pro", value: "pro" },
  { label: "Enterprise", value: "enterprise" },
]

export function Default() {
  return (
    <Select items={PLANS} defaultValue="pro" aria-label="Plan">
      <SelectTrigger className="w-44" aria-label="Plan">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PLANS.map((plan) => (
          <SelectItem key={plan.value} value={plan.value}>
            {plan.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const REGIONS = [
  { label: "Frankfurt", value: "fra", group: "Europe" },
  { label: "London", value: "lhr", group: "Europe" },
  { label: "Virginia", value: "iad", group: "Americas" },
  { label: "São Paulo", value: "gru", group: "Americas" },
]

export function Grouped() {
  return (
    <Select items={REGIONS} defaultValue="fra" aria-label="Region">
      <SelectTrigger className="w-48" aria-label="Region">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["Europe", "Americas"].map((group, i) => (
          <SelectGroup key={group}>
            {i > 0 && <SelectSeparator />}
            <SelectLabel>{group}</SelectLabel>
            {REGIONS.filter((r) => r.group === group).map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

export function Small() {
  return (
    <Select items={PLANS} defaultValue="hobby" aria-label="Plan">
      <SelectTrigger size="sm" className="w-36" aria-label="Plan">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PLANS.map((plan) => (
          <SelectItem key={plan.value} value={plan.value}>
            {plan.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function Disabled() {
  return (
    <Select items={PLANS} defaultValue="pro" disabled aria-label="Plan">
      <SelectTrigger className="w-44" aria-label="Plan">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PLANS.map((plan) => (
          <SelectItem key={plan.value} value={plan.value}>
            {plan.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
