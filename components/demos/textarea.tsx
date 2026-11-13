"use client"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export function Default() {
  return (
    <Textarea
      placeholder="Write a note. It grows as you type."
      aria-label="Note"
      className="max-w-sm"
    />
  )
}

export function WithLabel() {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="textarea-bio">Bio</FieldLabel>
      <Textarea id="textarea-bio" placeholder="A sentence or two about you" />
      <FieldDescription>Shown on your public profile.</FieldDescription>
    </Field>
  )
}

export function Disabled() {
  return (
    <Textarea
      disabled
      defaultValue="Read only for now."
      aria-label="Note"
      className="max-w-sm"
    />
  )
}
