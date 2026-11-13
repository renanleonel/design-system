"use client"

import * as React from "react"
import { Controller } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel } from "@/components/ui/field"
import { Form, FormBanner, FormField, useZodForm } from "@/components/ui/form"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { LanguageSelect } from "@/components/ui/language-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingsList, SettingsRow } from "@/components/ui/settings-list"
import { SwatchPicker, type Swatch } from "@/components/ui/swatch-picker"
import { Switch } from "@/components/ui/switch"
import { ThemeSwitcher } from "@/components/ui/theme-toggle"
import { TimezoneSelect } from "@/components/ui/timezone-select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TokenInput } from "@/components/ui/token-input"
import { UnsavedChangesBar } from "@/components/ui/unsaved-changes-bar"

const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i

const schema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,40}$/, "Use 3–40 lowercase letters, numbers or dashes"),
  weekStart: z.enum(["monday", "sunday", "saturday"]),
  emailDomains: z
    .array(z.string())
    .refine((all) => all.every((d) => DOMAIN.test(d)), "Fix or remove the invalid domains"),
  accent: z.string(),
  language: z.string(),
  timezone: z.string().nullable(),
  dateFormat: z.enum(["MM/dd/yyyy", "dd/MM/yyyy", "yyyy-MM-dd"]),
  sendWithMod: z.boolean(),
  markdown: z.boolean(),
})

type Values = z.input<typeof schema>

const DEFAULTS: Values = {
  name: "Acme",
  slug: "acme",
  weekStart: "monday",
  emailDomains: ["acme.dev", "acme.com.br"],
  accent: "gray",
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  dateFormat: "dd/MM/yyyy",
  sendWithMod: true,
  markdown: true,
}

const WEEK_STARTS = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
  { value: "saturday", label: "Saturday" },
]

const ACCENTS: Swatch[] = (
  ["gray", "orange", "red", "green", "blue", "purple"] as const
).map((tone) => ({
  value: tone,
  label: tone[0].toUpperCase() + tone.slice(1),
  color: `var(--ds-tone-${tone})`,
}))

const DATE_FORMATS = [
  { value: "MM/dd/yyyy", label: "11/13/2026" },
  { value: "dd/MM/yyyy", label: "13/11/2026" },
  { value: "yyyy-MM-dd", label: "2026-11-13" },
] as const

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Workspace-wide preferences as a flat settings list: one row per setting,
 * saved together. Edits raise an unsaved-changes bar (Discard, Save or
 * Mod+S); the theme is per device and applies at once.
 */
