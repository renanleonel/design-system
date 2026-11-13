"use client"

import * as React from "react"
import { ArrowRightIcon, PlusIcon, SaveIcon, TrashIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function Variants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="surface">Surface</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
    </div>
  )
}

export function WithIcon() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline">
        <PlusIcon data-icon="inline-start" />
        New project
      </Button>
      <Button>
        Continue
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button variant="destructive">
        <TrashIcon data-icon="inline-start" />
        Delete
      </Button>
    </div>
  )
}

/** The spinner slides in and the width animates both ways. Clicks are blocked while busy. */
export function Loading() {
  const [saving, setSaving] = React.useState(false)
  return (
    <Button
      loading={saving}
      onClick={() => {
        setSaving(true)
        setTimeout(() => setSaving(false), 1500)
      }}
    >
      <SaveIcon data-icon="inline-start" />
      Save changes
    </Button>
  )
}

/** Press Mod+S anywhere on the page. */
export function WithHotkey() {
  return (
    <Button
      variant="outline"
      hotkey="Mod+S"
      showHotkey
      onClick={() => toast.success("Saved")}
    >
      Save
    </Button>
  )
}

export function Disabled() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button disabled>Default</Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
    </div>
  )
}
