"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const INVOICES = [
  { id: "INV-2041", status: "Paid", amount: 480 },
  { id: "INV-2040", status: "Pending", amount: 120 },
  { id: "INV-2039", status: "Overdue", amount: 960 },
] as const

const TONE = { Paid: "green", Pending: "amber", Overdue: "red" } as const

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

export function Default() {
  return (
    <Table className="max-w-md">
      <TableCaption>Invoices from the last 3 months.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {INVOICES.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>
              <Badge tone={TONE[invoice.status]}>{invoice.status}</Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {usd(invoice.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right tabular-nums">
            {usd(INVOICES.reduce((sum, i) => sum + i.amount, 0))}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
