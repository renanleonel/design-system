"use client"

import { toast } from "sonner"
import { z } from "zod"

import {
  DatePicker,
  DateRangePicker,
  DateTimePicker,
} from "@/components/ui/date-picker"
import { Field, FieldLabel } from "@/components/ui/field"
import { Form, FormField, FormSubmit, useZodForm } from "@/components/ui/form"

// Fixed dates: render-time `new Date()` differs between server and browser.
const TODAY = new Date(2026, 10, 13)
const IN_THREE_DAYS = new Date(2026, 10, 16)

/** A field that opens a calendar; picking a day closes it. */
export function Default() {
  return (
    <Field className="w-60">
      <FieldLabel htmlFor="dp-due">Due date</FieldLabel>
      <DatePicker id="dp-due" placeholder="Pick a date" className="w-full" />
    </Field>
  )
}

/** First click starts the range, the second ends it and closes. */
export function Range() {
  return (
    <Field className="w-72">
      <FieldLabel htmlFor="dp-period">Report period</FieldLabel>
      <DateRangePicker id="dp-period" className="w-full" />
    </Field>
  )
}

/** A day and a time slot in one field; picking the time closes it. */
export function DateTime() {
  return (
    <Field className="w-72">
      <FieldLabel htmlFor="dp-meeting">Meeting</FieldLabel>
      <DateTimePicker
        id="dp-meeting"
        defaultValue={new Date(2026, 10, 13, 14, 30)}
        className="w-full"
      />
    </Field>
  )
}

/** Month and year pickers in the caption: far dates in a few clicks. */
export function BirthDate() {
  return (
    <Field className="w-60">
      <FieldLabel htmlFor="dp-birth">Date of birth</FieldLabel>
      <DatePicker
        id="dp-birth"
        className="w-full"
        captionLayout="dropdown"
        startMonth={new Date(1920, 0)}
        endMonth={TODAY}
        defaultValue={new Date(1990, 0, 10)}
        disabledDays={{ after: TODAY }}
      />
    </Field>
  )
}

/** Optional dates get a clear button; past days are disabled. */
export function ClearableFuture() {
  return (
    <Field className="w-60">
      <FieldLabel htmlFor="dp-delivery">Delivery date</FieldLabel>
      <DatePicker
        id="dp-delivery"
        className="w-full"
        clearable
        defaultValue={IN_THREE_DAYS}
        disabledDays={{ before: TODAY }}
      />
    </Field>
  )
}

const schema = z.object({
  start: z.date({ error: "Pick a start date" }),
  period: z
    .object({ from: z.date().optional(), to: z.date().optional() })
    .optional()
    .refine((r) => r?.from && r.to, "Pick the first and last day"),
})

/**
 * With React Hook Form: errors appear once the calendar closes empty or on
 * submit, and a failed submit focuses the field.
 */
export function InAForm() {
  const form = useZodForm(schema)
  return (
    <Form
      form={form}
      onSubmit={() => {
        toast.success("Saved")
      }}
      className="w-full max-w-xs"
    >
      <FormField
        name="start"
        label="Start date"
        render={({ value, onChange, ...field }) => (
          <DatePicker
            {...field}
            value={value ?? null}
            onValueChange={onChange}
            className="w-full"
          />
        )}
      />
      <FormField
        name="period"
        label="Billing period"
        description="Invoices cover these days."
        render={({ value, onChange, ...field }) => (
          <DateRangePicker
            {...field}
            value={value?.from ? { from: value.from, to: value.to } : null}
            onValueChange={onChange}
            className="w-full"
          />
        )}
      />
      <FormSubmit className="justify-self-start">Save</FormSubmit>
    </Form>
  )
}
