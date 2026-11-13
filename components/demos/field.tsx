"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export function Default() {
  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="field-name">Workspace name</FieldLabel>
        <Input id="field-name" defaultValue="Acme" />
        <FieldDescription>Shown in emails and invoices.</FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="field-url">Website</FieldLabel>
        <Input id="field-url" defaultValue="acme" aria-invalid />
        <FieldError>Enter a full URL, like https://acme.com.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="field-about">About</FieldLabel>
        <Textarea id="field-about" placeholder="What does your team do?" />
      </Field>
    </FieldGroup>
  )
}

export function Fieldset() {
  return (
    <FieldSet className="max-w-sm">
      <FieldLegend>Notifications</FieldLegend>
      <FieldDescription>Choose what reaches your inbox.</FieldDescription>
      <FieldGroup className="gap-3">
        <Field orientation="horizontal">
          <Checkbox id="field-mentions" defaultChecked />
          <FieldLabel htmlFor="field-mentions">Mentions</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="field-comments" />
          <FieldLabel htmlFor="field-comments">Comments</FieldLabel>
        </Field>
      </FieldGroup>
      <FieldSeparator />
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="field-digest">Weekly digest</FieldLabel>
          <FieldDescription>Every Monday at 9:00.</FieldDescription>
        </FieldContent>
        <Switch id="field-digest" defaultChecked />
      </Field>
    </FieldSet>
  )
}
