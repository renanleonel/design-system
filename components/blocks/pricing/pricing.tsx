"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckIcon, MinusIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUrlState } from "@/hooks/use-url-state"

export type Period = "monthly" | "yearly"

export type PricingPlan = {
  id: string
  name: string
  description: string
  /** Per seat per month, billed monthly. `null` = custom pricing. */
  monthly: number | null
  features: string[]
  cta: string
  /** The recommended plan: ring, badge, primary button. */
  highlighted?: boolean
}

export type ComparisonRow = {
  label: string
  hint?: string
  /** Per plan id: true (included), false (not), or a value ("10 GB"). */
  values: Record<string, boolean | string>
}

export type ComparisonGroup = { title: string; rows: ComparisonRow[] }

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 ? 2 : 0,
  })

function priceFor(plan: PricingPlan, period: Period, yearlyDiscount: number) {
  if (plan.monthly === null) return null
  return period === "yearly"
    ? plan.monthly * (1 - yearlyDiscount)
    : plan.monthly
}

/** Monthly / yearly as a segmented control, with the yearly saving inline. */
export function PeriodToggle({
  value,
  onValueChange,
  yearlyDiscount,
}: {
  value: Period
  onValueChange: (value: Period) => void
  yearlyDiscount: number
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as Period)}>
      <TabsList variant="segmented" aria-label="Billing period">
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">
          Yearly
          <Badge tone="green" className="-me-1.5">
            −{Math.round(yearlyDiscount * 100)}%
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

/**
 * Plan cards. Prices are per seat per month; switching the period swaps the
 * number with a short fade-up (the new value enters, nothing slides around),
 * and yearly shows what's billed once a year. Cards reflow by container width.
 */
