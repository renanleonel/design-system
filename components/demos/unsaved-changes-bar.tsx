"use client"

import * as React from "react"
import { toast } from "sonner"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { UnsavedChangesBar } from "@/components/ui/unsaved-changes-bar"

/** Edit the name: the bar rises in. Discard restores it; Save (Mod+S) keeps it. */
export function Default() {
  const [saved, setSaved] = React.useState("Acme")
  const [draft, setDraft] = React.useState(saved)
  const [saving, setSaving] = React.useState(false)
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true)
        await new Promise((r) => setTimeout(r, 800))
        setSaved(draft)
        setSaving(false)
        toast.success("Saved")
      }}
    >
      <Field>
        <FieldLabel htmlFor="ucb-name">Workspace name</FieldLabel>
        <Input
          id="ucb-name"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </Field>
      <UnsavedChangesBar
        open={draft !== saved}
        saving={saving}
        onDiscard={() => setDraft(saved)}
      />
    </form>
  )
}
