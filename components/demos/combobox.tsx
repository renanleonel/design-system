"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

const TIMEZONES = [
  "Amsterdam",
  "Berlin",
  "Buenos Aires",
  "Lisbon",
  "London",
  "Los Angeles",
  "New York",
  "São Paulo",
  "Singapore",
  "Tokyo",
]

export function Default() {
  return (
    <Combobox items={TIMEZONES}>
      <ComboboxInput
        placeholder="Search timezones…"
        aria-label="Timezone"
        className="w-64"
      />
      <ComboboxContent>
        <ComboboxEmpty>No timezones match.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

/** A clear button appears once there is a value. */
export function Clearable() {
  return (
    <Combobox items={TIMEZONES} defaultValue="Lisbon">
      <ComboboxInput
        showClear
        placeholder="Search timezones…"
        aria-label="Timezone"
        className="w-64"
      />
      <ComboboxContent>
        <ComboboxEmpty>No timezones match.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
