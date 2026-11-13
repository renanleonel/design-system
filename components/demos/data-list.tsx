"use client"

import { DataItem, DataList } from "@/components/ui/data-list"

/** One spread line when the container fits it, a 2-column grid when it doesn't. */
export function Row() {
  return (
    <div className="w-full max-w-lg rounded-xl p-4 shadow-border">
      <DataList>
        <DataItem label="Region">eu-west-1</DataItem>
        <DataItem label="Instances">3</DataItem>
        <DataItem label="Uptime">99.98%</DataItem>
        <DataItem label="Cost">$412/mo</DataItem>
      </DataList>
    </div>
  )
}

export function Stack() {
  return (
    <div className="w-full max-w-xs rounded-xl p-4 shadow-border">
      <DataList layout="stack">
        <DataItem label="Plan">Pro</DataItem>
        <DataItem label="Seats">8 of 10</DataItem>
        <DataItem label="Renews">Jun 1, 2026</DataItem>
      </DataList>
    </div>
  )
}

/** Worst case: a long value, a large amount and a missing one in a narrow card. */
export function WorstCase() {
  return (
    <div className="w-full max-w-xs rounded-xl p-4 shadow-border">
      <DataList layout="stack">
        <DataItem label="Região">
          sa-east-1 (São Paulo) · failover us-east-2
        </DataItem>
        <DataItem label="Custo mensal">{"R$ 12.345.678,90"}</DataItem>
        <DataItem label="Responsável">—</DataItem>
      </DataList>
    </div>
  )
}
