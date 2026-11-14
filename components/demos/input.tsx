"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function Default() {
  return (
    <Input
      placeholder="Project name"
      aria-label="Project name"
      className="max-w-xs"
    />
  )
}

export function WithLabel() {
  return (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="input-email">Email</FieldLabel>
      <Input id="input-email" type="email" placeholder="name@company.com" />
      <FieldDescription>We only use it to sign you in.</FieldDescription>
    </Field>
  )
}

export function Invalid() {
  return (
    <Field className="max-w-xs" data-invalid>
      <FieldLabel htmlFor="input-slug">Slug</FieldLabel>
      <Input id="input-slug" defaultValue="My Project" aria-invalid />
      <FieldError>Use lowercase letters, numbers and dashes.</FieldError>
    </Field>
  )
}

export function Disabled() {
  return (
    <Input
      disabled
      defaultValue="acme-inc"
      aria-label="Workspace"
      className="max-w-xs"
    />
  )
}

export function Clearable() {
  return (
    <Input
      clearable
      defaultValue="Quarterly report"
      aria-label="Document title"
      className="max-w-xs"
    />
  )
}

/** `copyable`: a copy button; read-only, the text selects on focus too. */
export function Copyable() {
  return (
    <Input
      readOnly
      copyable
      value="sk_live_51Hx8pQ2eZvKYlo2C"
      aria-label="API key"
      className="max-w-xs font-mono"
    />
  )
}

export function File() {
  return <Input type="file" aria-label="Upload" className="max-w-xs" />
}
