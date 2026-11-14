"use client"

import * as React from "react"

import {
  EditableTable,
  type CellChange,
  type EditableColumn,
} from "./editable-table"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

type Stage = "lead" | "qualified" | "proposal" | "won" | "lost"

export type Deal = {
  id: string
  name: string
  company: string
  owner: string
  stage: Stage
  value: number
  probability: number
}

const OWNERS = [
  "Renan Leonel",
  "Ana Souza",
  "João Pedro de Oliveira Neto",
  "Maria Eduarda Albuquerque",
  "Lucas Ferreira",
]

const STAGES: {
  value: Stage
  label: string
  tone: "gray" | "blue" | "amber" | "green" | "red"
}[] = [
  { value: "lead", label: "Lead", tone: "gray" },
  { value: "qualified", label: "Qualified", tone: "blue" },
  { value: "proposal", label: "Proposal", tone: "amber" },
  { value: "won", label: "Won", tone: "green" },
  { value: "lost", label: "Lost", tone: "red" },
]

const SAMPLE: Deal[] = [
  {
    id: "d1",
    name: "Annual renewal",
    company: "Northwind Logística",
    owner: "Ana Souza",
    stage: "proposal",
    value: 84000,
    probability: 70,
  },
  {
    id: "d2",
    name: "Seat expansion",
    company: "Café Pilão Digital",
    owner: "Renan Leonel",
    stage: "qualified",
    value: 32500,
    probability: 40,
  },
  {
    id: "d3",
    name: "Enterprise pilot",
    company: "Banco Aurora",
    owner: "João Pedro de Oliveira Neto",
    stage: "lead",
    value: 250000,
    probability: 15,
  },
  {
    id: "d4",
    name: "Analytics add-on",
    company: "Mercado Verde",
    owner: "Maria Eduarda Albuquerque",
    stage: "won",
    value: 18900,
    probability: 100,
  },
  {
    id: "d5",
    name: "Migration services",
    company: "Construtora Horizonte",
    owner: "Lucas Ferreira",
    stage: "proposal",
    value: 61200,
    probability: 55,
  },
  {
    id: "d6",
    name: "Support upgrade",
    company: "Clínica Bem Viver",
    owner: "Ana Souza",
    stage: "lost",
    value: 9600,
    probability: 0,
  },
  {
    id: "d7",
    name: "Multi-region rollout",
    company: "Transportes Rápido Sul",
    owner: "Renan Leonel",
    stage: "qualified",
    value: 142000,
    probability: 35,
  },
]

const brl = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Stand-in for your API. Deals over R$1M are refused, like a server-side rule
 * the client doesn't know about; `failAll` refuses everything.
 */
async function saveDeal(change: CellChange<Deal>, failAll: boolean) {
  await wait(600 + Math.random() * 600)
  if (failAll) throw new Error("The server is unavailable. Try again.")
  if (change.columnId === "value" && Number(change.value) > 1_000_000)
    throw new Error("Deals over R$1,000,000 need a manager's approval.")
}

const columns: EditableColumn<Deal>[] = [
  {
    id: "name",
    header: "Deal",
    value: (d) => d.name,
    editor: { type: "text", placeholder: "Deal name" },
    validate: (v) => (String(v) ? undefined : "A deal needs a name."),
    className: "min-w-44",
  },
  {
    id: "company",
    header: "Company",
    value: (d) => d.company,
    editor: { type: "text" },
    validate: (v) => (String(v) ? undefined : "Add the company."),
    className: "min-w-48",
  },
  {
    id: "owner",
    header: "Owner",
    value: (d) => d.owner,
    editor: {
      type: "select",
      options: OWNERS.map((o) => ({ value: o, label: o })),
    },
    className: "min-w-48 max-w-56",
  },
  {
    id: "stage",
    header: "Stage",
    value: (d) => d.stage,
    editor: {
      type: "select",
      options: STAGES.map(({ value, label }) => ({ value, label })),
    },
    render: (v) => {
      const stage = STAGES.find((s) => s.value === v)
      return stage ? <Badge tone={stage.tone}>{stage.label}</Badge> : v
    },
    className: "w-36",
  },
  {
    id: "value",
    header: "Value",
    value: (d) => d.value,
    editor: { type: "number", min: 0 },
    render: (v) => brl.format(Number(v)),
    align: "end",
    className: "w-36",
  },
  {
    id: "probability",
    header: "Probability",
    value: (d) => d.probability,
    editor: { type: "number", min: 0, max: 100 },
    render: (v) => `${v}%`,
    align: "end",
    className: "w-32",
  },
]

/** The pipeline: every cell saves on its own, optimistically. */
export function DealsTable({
  initialDeals = SAMPLE,
}: {
  initialDeals?: Deal[]
}) {
  const [deals, setDeals] = React.useState(initialDeals)
  const [failAll, setFailAll] = React.useState(false)

  const total = deals
    .filter((d) => d.stage !== "lost")
    .reduce((sum, d) => sum + d.value * (d.probability / 100), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Weighted pipeline{" "}
          <span className="font-medium text-foreground tabular-nums">
            {brl.format(total)}
          </span>
        </p>
        <Field orientation="horizontal" className="w-auto">
          <Switch
            id="simulate-errors"
            checked={failAll}
            onCheckedChange={setFailAll}
          />
          <FieldLabel htmlFor="simulate-errors">
            Simulate server errors
          </FieldLabel>
        </Field>
      </div>
      <EditableTable
        aria-label="Deals"
        rows={deals}
        columns={columns}
        getRowId={(d) => d.id}
        getRowLabel={(d) => d.name}
        onCommit={async (change) => {
          await saveDeal(change, failAll)
          // Saved: apply it to the data before resolving, so the cell never
          // flashes the old value (with TanStack Query: setQueryData here).
          setDeals((prev) =>
            prev.map((d) =>
              d.id === change.rowId
                ? { ...d, [change.columnId]: change.value }
                : d
            )
          )
        }}
      />
    </div>
  )
}
