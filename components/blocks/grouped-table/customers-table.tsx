"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  CopyIcon,
  DownloadIcon,
  GaugeIcon,
  StarIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toastUndo } from "@/components/ui/sonner"
import { GroupedTable, type GroupOption } from "./grouped-table"

export type Customer = {
  id: string
  company: string
  city: string
  country: string
  founder: string
  owner: string
  employees: string
  website: string
  tags: string[]
  rating: string
  arr: number
}

const RATINGS = ["Excellent", "Good", "Normal", "Bad", "Very bad"]
const RATING_TONE = {
  Excellent: "green",
  Good: "blue",
  Normal: "gray",
  Bad: "orange",
  "Very bad": "red",
} as const
const SIZES = ["1-10", "11-100", "100-199", "200-500", "500-1000"]
const OWNERS = ["Renan Leonel", "Ana Souza", "João Silva", "Pedro Santos"]
const TAG_TONE: Record<string, "blue" | "purple" | "orange" | "green" | "amber"> = {
  B2B: "blue",
  B2C: "purple",
  Enterprise: "orange",
  Seed: "green",
  "Pre-seed": "amber",
}

const COMPANIES: [string, string, string][] = [
  ["Heritage Manufacturing", "Berlin", "DE"],
  ["Summit Software Systems", "San Francisco", "US"],
  ["Quantum Innovations", "Paris", "FR"],
  ["NexGen Solutions", "Tokyo", "JP"],
  ["Synergy Tech", "New York", "US"],
  ["Apex Dynamics", "Sydney", "AU"],
  ["Fusion Networks", "Toronto", "CA"],
  ["Vertex Systems", "Cape Town", "ZA"],
  ["Cortex Technologies", "Rio de Janeiro", "BR"],
  ["Pinnacle Software", "Lisbon", "PT"],
  ["Elevate Digital", "Beijing", "CN"],
  ["Hyperion Labs", "Dubai", "AE"],
  ["Nimbus Data Solutions", "Mumbai", "IN"],
  ["Catalyst Cybernetics", "Singapore", "SG"],
  ["InnovaTech Corp", "Seoul", "KR"],
  ["Stratosphere Innovations", "Mexico City", "MX"],
  ["ByteWave Technologies", "Buenos Aires", "AR"],
  ["Luminary Systems", "Rome", "IT"],
  ["EchoWare Solutions", "Madrid", "ES"],
  ["TerraTech Innovations", "Porto", "PT"],
  ["Vanguard Digital", "Cairo", "EG"],
  ["Northwind Analytics", "Amsterdam", "NL"],
  ["Alpine Secure", "Zurich", "CH"],
  ["Kiwi Data Works", "Auckland", "NZ"],
  ["Aurora Networks", "Helsinki", "FI"],
  ["Straits Digital Labs", "Kuala Lumpur", "MY"],
  ["Aegean Technologies", "Athens", "GR"],
  ["Savanna Payments", "Nairobi", "KE"],
  ["Bosphorus Systems", "Istanbul", "TR"],
  ["Negev AI", "Tel Aviv", "IL"],
  ["Vltava Interactive", "Prague", "CZ"],
  ["Fjord Robotics", "Oslo", "NO"],
  ["Vistula Software", "Warsaw", "PL"],
  ["Archipelago Labs", "Manila", "PH"],
  ["Cumbre Digital", "Bogotá", "CO"],
  ["Danube Cloudworks", "Vienna", "AT"],
  ["Inca Data Systems", "Lima", "PE"],
  ["Thames Creative Studio", "London", "GB"],
  ["Emerald Health Tech", "Dublin", "IE"],
  ["Lotus Commerce", "Ho Chi Minh City", "VN"],
  ["Oasis Ventures", "Riyadh", "SA"],
  ["Atlas Commerce", "Casablanca", "MA"],
  ["Matrix Networks", "Lagos", "NG"],
  ["Harbor Logistics", "Copenhagen", "DK"],
  ["Andes Fintech", "Santiago", "CL"],
  ["Atomium Software", "Brussels", "BE"],
  ["Formosa Semiconductors", "Taipei", "TW"],
  ["Polaris Cloud", "Stockholm", "SE"],
]
const FOUNDERS = ["Maria Oliveira", "Lucas Costa", "Beatriz Lima"]

