"use client"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function Default() {
  return (
    <RadioGroup defaultValue="comfortable" aria-label="Density" className="w-auto">
      {["Compact", "Comfortable", "Spacious"].map((label) => (
        <Field key={label} orientation="horizontal" className="w-auto">
          <RadioGroupItem value={label.toLowerCase()} id={`radio-${label}`} />
          <FieldLabel htmlFor={`radio-${label}`}>{label}</FieldLabel>
        </Field>
      ))}
    </RadioGroup>
  )
}

const PLANS = [
  { value: "monthly", label: "Monthly", description: "$12 per seat, cancel anytime." },
  { value: "yearly", label: "Yearly", description: "$10 per seat, billed once a year." },
]

/** Label and description beside each option; the whole row toggles it. */
export function WithDescriptions() {
  return (
    <FieldSet className="max-w-xs">
      <FieldLegend variant="label">Billing period</FieldLegend>
      <RadioGroup defaultValue="yearly">
        {PLANS.map((plan) => (
          <Field key={plan.value} orientation="horizontal">
            <RadioGroupItem value={plan.value} id={`plan-${plan.value}`} />
            <FieldContent>
              <FieldLabel htmlFor={`plan-${plan.value}`}>{plan.label}</FieldLabel>
              <FieldDescription>{plan.description}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  )
}

export function Disabled() {
  return (
    <RadioGroup defaultValue="email" disabled aria-label="Channel" className="w-auto">
      {["Email", "SMS"].map((label) => (
        <Field key={label} orientation="horizontal" className="w-auto">
          <RadioGroupItem value={label.toLowerCase()} id={`radio-d-${label}`} />
          <FieldLabel htmlFor={`radio-d-${label}`}>{label}</FieldLabel>
        </Field>
      ))}
    </RadioGroup>
  )
}
