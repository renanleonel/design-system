"use client"

import { cn } from "cn"
import { LanguagesIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Language = {
  /** BCP 47 tag, e.g. "pt-BR". */
  value: string
  /** The language's own name ("Português"), so people find theirs. */
  label: string
}

export const LANGUAGES: Language[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
]

/**
 * Pick the interface language. Names are written in their own language and
 * script, each option carries its `lang` so screen readers pronounce it, and
 * touch devices get the native picker. Wire `onValueChange` to your i18n
 * router (next-intl, i18next…).
 */
export function LanguageSelect({
  value,
  defaultValue = "en",
  onValueChange,
  languages = LANGUAGES,
  compact = false,
  size = "sm",
  id,
  className,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  languages?: Language[]
  /** Icon and code only ("EN"), for tight headers. */
  compact?: boolean
  /** `default` matches form controls (settings); `sm` suits headers. */
  size?: "sm" | "default"
  /** For a visible `<label htmlFor>`. */
  id?: string
  className?: string
}) {
  return (
    <Select
      items={languages}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => v && onValueChange?.(v as string)}
      aria-label="Language"
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-label="Language"
        className={cn(compact ? "w-auto" : "w-44", className)}
      >
        <LanguagesIcon className="size-4 text-muted-foreground" />
        <SelectValue>
          {(current: string) => {
            const language = languages.find((l) => l.value === current)
            return compact
              ? current.split("-")[0].toUpperCase()
              : (language?.label ?? current)
          }}
        </SelectValue>
      </SelectTrigger>
      {/* The leading icon would shift a popup aligned to the value text: open below. */}
      <SelectContent alignItemWithTrigger={false}>
        {languages.map((language) => (
          <SelectItem
            key={language.value}
            value={language.value}
            lang={language.value}
          >
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
