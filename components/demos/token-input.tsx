"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { TokenInput } from "@/components/ui/token-input"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Enter or comma adds; pasting a list adds each entry. Invalid entries stay,
 * marked, so they can be fixed.
 */
export function Default() {
  const [emails, setEmails] = React.useState([
    "ana.souza@acme.dev",
    "joao.silva@acme",
  ])
  return (
    <Field className="max-w-md">
      <FieldLabel htmlFor="invite-emails">Invite by email</FieldLabel>
      <TokenInput
        id="invite-emails"
        value={emails}
        onValueChange={setEmails}
        validate={(t) => (EMAIL.test(t) ? undefined : "not a valid email")}
        placeholder="name@company.com"
        aria-describedby="invite-emails-hint"
      />
      <FieldDescription id="invite-emails-hint">
        Separate with commas, or paste a list.
      </FieldDescription>
    </Field>
  )
}

/** `max` stops adding once reached. */
export function WithMax() {
  return (
    <TokenInput
      defaultValue={["design", "billing"]}
      max={3}
      placeholder="Up to 3 keywords…"
      aria-label="Keywords"
      className="max-w-md"
    />
  )
}

export function Disabled() {
  return (
    <TokenInput
      defaultValue={["acme.dev", "acme.com.br"]}
      disabled
      aria-label="Domains"
      className="max-w-md"
    />
  )
}