export function GeneralSettings({ host = "acme.app" }: { host?: string }) {
  const form = useZodForm(schema, { defaultValues: DEFAULTS })
  const ids = {
    accent: React.useId(),
    locale: React.useId(),
    dates: React.useId(),
    messages: React.useId(),
    theme: React.useId(),
  }

  return (
    <Form
      form={form}
      onSubmit={async (values) => {
        await wait(800)
        form.reset(values)
        toast.success("Settings saved")
      }}
      className="gap-0"
    >
      <FormBanner className="mb-6" />
      <SettingsList>
        <FormField
          name="name"
          layout="row"
          label="Workspace name"
          description="Shown in the sidebar, emails and invites."
          render={(field) => <Input autoComplete="organization" {...field} />}
        />

        <FormField
          name="slug"
          layout="row"
          label="Workspace URL"
          badge={
            <Badge tone="green" className="text-xs">
              Live
            </Badge>
          }
          description="Changing it breaks old links to this workspace."
          render={(field) => (
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>{host}/</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput spellCheck={false} autoComplete="off" {...field} />
            </InputGroup>
          )}
        />

        <FormField
          name="weekStart"
          layout="row"
          label="First day of the week"
          description="Calendars, date pickers and weekly reports start here."
          render={({ value, onChange, onBlur, ref, ...field }) => (
            <Select
              items={WEEK_STARTS}
              value={value}
              onValueChange={(v) => v && onChange(v)}
            >
              <SelectTrigger {...field} ref={ref} onBlur={onBlur} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEK_STARTS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          name="emailDomains"
          layout="row"
          label="Allowed email domains"
          description="People with these addresses can join without an invite."
          render={({ value, onChange, ...field }) => (
            <TokenInput
              {...field}
              value={value}
              onValueChange={onChange}
              placeholder="example.com"
              validate={(d) =>
                DOMAIN.test(d) ? undefined : "not a domain like acme.dev"
              }
            />
          )}
        />

        <SettingsRow
          label="Accent color"
          labelId={`${ids.accent}-label`}
          description="Buttons, links and highlights across the workspace."
        >
          <Controller
            control={form.control}
            name="accent"
            render={({ field }) => (
              <SwatchPicker
                swatches={ACCENTS}
                value={field.value}
                onValueChange={field.onChange}
                aria-labelledby={`${ids.accent}-label`}
              />
            )}
          />
        </SettingsRow>

        <SettingsRow
          label="Language and time zone"
          description="Dates, numbers and reminders follow these."
        >
          <Controller
            control={form.control}
            name="language"
            render={({ field }) => (
              <Field className="w-full">
                <FieldLabel htmlFor={`${ids.locale}-language`}>Language</FieldLabel>
                <LanguageSelect
                  id={`${ids.locale}-language`}
                  size="default"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="w-full"
                />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <Field className="w-full">
                <FieldLabel htmlFor={`${ids.locale}-timezone`}>Time zone</FieldLabel>
                <TimezoneSelect
                  id={`${ids.locale}-timezone`}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Field>
            )}
          />
        </SettingsRow>

        <SettingsRow
          label="Date format"
          labelId={`${ids.dates}-label`}
          description="How dates appear in tables, exports and emails."
        >
          <Controller
            control={form.control}
            name="dateFormat"
            render={({ field }) => (
              <ToggleGroup
                variant="outline"
                spacing={0}
                value={[field.value]}
                onValueChange={(v) => v[0] && field.onChange(v[0])}
                aria-labelledby={`${ids.dates}-label`}
                // Fills the column on phones so three dates fit at 320px.
                className="w-full @2xl/settings:w-fit"
              >
                {DATE_FORMATS.map((f) => (
                  <ToggleGroupItem
                    key={f.value}
                    value={f.value}
                    className="flex-1 px-2 tabular-nums"
                  >
                    {f.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </SettingsRow>

        <SettingsRow
          label="Messages"
          labelId={`${ids.messages}-label`}
          description="Composer behavior for everyone in the workspace."
        >
          <div
            role="group"
            aria-labelledby={`${ids.messages}-label`}
            className="grid w-full gap-4"
          >
            <FormField
              name="sendWithMod"
              orientation="horizontal"
              label="Send with Mod+Enter"
              description="Enter adds a new line; Ctrl+Enter (⌘+Return on Mac) sends."
              render={({ value, onChange, ...field }) => (
                <Switch {...field} checked={value} onCheckedChange={onChange} />
              )}
            />
            <FormField
              name="markdown"
              orientation="horizontal"
              label="Markdown shortcuts"
              description="Typing **bold** or - list formats as you go."
              render={({ value, onChange, ...field }) => (
                <Switch {...field} checked={value} onCheckedChange={onChange} />
              )}
            />
          </div>
        </SettingsRow>

        <SettingsRow
          label="Theme"
          labelId={`${ids.theme}-label`}
          description="Saved on this device and applied right away."
        >
          <ThemeSwitcher showLabels />
        </SettingsRow>
      </SettingsList>

      <UnsavedChangesBar
        open={form.formState.isDirty}
        saving={form.formState.isSubmitting}
        onDiscard={() => form.reset()}
        className="mt-6"
      />
    </Form>
  )
}
