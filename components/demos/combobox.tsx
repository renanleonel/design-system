"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxVirtualList,
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

const CITIES = Array.from(
  { length: 10000 },
  (_, i) => `${TIMEZONES[i % TIMEZONES.length]} ${Math.floor(i / TIMEZONES.length) + 1}`
)

/**
 * 10,000 options: `virtualized` on the root and `ComboboxVirtualList` render
 * only the rows in view; filtering and arrow keys work across all of them.
 */
export function Virtualized() {
  return (
    <Combobox items={CITIES} virtualized>
      <ComboboxInput
        placeholder="Search 10,000 offices…"
        aria-label="Office"
        className="w-64"
      />
      <ComboboxContent>
        <ComboboxEmpty>No offices match.</ComboboxEmpty>
        <ComboboxVirtualList<string>>
          {(item) => <ComboboxItem value={item}>{item}</ComboboxItem>}
        </ComboboxVirtualList>
      </ComboboxContent>
    </Combobox>
  )
}
