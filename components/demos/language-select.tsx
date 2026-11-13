"use client"

import * as React from "react"
import { toast } from "sonner"

import { LanguageSelect } from "@/components/ui/language-select"

export function Default() {
  const [language, setLanguage] = React.useState("pt-BR")
  return (
    <LanguageSelect
      value={language}
      onValueChange={(next) => {
        setLanguage(next)
        toast(`Language set to ${next}`)
      }}
    />
  )
}

/** Icon and code only, for headers and footers. */
export function Compact() {
  return <LanguageSelect compact defaultValue="en" />
}

export function CustomList() {
  return (
    <LanguageSelect
      defaultValue="pt-PT"
      languages={[
        { value: "pt-PT", label: "Português (Portugal)" },
        { value: "pt-BR", label: "Português (Brasil)" },
        { value: "en-GB", label: "English (UK)" },
      ]}
    />
  )
}
