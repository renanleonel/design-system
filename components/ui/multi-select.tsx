"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxValue,
  ComboboxVirtualList,
  useComboboxAnchor,
} from "@/components/ui/combobox"

type Option = { value: string; label: string }

/**
 * Pick several values as removable tags, with type-to-filter (interaction.md:
 * 8+ options want a searchable control). Values are plain strings; labels come
 * from `options`. Backspace in the empty input removes the last tag. The list
 * is virtualized, so thousands of options stay fast.
 */
function MultiSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  emptyMessage = "No matches.",
  id,
  name,
  disabled,
  className,
  ref,
  onBlur,
  ...aria
}: {
  options: Option[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  emptyMessage?: React.ReactNode
  id?: string
  name?: string
  disabled?: boolean
  className?: string
  /** Forwarded to the text input, so a form can focus it on error. */
  ref?: React.Ref<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
}) {
  const anchor = useComboboxAnchor()
  const index = React.useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options]
  )
  const byValue = (values: string[] | undefined) =>
    values?.map((v) => index.get(v) ?? { value: v, label: v })

  return (
    <Combobox
      multiple
      virtualized
      items={options}
      value={byValue(value)}
      defaultValue={byValue(defaultValue)}
      onValueChange={(items: Option[]) =>
        onValueChange?.(items.map((item) => item.value))
      }
      itemToStringLabel={(item: Option) => item.label}
      itemToStringValue={(item: Option) => item.value}
      isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
      name={name}
      disabled={disabled}
    >
      <ComboboxChips ref={anchor} className={className}>
        <ComboboxValue>
          {(selected: Option[]) =>
            selected.map((item) => (
              <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput
          ref={ref}
          id={id}
          placeholder={placeholder}
          onBlur={onBlur}
          {...aria}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxVirtualList<Option>>
          {(item) => <ComboboxItem value={item}>{item.label}</ComboboxItem>}
        </ComboboxVirtualList>
      </ComboboxContent>
    </Combobox>
  )
}

export { MultiSelect, type Option as MultiSelectOption }