export function PricingPlans({
  plans,
  period,
  yearlyDiscount = 0.2,
  onSelect,
  className,
}: {
  plans: PricingPlan[]
  period: Period
  yearlyDiscount?: number
  onSelect?: (plan: PricingPlan, period: Period) => void
  className?: string
}) {
  return (
    <div className={cn("@container", className)}>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 @2xl:grid-cols-3 @2xl:items-stretch">
        {plans.map((plan) => {
          const price = priceFor(plan, period, yearlyDiscount)
          return (
            <li
              key={plan.id}
              data-highlighted={plan.highlighted || undefined}
              className="relative flex flex-col gap-6 rounded-2xl bg-card p-6 shadow-border data-highlighted:shadow-none data-highlighted:ring-2 data-highlighted:ring-primary"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold">
                    {plan.name}
                  </h3>
                  {plan.highlighted && <Badge>Most popular</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="flex min-h-16 flex-col justify-end">
                {price === null ? (
                  <p className="font-heading text-4xl font-semibold tracking-tight">
                    Custom
                  </p>
                ) : (
                  <p className="flex items-baseline gap-1.5">
                    <span
                      key={`${plan.id}-${period}`}
                      className="font-heading text-4xl font-semibold tracking-tight tabular-nums transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none starting:translate-y-1 starting:opacity-0"
                    >
                      {usd(price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / seat / month
                    </span>
                  </p>
                )}
                <p className="mt-1 h-5 text-sm text-muted-foreground tabular-nums">
                  {price === null
                    ? "Volume pricing and invoicing"
                    : price === 0
                      ? "Free forever"
                      : period === "yearly"
                        ? `${usd(price * 12)} billed yearly`
                        : "Billed monthly"}
                </p>
              </div>
              <Button
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                className="w-full"
                onClick={() => onSelect?.(plan, period)}
              >
                {plan.cta}
              </Button>
              <ul className="flex flex-col gap-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-tone-green" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Cell({ value }: { value: boolean | string | undefined }) {
  if (value === true)
    return (
      <>
        <CheckIcon aria-hidden className="size-4 text-tone-green" />
        <span className="sr-only">Included</span>
      </>
    )
  if (!value)
    return (
      <>
        <MinusIcon aria-hidden className="size-4 text-muted-foreground/50" />
        <span className="sr-only">Not included</span>
      </>
    )
  return <span className="text-sm tabular-nums">{value}</span>
}

function RowLabel({ row }: { row: ComparisonRow }) {
  if (!row.hint) return <>{row.label}</>
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="rounded-sm text-start underline decoration-border decoration-dashed underline-offset-4 focus-ring"
          />
        }
      >
        {row.label}
      </TooltipTrigger>
      <TooltipContent className="max-w-60">{row.hint}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Every feature by plan. Wide containers get a real table with a sticky plan
 * row; narrow ones pick one plan at a time (a 4-column table doesn't fit a
 * phone, and sideways scrolling hides the plan names).
 */
export function ComparisonTable({
  plans,
  groups,
  className,
}: {
  plans: PricingPlan[]
  groups: ComparisonGroup[]
  className?: string
}) {
  const [planId, setPlanId] = React.useState(
    plans.find((p) => p.highlighted)?.id ?? plans[0]?.id
  )
  return (
    <div className={cn("@container", className)}>
      <table className="hidden w-full border-collapse text-sm @2xl:table">
        <caption className="sr-only">Features by plan</caption>
        <thead>
          <tr>
            <td className="w-[34%]" />
            {plans.map((plan) => (
              <th
                key={plan.id}
                scope="col"
                className="sticky top-14 z-10 bg-background/90 px-4 py-3 text-start font-heading text-base font-semibold backdrop-blur"
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.title}>
            <tr>
              <th
                scope="colgroup"
                colSpan={plans.length + 1}
                className="pt-8 pb-2 text-start text-sm font-medium text-muted-foreground"
              >
                {group.title}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-t">
                <th scope="row" className="py-3 pe-4 text-start font-normal">
                  <RowLabel row={row} />
                </th>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3">
                    <span className="flex items-center">
                      <Cell value={row.values[plan.id]} />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>

      <div className="flex flex-col gap-6 @2xl:hidden">
        <Tabs value={planId} onValueChange={(v) => setPlanId(String(v))}>
          <TabsList variant="segmented" aria-label="Plan" className="w-full">
            {plans.map((plan) => (
              <TabsTrigger key={plan.id} value={plan.id} className="flex-1">
                {plan.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {groups.map((group) => (
          <section key={group.title} className="flex flex-col">
            <h3 className="pb-2 text-sm font-medium text-muted-foreground">
              {group.title}
            </h3>
            <dl>
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-t py-3 text-sm"
                >
                  <dt>
                    <RowLabel row={row} />
                  </dt>
                  <dd className="flex shrink-0 items-center">
                    <Cell value={row.values[planId ?? ""]} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}

/** Questions beside a short intro and a way to reach a person. */
export function PricingFaq({
  items,
  title = "Questions",
  description,
  className,
}: {
  items: { question: string; answer: React.ReactNode }[]
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("@container", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Accordion>
          {items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

/** The closing call to action on a tinted band. */
export function CtaBand({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("@container", className)}>
      <section className="flex flex-col items-start gap-6 rounded-3xl bg-muted/60 px-6 py-10 @2xl:flex-row @2xl:items-center @2xl:justify-between @2xl:px-12">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </section>
    </div>
  )
}

// --- Sample page ---------------------------------------------------------------

export const SAMPLE_PLANS: PricingPlan[] = [
  {
    id: "hobby",
    name: "Hobby",
    description: "For side projects and trying things out.",
    monthly: 0,
    features: ["3 projects", "1 seat", "Community support"],
    cta: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For teams shipping to production.",
    monthly: 24,
    features: [
      "Unlimited projects",
      "Up to 25 seats",
      "Preview deployments",
      "Audit log",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with security and scale needs.",
    monthly: null,
    features: [
      "Everything in Pro",
      "SSO and SCIM",
      "99.99% uptime SLA",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
  },
]

export const SAMPLE_COMPARISON: ComparisonGroup[] = [
  {
    title: "Usage",
    rows: [
      {
        label: "Projects",
        values: { hobby: "3", pro: "Unlimited", enterprise: "Unlimited" },
      },
      {
        label: "Seats",
        values: { hobby: "1", pro: "25", enterprise: "Unlimited" },
      },
      {
        label: "Bandwidth",
        hint: "Data served from the edge each month. Overages bill at $0.15/GB.",
        values: { hobby: "100 GB", pro: "1 TB", enterprise: "Custom" },
      },
    ],
  },
  {
    title: "Collaboration",
    rows: [
      {
        label: "Preview deployments",
        values: { hobby: false, pro: true, enterprise: true },
      },
      {
        label: "Comments on previews",
        values: { hobby: false, pro: true, enterprise: true },
      },
      {
        label: "Roles and permissions",
        values: { hobby: false, pro: "Basic", enterprise: "Custom roles" },
      },
    ],
  },
  {
    title: "Security",
    rows: [
      {
        label: "Two-factor authentication",
        values: { hobby: true, pro: true, enterprise: true },
      },
      {
        label: "Audit log",
        values: { hobby: false, pro: "90 days", enterprise: "Unlimited" },
      },
      {
        label: "SSO and SCIM",
        hint: "SAML single sign-on and automatic user provisioning from your identity provider.",
        values: { hobby: false, pro: false, enterprise: true },
      },
    ],
  },
]

export const SAMPLE_FAQ = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrades apply right away and are prorated; downgrades take effect at the next renewal.",
  },
  {
    question: "What counts as a seat?",
    answer:
      "Anyone who can sign in to your workspace. Viewers on shared links are free.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Within 14 days of any charge, no questions asked.",
  },
  {
    question: "Is there a discount for startups or nonprofits?",
    answer:
      "Yes: 50% off Pro for the first year. Write to us from your work email.",
  },
]

/**
 * A full pricing page: heading, period toggle (in the URL as `?period=`),
 * plans, comparison, FAQ and a closing call to action.
 */
export function PricingPage({
  plans = SAMPLE_PLANS,
  comparison = SAMPLE_COMPARISON,
  faq = SAMPLE_FAQ,
  yearlyDiscount = 0.2,
  onSelect,
}: {
  plans?: PricingPlan[]
  comparison?: ComparisonGroup[]
  faq?: { question: string; answer: React.ReactNode }[]
  yearlyDiscount?: number
  onSelect?: (plan: PricingPlan, period: Period) => void
}) {
  const [periodParam, setPeriod] = useUrlState("period", "yearly")
  const period: Period = periodParam === "monthly" ? "monthly" : "yearly"
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16 md:py-24">
      <section className="flex flex-col items-center gap-10">
        <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Simple pricing that grows with your team
          </h1>
          <p className="text-lg text-muted-foreground">
            Start free. Upgrade when you need previews, more seats or audit
            logs. Cancel anytime.
          </p>
          <PeriodToggle
            value={period}
            onValueChange={setPeriod}
            yearlyDiscount={yearlyDiscount}
          />
        </div>
        <PricingPlans
          plans={plans}
          period={period}
          yearlyDiscount={yearlyDiscount}
          onSelect={onSelect}
          className="w-full"
        />
      </section>
      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Compare plans
        </h2>
        <ComparisonTable plans={plans} groups={comparison} />
      </section>
      <PricingFaq
        items={faq}
        description={
          <>
            Can&apos;t find an answer?{" "}
            <a
              href="#contact"
              className="rounded-sm font-medium text-foreground underline underline-offset-4 focus-ring"
            >
              Talk to us
            </a>
            .
          </>
        }
      />
      <CtaBand
        title="Ship your next project this week"
        description="Free for side projects. 14-day Pro trial, no card required."
        actions={
          <>
            <Button size="lg">Start for free</Button>
            <Button size="lg" variant="outline">
              Talk to sales
            </Button>
          </>
        }
      />
    </div>
  )
}
