"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SettingsList, SettingsRow } from "@/components/ui/settings-list"
import { Switch } from "@/components/ui/switch"

/** Title and description beside the control; stacked when narrow. */
export function Default() {
  const id = React.useId()
  return (
    <SettingsList className="w-full max-w-3xl">
      <SettingsRow
        label="Workspace name"
        description="Shown in the sidebar, emails and invites."
        htmlFor={`${id}-name`}
        descriptionId={`${id}-name-description`}
      >
        <Input
          id={`${id}-name`}
          defaultValue="Acme"
          aria-describedby={`${id}-name-description`}
        />
      </SettingsRow>
      <SettingsRow
        label="Single sign-on"
        badge={
          <Badge tone="purple" className="text-xs">
            Business
          </Badge>
        }
        description="Require SAML sign-in for everyone in the workspace."
      >
        <Button variant="outline">Set up SSO</Button>
      </SettingsRow>
      <SettingsRow
        label="Export data"
        description="A ZIP of every project, emailed to you within an hour."
      >
        <Button variant="outline">Request export</Button>
      </SettingsRow>
    </SettingsList>
  )
}

/**
 * Switch rows: the switch sits top-aligned with its title, the description
 * under the title. Built from `Field orientation="horizontal"`.
 */
export function SwitchRows() {
  const id = React.useId()
  return (
    <SettingsList className="w-full max-w-3xl">
      <SettingsRow
        label="Notifications"
        labelId={`${id}-label`}
        description="What reaches your inbox."
      >
        <div
          role="group"
          aria-labelledby={`${id}-label`}
          className="grid w-full gap-4"
        >
          <Field orientation="horizontal">
            <Switch id={`${id}-mentions`} defaultChecked />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-mentions`}>Mentions</FieldLabel>
              <FieldDescription>When someone @mentions you.</FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <Switch id={`${id}-digest`} />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-digest`}>Weekly digest</FieldLabel>
              <FieldDescription>
                A Monday summary of activity in your projects.
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>
      </SettingsRow>
    </SettingsList>
  )
}
