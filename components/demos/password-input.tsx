"use client"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"

/** The eye shows and hides it; a warning appears while Caps Lock is on. */
export function Default() {
  return (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="password-current">Password</FieldLabel>
      <PasswordInput id="password-current" />
    </Field>
  )
}

/** Sign-up: `new-password` lets password managers suggest one. */
export function NewPassword() {
  return (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="password-new">New password</FieldLabel>
      <PasswordInput
        id="password-new"
        autoComplete="new-password"
        aria-describedby="password-new-hint"
      />
      <FieldDescription id="password-new-hint">
        At least 12 characters.
      </FieldDescription>
    </Field>
  )
}

export function Disabled() {
  return (
    <PasswordInput
      aria-label="Password"
      defaultValue="correct horse"
      disabled
      className="max-w-xs"
    />
  )
}
