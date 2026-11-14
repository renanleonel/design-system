"use client"

import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"
import { HexAlphaColorPicker, HexColorPicker } from "react-colorful"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SwatchPicker, type Swatch } from "@/components/ui/swatch-picker"
import { useControllableState } from "@/hooks/use-controllable-state"

export type ColorPreset = {
  /** A hex color (`#1a73e8`). */
  value: string
  /** Read by screen readers and shown as a tooltip. */
  label: string
}

/** `#abc` / `#aabbcc` (+ alpha digits when `alpha`) to lowercase `#rrggbb[aa]`. */
function parseHex(text: string, alpha: boolean): string | null {
  const match = /^#?([0-9a-f]+)$/i.exec(text.trim())
  if (!match) return null
  let digits = match[1].toLowerCase()
  const lengths = alpha ? [3, 4, 6, 8] : [3, 6]
  if (!lengths.includes(digits.length)) return null
  if (digits.length <= 4) digits = [...digits].map((d) => d + d).join("")
  return `#${digits}`
}

/** Whether a dark or light check mark reads on this color. */
function checkColor(hex: string) {
  const parsed = parseHex(hex, true)
  if (!parsed) return undefined
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(parsed.slice(i, i + 2), 16))
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.55 ? "var(--foreground)" : "var(--background)"
}

// Checkerboard under translucent colors, built from theme vars.
const CHECKER =
  "repeating-conic-gradient(var(--muted) 0 25%, var(--background) 0 50%)"

function ColorDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_20%,transparent)]",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(${color}, ${color}), ${CHECKER}`,
        backgroundSize: "auto, 8px 8px",
      }}
    />
  )
}

/**
 * react-colorful's parts, restyled with theme vars. Library selectors are one
 * class deep, so these two-class selectors win without `!important`.
 */
const PICKER_STYLES = cn(
  String.raw`[&_.react-colorful]:h-auto! [&_.react-colorful]:w-full! [&_.react-colorful]:gap-3!`,
  String.raw`[&_.react-colorful\_\_saturation]:h-36! [&_.react-colorful\_\_saturation]:rounded-lg!`,
  String.raw`[&_.react-colorful\_\_hue]:h-3! [&_.react-colorful\_\_hue]:rounded-full!`,
  String.raw`[&_.react-colorful\_\_alpha]:h-3! [&_.react-colorful\_\_alpha]:rounded-full!`,
  String.raw`[&_.react-colorful\_\_hue]:mt-0! [&_.react-colorful\_\_alpha]:mt-0!`,
  String.raw`[&_.react-colorful\_\_interactive]:rounded-[inherit]!`,
  String.raw`[&_.react-colorful\_\_interactive:focus-visible]:outline-2! [&_.react-colorful\_\_interactive:focus-visible]:outline-offset-2! [&_.react-colorful\_\_interactive:focus-visible]:outline-(--ds-focus-ring)!`,
  String.raw`[&_.react-colorful\_\_pointer]:size-5! [&_.react-colorful\_\_pointer]:border-2! [&_.react-colorful\_\_pointer]:border-background! [&_.react-colorful\_\_pointer]:shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_35%,transparent)]!`
)

/**
 * A color field: a swatch and hex value that open a saturation / hue (and
 * optionally alpha) area, a hex input and preset swatches. The value is a
 * lowercase hex string, `#rrggbb` (`#rrggbbaa` with `alpha`). Invalid hex typed
 * into the input never reaches `onValueChange` and reverts on blur. Name it with
 * `aria-label` or `aria-labelledby`.
 */
function ColorPicker({
  value,
  defaultValue = "#000000",
  onValueChange,
  alpha = false,
  presets,
  disabled,
  name,
  id,
  className,
  ref,
  ...aria
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Adds an opacity slider and 8-digit hex. */
  alpha?: boolean
  /** Quick picks under the hex input. */
  presets?: ColorPreset[]
  disabled?: boolean
  /** Submits the hex value with a form. */
  name?: string
  id?: string
  className?: string
  ref?: React.Ref<HTMLButtonElement>
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}) {
  const [color, setColor] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  // What the user is typing; null while the input mirrors the color.
  const [draft, setDraft] = React.useState<string | null>(null)
  const errorId = React.useId()
  const valueId = React.useId()

  const text = draft ?? color.replace(/^#/, "")
  const invalid = draft !== null && parseHex(draft, alpha) === null

  const swatches: Swatch[] | undefined = presets?.map((preset) => ({
    value: parseHex(preset.value, alpha) ?? preset.value,
    label: preset.label,
    color: preset.value,
    foreground: checkColor(preset.value),
  }))
  const selected = swatches?.find((s) => s.value === color.toLowerCase())

  const Picker = alpha ? HexAlphaColorPicker : HexColorPicker

  return (
    <Popover onOpenChange={(open) => !open && setDraft(null)}>
      <PopoverTrigger
        ref={ref}
        id={id}
        disabled={disabled}
        data-slot="color-picker"
        className={cn(
          "group/color-picker flex h-control w-48 min-w-0 items-center gap-2 rounded-control border border-input bg-transparent ps-2 pe-2 text-start text-sm whitespace-nowrap focus-ring transition-colors outline-none select-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          className
        )}
        {...aria}
        // The name keeps the visible hex in it (WCAG 2.5.3).
        aria-label={
          aria["aria-label"] ? `${aria["aria-label"]}: ${color}` : undefined
        }
        aria-labelledby={
          aria["aria-labelledby"]
            ? `${aria["aria-labelledby"]} ${valueId}`
            : undefined
        }
      >
        <ColorDot color={color} />
        <span
          id={valueId}
          className="min-w-0 flex-1 truncate font-mono text-xs tabular-nums uppercase">
          {color}
        </span>
        <ChevronDownIcon className="text-muted-foreground transition-transform duration-(--ds-duration-popover) ease-out group-data-popup-open/color-picker:rotate-180 motion-reduce:transition-none" />
      </PopoverTrigger>
      {name && <input type="hidden" name={name} value={color} />}
      <PopoverContent
        align="start"
        aria-label="Choose a color"
        className="w-64 gap-3"
      >
        <div dir="ltr" className={PICKER_STYLES}>
          <Picker
            color={color}
            onChange={(next) => {
              setDraft(null)
              setColor(next.toLowerCase())
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <InputGroup>
            <InputGroupAddon>
              <span aria-hidden>#</span>
            </InputGroupAddon>
            <InputGroupInput
              value={text}
              onChange={(event) => {
                const next = event.target.value.replace(/^#/, "")
                setDraft(next)
                const parsed = parseHex(next, alpha)
                if (parsed) setColor(parsed)
              }}
              onBlur={() => setDraft(null)}
              maxLength={alpha ? 9 : 7}
              spellCheck={false}
              autoComplete="off"
              aria-label="Hex color"
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              className="font-mono tabular-nums uppercase"
            />
          </InputGroup>
          {invalid && (
            <p id={errorId} className="text-xs text-destructive">
              {alpha
                ? "Use 3, 4, 6 or 8 hex digits, like 1a73e8."
                : "Use 3 or 6 hex digits, like 1a73e8."}
            </p>
          )}
        </div>
        {swatches && swatches.length > 0 && (
          <SwatchPicker
            swatches={swatches}
            value={selected?.value ?? null}
            onValueChange={(next) => {
              setDraft(null)
              setColor(next)
            }}
            size="sm"
            className="gap-2.5 px-1 py-1"
            aria-label="Preset colors"
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

export { ColorPicker }
