"use client"

import * as React from "react"
import { GlobeIcon } from "lucide-react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxVirtualList,
} from "@/components/ui/combobox"
import { InputGroupAddon } from "@/components/ui/input-group"

type Zone = {
  /** IANA id, e.g. "America/Sao_Paulo". */
  value: string
  /** "America / Sao Paulo". */
  label: string
  /** "GMT-3"; empty until mounted (it depends on the date, DST). */
  offset: string
  minutes: number
}

const noop = () => () => {}
const useMounted = () =>
  React.useSyncExternalStore(
    noop,
    () => true,
    () => false
  )

const labelOf = (id: string) => id.replaceAll("_", " ").replaceAll("/", " / ")

function offsetOf(id: string, now: Date) {
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: id, timeZoneName: "shortOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT"
  const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name)
  const minutes = m
    ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0))
    : 0
  return { offset: name === "GMT" ? "GMT+0" : name, minutes }
}

let cached: Zone[] | null = null
function zones(withOffsets: boolean): Zone[] {
  const ids =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : []
  const all = ids.includes("UTC") ? ids : ["UTC", ...ids]
  if (!withOffsets)
    return all.map((value) => ({ value, label: labelOf(value), offset: "", minutes: 0 }))
  // ~420 formatters: build once per page load.
  if (cached) return cached
  const now = new Date()
  cached = all
    .map((value) => ({ value, label: labelOf(value), ...offsetOf(value, now) }))
    .sort((a, b) => a.minutes - b.minutes || a.label.localeCompare(b.label))
  return cached
}

/**
 * Search every IANA time zone (~420) by city, region or offset ("GMT-3"). The
 * list is virtualized. Offsets follow today's date (DST) and appear after
 * mount, so server and client render the same. Values are IANA ids; default
 * to the browser's with `Intl.DateTimeFormat().resolvedOptions().timeZone`
 * read in an event or after mount.
 */
function TimezoneSelect({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Search time zones…",
  id,
  disabled,
  className,
  ...aria
}: {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  id?: string
  disabled?: boolean
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
}) {
  const mounted = useMounted()
  const items = React.useMemo(() => zones(mounted), [mounted])
  const byValue = React.useMemo(
    () => new Map(items.map((z) => [z.value, z])),
    [items]
  )
  const toZone = (v: string | null | undefined) =>
    v == null ? v : (byValue.get(v) ?? { value: v, label: labelOf(v), offset: "", minutes: 0 })

  return (
    <Combobox
      items={items}
      virtualized
      value={toZone(value)}
      defaultValue={toZone(defaultValue)}
      onValueChange={(zone: Zone | null) => onValueChange?.(zone?.value ?? null)}
      itemToStringLabel={(zone: Zone) => zone.label}
      itemToStringValue={(zone: Zone) => zone.value}
      isItemEqualToValue={(a: Zone, b: Zone) => a.value === b.value}
      filter={(zone: Zone, query: string) => {
        const q = query.trim().toLowerCase()
        return (
          !q ||
          zone.label.toLowerCase().includes(q) ||
          zone.value.toLowerCase().includes(q) ||
          zone.offset.toLowerCase().includes(q)
        )
      }}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        className={className ?? "w-full"}
        disabled={disabled}
        {...aria}
      >
        <InputGroupAddon>
          <GlobeIcon />
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>No time zones match.</ComboboxEmpty>
        <ComboboxVirtualList<Zone>>
          {(zone) => (
            <ComboboxItem value={zone}>
              <span className="truncate">{zone.label}</span>
              <span className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                {zone.offset}
              </span>
            </ComboboxItem>
          )}
        </ComboboxVirtualList>
      </ComboboxContent>
    </Combobox>
  )
}

export { TimezoneSelect }
