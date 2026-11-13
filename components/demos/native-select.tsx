"use client"

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"

export function Default() {
  return (
    <NativeSelect defaultValue="pro" aria-label="Plan">
      <NativeSelectOption value="hobby">Hobby</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
      <NativeSelectOption value="enterprise">Enterprise</NativeSelectOption>
    </NativeSelect>
  )
}

export function Grouped() {
  return (
    <NativeSelect defaultValue="" aria-label="Region">
      <NativeSelectOption value="" disabled>
        Pick a region
      </NativeSelectOption>
      <NativeSelectOptGroup label="Europe">
        <NativeSelectOption value="fra">Frankfurt</NativeSelectOption>
        <NativeSelectOption value="lhr">London</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Americas">
        <NativeSelectOption value="iad">Virginia</NativeSelectOption>
        <NativeSelectOption value="gru">São Paulo</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  )
}
