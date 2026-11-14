"use client"

import * as React from "react"
import { cn } from "cn"

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
 * is virtualized, so thousands of options stay fast. At rest, tags past
 * `maxVisible` fold into a "+N" chip; focusing the field shows them all.
 */
function MultiSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  maxVisible = 3,
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
  /** Tags shown while the field is not focused; the rest fold into "+N". */
  maxVisible?: number
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
      <ComboboxChips ref={anchor} className={cn("group/chips", className)}>
        <ComboboxValue>
          {(selected: Option[]) => {
            const hidden = selected.slice(maxVisible)
            return (
              <>
                {selected.map((item, i) => (
                  <ComboboxChip
                    key={item.value}
                    className={cn(
                      i >= maxVisible &&
                        "group-[:not(:focus-within)]/chips:hidden"
                    )}
                  >
                    {item.label}
                  </ComboboxChip>
                ))}
                {hidden.length > 0 && (
                  <span
                    title={hidden.map((item) => item.label).join(", ")}
                    className="flex h-[calc(--spacing(5.25))] items-center rounded-sm bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums group-focus-within/chips:hidden"
                  >
                    +{hidden.length}
                    <span className="sr-only">
                      {" "}
                      more: {hidden.map((item) => item.label).join(", ")}
                    </span>
                  </span>
                )}
                {/* Inside the render fn so the placeholder only shows when nothing is
                    selected, and the input collapses beside the tags at rest instead of
                    wrapping to its own line. */}
                <ComboboxChipsInput
                  ref={ref}
                  id={id}
                  className={cn(
                    selected.length > 0 &&
                      "group-[:not(:focus-within)]/chips:min-w-0"
                  )}
                  placeholder={selected.length === 0 ? placeholder : undefined}
                  onBlur={onBlur}
                  {...aria}
                />
              </>
            )
          }}
        </ComboboxValue>
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
