"use client"

import * as React from "react"

import { InlineEdit } from "@/components/ui/inline-edit"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Click (or Tab to it and press Enter) to edit; Enter or blur saves, Escape cancels. */
export function Default() {
  return (
    <div className="w-full max-w-xs">
      <InlineEdit label="Project name" defaultValue="Website redesign" />
    </div>
  )
}

/** Saves optimistically over 800ms. Typing "fail" rolls back with a Retry toast. */
export function AsyncSave() {
  const [name, setName] = React.useState("Quarterly report")
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <InlineEdit
        label="Report title"
        value={name}
        onValueChange={setName}
        onSubmit={async (next) => {
          await wait(800)
          if (next.toLowerCase() === "fail") throw new Error("Server said no.")
        }}
      />
      <p className="text-sm text-muted-foreground">Saved: {name}</p>
    </div>
  )
}

/** Validation keeps the field open with the message under it. */
export function Validation() {
  return (
    <div className="w-full max-w-xs">
      <InlineEdit
        label="Username"
        defaultValue="renan"
        validate={(v) =>
          v.trim().length < 3
            ? "Use at least 3 characters."
            : /\s/.test(v)
              ? "No spaces allowed."
              : null
        }
      />
    </div>
  )
}

/** Sized by `inputClassName`, like a page title. */
export function Heading() {
  return (
    <div className="w-full max-w-md">
      <InlineEdit
        label="Page title"
        defaultValue="Planning notes"
        inputClassName="text-xl font-semibold pointer-fine:text-xl"
      />
    </div>
  )
}

export function Disabled() {
  return (
    <div className="w-full max-w-xs">
      <InlineEdit label="Owner" defaultValue="Ana Souza" disabled />
    </div>
  )
}

/** Empty shows the placeholder. */
export function Empty() {
  return (
    <div className="w-full max-w-xs">
      <InlineEdit label="Nickname" placeholder="Add a nickname" />
    </div>
  )
}

/** Long compound names, an unbreakable 50-character word, CJK and Arabic. */
export function WorstCase() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-1">
      <InlineEdit
        label="Name"
        defaultValue="Maria Eduarda dos Santos Albuquerque Cavalcanti"
      />
      <InlineEdit
        label="Token"
        defaultValue="Supercalifragilisticexpialidocious_0123456789_abcdef"
      />
      <InlineEdit label="Título" defaultValue="プロジェクトの名前を変更する" />
      <InlineEdit label="الاسم" defaultValue="اسم المشروع الطويل جدا" />
    </div>
  )
}
