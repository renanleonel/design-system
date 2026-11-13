"use client"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

export function Default() {
  return (
    <Field orientation="horizontal" className="w-auto">
      <Switch id="switch-emails" defaultChecked />
      <FieldLabel htmlFor="switch-emails">Email notifications</FieldLabel>
    </Field>
  )
}

/** Settings rows: label and description first, the switch at the end. */
export function SettingRow() {
  return (
    <Field orientation="horizontal" className="max-w-sm">
      <FieldContent>
        <FieldLabel htmlFor="switch-2fa">Two-factor authentication</FieldLabel>
        <FieldDescription>Ask for a code on new devices.</FieldDescription>
      </FieldContent>
      <Switch id="switch-2fa" />
    </Field>
  )
}

export function Small() {
  return (
    <Field orientation="horizontal" className="w-auto">
      <Switch id="switch-sm" size="sm" defaultChecked />
      <FieldLabel htmlFor="switch-sm">Compact</FieldLabel>
    </Field>
  )
}

export function Disabled() {
  return (
    <Field orientation="horizontal" className="w-auto">
      <Switch id="switch-disabled" disabled />
      <FieldLabel htmlFor="switch-disabled">Beta features</FieldLabel>
    </Field>
  )
}