// Deterministic sample data (same on server and client).
export const SAMPLE_CUSTOMERS: Customer[] = COMPANIES.map(
  ([company, city, country], i) => {
    const b2b = i % 3 !== 1
    return {
      id: `cus_${(i + 1).toString().padStart(3, "0")}`,
      company,
      city,
      country,
      founder: FOUNDERS[(i * 7) % 3],
      owner: OWNERS[(i * 5) % 4],
      employees: SIZES[(i * 3 + 1) % 5],
      website: `${company.split(" ")[0].toLowerCase()}.com`,
      tags: b2b
        ? ["B2B", ...(i % 4 === 0 ? ["Enterprise"] : [])]
        : ["B2C", i % 2 ? "Seed" : "Pre-seed"],
      rating: RATINGS[(i * 11 + Math.floor(i / 5)) % 5],
      arr: 8_000 + ((i * 48_271) % 420_000),
    }
  }
)

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "company",
    header: "Company",
    meta: { label: "Company" },
    cell: ({ row }) => (
      <a
        href={`#${row.original.id}`}
        className="flex max-w-56 items-center gap-2 rounded-sm font-medium focus-ring hover:underline"
      >
        {/* Monogram tile tinted by the series palette, so logos never 404. */}
        <span
          aria-hidden
          className={`grid size-5 shrink-0 place-items-center rounded-[5px] text-[10px] font-semibold text-white ${LOGO[row.index % LOGO.length]}`}
        >
          {row.original.company[0]}
        </span>
        <span className="truncate" title={row.original.company}>
          {row.original.company}
        </span>
      </a>
    ),
  },
  {
    id: "country",
    accessorFn: (c) => c.country,
    header: "Location",
    meta: { label: "Location" },
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
          {row.original.country}
        </span>
        {row.original.city}
      </span>
    ),
  },
  {
    accessorKey: "founder",
    header: "Founder",
    meta: { label: "Founder" },
    cell: ({ getValue }) => (
      <span className="flex items-center gap-2">
        <Avatar size="sm" className="size-5">
          <AvatarFallback className="text-[10px]">
            {initials(getValue<string>())}
          </AvatarFallback>
        </Avatar>
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "employees",
    header: "Employees",
    meta: { label: "Employees" },
    sortingFn: (a, b) =>
      SIZES.indexOf(a.original.employees) - SIZES.indexOf(b.original.employees),
    cell: ({ getValue }) => (
      <span className="tabular-nums">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    meta: { label: "Rating" },
    sortingFn: (a, b) =>
      RATINGS.indexOf(a.original.rating) - RATINGS.indexOf(b.original.rating),
  },
  { accessorKey: "owner", header: "Owner", meta: { label: "Owner" } },
  {
    accessorKey: "arr",
    header: "ARR",
    meta: { label: "ARR", align: "end", numeric: true, format: usd.format },
    cell: ({ getValue }) => usd.format(getValue<number>()),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    enableSorting: false,
    meta: { label: "Tags" },
    cell: ({ getValue }) => (
      <span className="flex gap-1">
        {getValue<string[]>().map((tag) => (
          <Badge key={tag} tone={TAG_TONE[tag]}>
            {tag}
          </Badge>
        ))}
      </span>
    ),
  },
]

const LOGO = [
  "bg-series-1",
  "bg-series-2",
  "bg-series-3",
  "bg-series-7",
  "bg-series-5",
  "bg-series-6",
]

const groupOptions: GroupOption[] = [
  {
    id: "rating",
    label: "Rating",
    order: RATINGS,
    render: (v) => (
      <Badge tone={RATING_TONE[v as keyof typeof RATING_TONE]}>{v}</Badge>
    ),
  },
  { id: "employees", label: "Employees", order: SIZES },
  { id: "owner", label: "Account owner" },
  { id: "founder", label: "Founder" },
  { id: "country", label: "Country" },
]

/** CRM customers grouped by rating, size, owner or country. */
export function CustomersTable({ className }: { className?: string }) {
  const [customers, setCustomers] = React.useState(SAMPLE_CUSTOMERS)
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set())

  const update = (ids: Set<string>, patch: Partial<Customer>) =>
    setCustomers((prev) =>
      prev.map((c) => (ids.has(c.id) ? { ...c, ...patch } : c))
    )
  const count = (n: number) => (n === 1 ? "1 customer" : `${n} customers`)

  return (
    <GroupedTable
      className={className}
      columns={columns}
      data={customers}
      getRowId={(c) => c.id}
      getRowLabel={(c) => c.company}
      groupOptions={groupOptions}
      noun={{ one: "customer", other: "customers" }}
      bulkActions={(rows, clear) => {
        const ids = new Set(rows.map((r) => r.id))
        const allFavorite = rows.every((r) => favorites.has(r.id))
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                <GaugeIcon data-icon="inline-start" />
                Rating
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuGroup>
                <DropdownMenuLabel>Set rating</DropdownMenuLabel>
                {RATINGS.map((rating) => (
                  <DropdownMenuItem
                    key={rating}
                    onClick={() => {
                      update(ids, { rating })
                      toast(`${count(ids.size)} rated ${rating}`)
                    }}
                  >
                    {rating}
                  </DropdownMenuItem>
                ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                <UserRoundIcon data-icon="inline-start" />
                Owner
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuGroup>
                <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                {OWNERS.map((owner) => (
                  <DropdownMenuItem
                    key={owner}
                    onClick={() => {
                      update(ids, { owner })
                      toast(`${count(ids.size)} assigned to ${owner}`)
                    }}
                  >
                    {owner}
                  </DropdownMenuItem>
                ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast(`Exported ${count(rows.length)} to CSV`)}
            >
              <DownloadIcon data-icon="inline-start" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              hotkey="Mod+Shift+C"
              disabled={rows.length === 0}
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(rows.map((r) => r.company).join("\n"))
                  .catch(() => {})
                toast(`Copied ${count(rows.length)}`)
              }}
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={allFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={allFavorite}
              onClick={() => {
                setFavorites((prev) => {
                  const next = new Set(prev)
                  for (const id of ids)
                    if (allFavorite) next.delete(id)
                    else next.add(id)
                  return next
                })
                toast(
                  allFavorite
                    ? `Removed ${count(ids.size)} from favorites`
                    : `Added ${count(ids.size)} to favorites`
                )
              }}
            >
              <StarIcon className={allFavorite ? "fill-current text-tone-amber" : undefined} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${count(rows.length)}`}
              hotkey="Mod+Backspace"
              disabled={rows.length === 0}
              className="text-tone-red"
              onClick={() => {
                const before = customers
                setCustomers((prev) => prev.filter((c) => !ids.has(c.id)))
                clear()
                toastUndo(`${count(ids.size)} moved to trash`, {
                  onUndo: () => setCustomers(before),
                })
              }}
            >
              <Trash2Icon />
            </Button>
          </>
        )
      }}
    />
  )
}
