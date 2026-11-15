"use client"

import * as React from "react"
import { addMinutes, format, startOfDay, type Day, type Locale } from "date-fns"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormBanner,
  FormField,
  FormSubmit,
  useZodForm,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SwatchPicker } from "@/components/ui/swatch-picker"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { TimeRangeInput } from "@/components/ui/time-input"
import { TimezoneSelect } from "@/components/ui/timezone-select"
import {
  TONES,
  type EventTone,
  type ScheduleEvent,
  type ScheduleStrings,
} from "./schedule-utils"

const TONE_LABELS: Record<EventTone, [string, string]> = {
  blue: ["Blue", "Azul"],
  green: ["Green", "Verde"],
  amber: ["Amber", "Âmbar"],
  orange: ["Orange", "Laranja"],
  red: ["Red", "Vermelho"],
  purple: ["Purple", "Roxo"],
  gray: ["Gray", "Cinza"],
}

const HHMM = /^\d{2}:\d{2}$/

function schema(strings: ScheduleStrings) {
  return z
    .object({
      title: z.string().trim().min(1, strings.titleRequired).max(120),
      date: z.date(),
      allDay: z.boolean(),
      time: z.object({
        from: z.string().regex(HHMM).optional(),
        to: z.string().regex(HHMM).optional(),
      }),
      timeZone: z.string().min(1),
      tone: z.enum([
        "blue",
        "green",
        "amber",
        "orange",
        "red",
        "purple",
        "gray",
      ]),
      location: z.string().trim().max(120),
      description: z.string().trim().max(1000),
    })
    .refine(
      (v) => v.allDay || (v.time.from && v.time.to && v.time.to > v.time.from),
      { path: ["time"], message: strings.timeAfter }
    )
}

function at(day: Date, time: string) {
  const [h, m] = time.split(":").map(Number)
  const d = startOfDay(day)
  d.setHours(h, m)
  return d
}

export function EventDialog({
  start,
  onClose,
  onCreate,
  locale,
  weekStartsOn,
  strings,
  timeZone,
}: {
  start: Date | null
  onClose: () => void
  onCreate: (event: ScheduleEvent) => void
  locale: Locale
  weekStartsOn?: Day
  strings: ScheduleStrings
  /** Default time zone; "UTC" keeps server and client markup equal. */
  timeZone: string
}) {
  return (
    <Dialog open={start !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{strings.dialogTitle}</DialogTitle>
          <DialogDescription>{strings.dialogDescription}</DialogDescription>
        </DialogHeader>
        {start && (
          <EventForm
            key={start.getTime()}
            start={start}
            onClose={onClose}
            onCreate={onCreate}
            locale={locale}
            weekStartsOn={weekStartsOn}
            strings={strings}
            timeZone={timeZone}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EventForm({
  start,
  onClose,
  onCreate,
  locale,
  weekStartsOn,
  strings,
  timeZone,
}: {
  start: Date
  onClose: () => void
  onCreate: (event: ScheduleEvent) => void
  locale: Locale
  weekStartsOn?: Day
  strings: ScheduleStrings
  timeZone: string
}) {
  const pt = locale.code?.startsWith("pt")
  const form = useZodForm(schema(strings), {
    defaultValues: {
      title: "",
      date: startOfDay(start),
      allDay: false,
      time: {
        from: format(start, "HH:mm"),
        to: format(
          start.getHours() >= 23 ? at(start, "23:59") : addMinutes(start, 60),
          "HH:mm"
        ),
      },
      timeZone,
      tone: "blue",
      location: "",
      description: "",
    },
  })
  const allDay = form.watch("allDay")

  return (
    <Form
      form={form}
      className="gap-4"
      onSubmit={(v) => {
        onCreate({
          id: `new-${Math.random().toString(36).slice(2, 9)}`,
          title: v.title,
          allDay: v.allDay,
          start: v.allDay ? startOfDay(v.date) : at(v.date, v.time.from!),
          end: v.allDay ? startOfDay(v.date) : at(v.date, v.time.to!),
          tone: v.tone,
          location: v.location || undefined,
          description: v.description || undefined,
          timeZone: v.timeZone,
        })
        onClose()
      }}
    >
      <FormBanner />
      <FormField
        name="title"
        label={strings.title}
        required
        render={(field) => (
          <Input autoComplete="off" maxLength={120} {...field} />
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          name="date"
          label={strings.date}
          render={(field) => (
            <DatePicker
              id={field.id}
              value={field.value}
              onValueChange={(d) => d && field.onChange(d)}
              onBlur={field.onBlur}
              calendarProps={{ locale, weekStartsOn }}
            />
          )}
        />
        <FormField
          name="allDay"
          label={strings.allDayToggle}
          render={(field) => (
            <div className="flex h-control items-center">
              <Switch
                id={field.id}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />
      </div>
      {!allDay && (
        <FormField
          name="time"
          label={strings.time}
          render={(field) => (
            <TimeRangeInput
              id={field.id}
              value={field.value}
              onValueChange={field.onChange}
              interval={15}
            />
          )}
        />
      )}
      <FormField
        name="timeZone"
        label={strings.zone}
        render={(field) => (
          <TimezoneSelect
            id={field.id}
            value={field.value}
            onValueChange={(v) => v && field.onChange(v)}
          />
        )}
      />
      <FormField
        name="tone"
        label={strings.color}
        hideError
        render={(field) => (
          <SwatchPicker
            aria-label={strings.color}
            value={field.value}
            onValueChange={field.onChange}
            swatches={TONES.map((t) => ({
              value: t,
              label: TONE_LABELS[t][pt ? 1 : 0],
              color: `var(--ds-tone-${t})`,
            }))}
          />
        )}
      />
      <FormField
        name="location"
        label={strings.location}
        render={(field) => <Input autoComplete="off" {...field} />}
      />
      <FormField
        name="description"
        label={strings.notes}
        render={(field) => <Textarea rows={3} {...field} />}
      />
      <DialogFooter className="mt-1">
        <DialogClose render={<Button variant="outline" type="button" />}>
          {strings.cancel}
        </DialogClose>
        <FormSubmit>{strings.save}</FormSubmit>
      </DialogFooter>
    </Form>
  )
}
