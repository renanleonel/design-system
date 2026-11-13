"use client"

import * as React from "react"
import { Meter } from "@base-ui/react/meter"
import { cn } from "cn"
import { toast } from "sonner"
import { CheckIcon, CreditCardIcon, DownloadIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconTile } from "@/components/ui/icon-tile"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUrlState } from "@/hooks/use-url-state"

type Plan = {
  id: string
  name: string
  blurb: string
  monthly: number | null
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: "hobby",
    name: "Hobby",
    blurb: "For side projects",
    monthly: 0,
    features: ["3 projects", "1 seat", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For growing teams",
    monthly: 24,
    features: ["50 projects", "10 seats", "Audit log", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    blurb: "For organizations",
    monthly: null,
    features: [
      "Unlimited projects",
      "SSO and SCIM",
      "99.99% SLA",
      "Dedicated manager",
    ],
  },
]
const CURRENT = "pro"
const YEARLY_DISCOUNT = 0.2

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const current = plan.id === CURRENT
  const price =
    plan.monthly === null
      ? null
      : yearly
        ? Math.round(plan.monthly * (1 - YEARLY_DISCOUNT))
        : plan.monthly
  const higher =
    PLANS.findIndex((p) => p.id === plan.id) >
    PLANS.findIndex((p) => p.id === CURRENT)
  return (
    <article
      aria-label={`${plan.name} plan`}
      className={cn(
        "flex flex-col gap-5 rounded-xl bg-card p-5 shadow-border",
        current && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">{plan.name}</h3>
          <p className="text-sm text-muted-foreground">{plan.blurb}</p>
        </div>
        {current && <Badge tone="blue">Current</Badge>}
      </div>
      <p className="flex items-baseline gap-1">
        {price === null ? (
          <span className="font-heading text-3xl font-semibold tracking-tight">
            Custom
          </span>
        ) : (
          <>
            <span className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
              {money.format(price)}
            </span>
            <span className="text-sm text-muted-foreground">
              / seat / month{yearly && plan.monthly ? ", billed yearly" : ""}
            </span>
          </>
        )}
      </p>
      <ul className="flex flex-1 flex-col gap-2 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <CheckIcon
              className="size-4 shrink-0 text-tone-green"
              aria-hidden
            />
            {f}
          </li>
        ))}
      </ul>
      {current ? (
        <Button variant="outline" disabled className="w-full">
          Current plan
        </Button>
      ) : plan.monthly === null ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => toast("Sales will reach out within a day")}
        >
          Contact sales
        </Button>
      ) : higher ? (
        <Button className="w-full">Upgrade to {plan.name}</Button>
      ) : (
        <Button variant="ghost" className="w-full">
          Downgrade
        </Button>
      )}
    </article>
  )
}

/** A usage meter: label and value on one line, a track that turns amber near the limit. */
function Usage({
  label,
  value,
  max,
  format = (n: number) => n.toLocaleString("en-US"),
}: {
  label: string
  value: number
  max: number
  format?: (n: number) => string
}) {
  const ratio = value / max
  return (
    <Meter.Root value={value} max={max} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <Meter.Label className="font-medium">{label}</Meter.Label>
        <span className="text-muted-foreground tabular-nums">
          {format(value)} <span aria-hidden>/</span>
          <span className="sr-only">of</span> {format(max)}
        </span>
      </div>
      <Meter.Track className="h-1.5 overflow-hidden rounded-full bg-muted">
        <Meter.Indicator
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            ratio >= 0.9
              ? "bg-tone-red"
              : ratio >= 0.7
                ? "bg-tone-amber"
                : "bg-foreground"
          )}
        />
      </Meter.Track>
    </Meter.Root>
  )
}

const INVOICES = [
  { id: "INV-2026-011", date: "2026-11-01", amount: 96, status: "Paid" },
  { id: "INV-2026-010", date: "2026-10-01", amount: 96, status: "Paid" },
  { id: "INV-2026-009", date: "2026-09-01", amount: 72, status: "Paid" },
  { id: "INV-2026-008", date: "2026-08-01", amount: 72, status: "Refunded" },
]
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const id = React.useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="font-medium">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function BillingPage() {
  const [period, setPeriod] = useUrlState("period", "monthly")
  const yearly = period === "yearly"

  return (
    <div className="flex flex-col gap-10">
      <Section
        title="Plan"
        description="Prices per seat. Change or cancel anytime; changes are prorated."
        action={
          <Tabs value={period} onValueChange={(v) => setPeriod(String(v))}>
            <TabsList variant="segmented" aria-label="Billing period">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge tone="green">−20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} yearly={yearly} />
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-2">
        <Section title="Usage" description="Resets on Dec 1.">
          <div className="flex flex-col gap-5 rounded-xl bg-card p-5 shadow-border">
            <Usage label="Seats" value={4} max={10} />
            <Usage label="Projects" value={24} max={50} />
            <Usage label="API requests" value={182_400} max={250_000} />
            <Usage
              label="Storage"
              value={46.2}
              max={50}
              format={(n) => `${n} GB`}
            />
          </div>
        </Section>

        <Section title="Payment method">
          <div className="flex items-center gap-3 rounded-xl bg-card p-5 shadow-border">
            <IconTile size="lg">
              <CreditCardIcon />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="font-medium tabular-nums">Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground tabular-nums">
                Expires 08/28 · Billed on the 1st
              </p>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </Section>
      </div>

      <Section title="Invoices">
        <ul className="divide-y rounded-xl bg-card shadow-border">
          {INVOICES.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center gap-3 px-5 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium tabular-nums">
                  {date.format(new Date(inv.date))}
                </p>
                <p className="truncate text-muted-foreground tabular-nums">
                  {inv.id}
                </p>
              </div>
              <Badge tone={inv.status === "Paid" ? "green" : "gray"}>
                {inv.status}
              </Badge>
              <span className="w-16 text-end font-medium tabular-nums">
                {money.format(inv.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Download ${inv.id}`}
              >
                <DownloadIcon />
              </Button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
