"use client"

import { AvatarStack } from "@/components/ui/avatar-group"

const PEOPLE = [
  { name: "Ana Souza" },
  { name: "João Pedro de Oliveira Neto" },
  { name: "Maria Eduarda dos Santos Albuquerque Cavalcanti" },
  { name: "Renan Leonel" },
  { name: "Beatriz Lima" },
  { name: "Carlos Alberto Ferreira Jr." },
  { name: "Fernanda Costa" },
  { name: "Gabriel Rocha" },
]

/** The first four, then "+4" opening a list of the rest. */
export function Default() {
  return <AvatarStack people={PEOPLE} label="Project members" />
}

/** Sizes match `Avatar`. */
export function Sizes() {
  return (
    <div className="flex flex-col items-start gap-3">
      <AvatarStack people={PEOPLE} size="sm" max={5} label="Small" />
      <AvatarStack people={PEOPLE} max={5} label="Default" />
      <AvatarStack people={PEOPLE} size="lg" max={5} label="Large" />
    </div>
  )
}

/** Fits within `max`: no chip. */
export function NoOverflow() {
  return <AvatarStack people={PEOPLE.slice(0, 3)} label="Assignees" />
}

export function One() {
  return <AvatarStack people={PEOPLE.slice(0, 1)} label="Assignee" />
}

/** No people renders nothing visible. */
export function Empty() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <AvatarStack people={[]} label="Assignees" />
      Unassigned
    </div>
  )
}

/** 12,400 people (the list caps at 100), compound names, CJK and Arabic. */
export function WorstCase() {
  const crowd = Array.from({ length: 12400 }, (_, i) => ({
    name: `Pessoa Número ${i + 1} da Silva Albuquerque`,
  }))
  return (
    <div className="flex flex-col items-start gap-4">
      <AvatarStack
        label="Everyone"
        max={3}
        people={[
          { name: "Maria Eduarda dos Santos Albuquerque Cavalcanti" },
          { name: "田中太郎" },
          { name: "محمد علي" },
          ...crowd,
        ]}
      />
      <AvatarStack
        label="Reviewers"
        size="sm"
        max={2}
        people={[
          { name: "Jo" },
          {
            name: "ana.beatriz.fernandes.de.albuquerque@empresa-com-nome-muito-longo.com.br",
          },
          { name: "プロジェクト管理者" },
          { name: "مدير المشروع" },
        ]}
      />
    </div>
  )
}
