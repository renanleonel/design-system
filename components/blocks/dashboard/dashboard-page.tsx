"use client"

import * as React from "react"
import { cn } from "cn"
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUrlState } from "@/hooks/use-url-state"

// --- Stat tile -------------------------------------------------------------

/**
 * A 12-point trend: the line in a quiet ink, the latest point in the accent.
 * Fixed size (no stretched viewBox), so the 2px line and dot stay round.
 */
function Sparkline({
  values,
  width = 96,
  height = 32,
  className,
}: {
  values: number[]
  width?: number
  height?: number
  className?: string
}) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = 3
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2)
  const y = (v: number) =>
    height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2)
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ")
  const last = values.length - 1
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0 overflow-visible", className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground/40"
      />
      <circle
        cx={x(last)}
        cy={y(values[last])}
        r={3.5}
        strokeWidth={2}
        className="fill-series-1 stroke-card"
      />
    </svg>
  )
}

type Stat = {
  label: string
  value: string
  /** Signed change in percent (or points), e.g. 12.4 or -0.4. */
  delta: number
  deltaUnit?: "%" | "pt"
  /** Whether a rise is good news (churn and latency: no). */
  upIsGood?: boolean
  trend: number[]
}

/**
 * Label, value, delta vs the previous period, and a sparkline. The delta's
 * color says good or bad (direction × upIsGood) and its arrow says which way,
 * so meaning never rides on color alone.
 */
function StatTile({ stat, period }: { stat: Stat; period: string }) {
  const up = stat.delta >= 0
  const good = up === (stat.upIsGood ?? true)
  const Arrow = up ? ArrowUpRightIcon : ArrowDownRightIcon
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardDescription>{stat.label}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="truncate font-heading text-2xl font-semibold tracking-tight tabular-nums">
            {stat.value}
          </p>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge tone={good ? "green" : "red"} className="tabular-nums">
              <Arrow />
              {up ? "+" : "−"}
              {Math.abs(stat.delta).toFixed(1)}
              {stat.deltaUnit === "pt" ? " pt" : "%"}
            </Badge>
            vs previous {period}
          </p>
        </div>
        <Sparkline values={stat.trend} />
      </CardContent>
    </Card>
  )
}

// --- Sample data (deterministic, so server and client render the same) ------

const RANGES = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "90 days", days: 90 },
] as const

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function series(days: number, base: number, growth: number, seed: number) {
  const rand = seeded(seed)
  return Array.from({ length: days }, (_, i) =>
    Math.round(base * (1 + growth * (i / days)) * (0.85 + rand() * 0.3))
  )
}

function sampleData(days: number) {
  const start = new Date(2026, 4, 31)
  start.setDate(start.getDate() - days + 1)
  const label = (i: number) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  const revenue = series(days, 1400, 0.35, days + 1).map((value, i) => ({
    date: label(i),
    revenue: value,
  }))
  const weeks = Math.max(4, Math.round(days / 7))
  const organic = series(weeks, 220, 0.4, days + 2)
  const paid = series(weeks, 140, 0.2, days + 3)
  const signups = organic.map((o, i) => ({
    week: `W${i + 1}`,
    organic: o,
    paid: paid[i],
  }))
  const scale = days / 30
  const stats: Stat[] = [
    {
      label: "Revenue",
      value: `$${(revenue.reduce((s, r) => s + r.revenue, 0) / 1000).toFixed(1)}K`,
      delta: 12.4,
      trend: series(12, 100, 0.4, days + 4),
    },
    {
      label: "Active users",
      value: Math.round(2841 * Math.sqrt(scale)).toLocaleString("en-US"),
      delta: 3.1,
      trend: series(12, 100, 0.15, days + 5),
    },
    {
      label: "Churn",
      value: "1.8%",
      delta: -0.4,
      deltaUnit: "pt",
      upIsGood: false,
      trend: series(12, 100, -0.2, days + 6),
    },
    {
      label: "p95 response",
      value: "182 ms",
      delta: 8.2,
      upIsGood: false,
      trend: series(12, 100, 0.1, days + 7),
    },
  ]
  return { revenue, signups, stats }
}

const ACTIVITY = [
  { who: "Renan Leonel", initials: "RL", what: "deployed acme-web to production", when: "4 min ago" },
  { who: "Ana Souza", initials: "AS", what: "invited 3 people to Growth", when: "1 h ago" },
  { who: "João Silva", initials: "JS", what: "upgraded the workspace to Pro", when: "3 h ago" },
  { who: "Pedro Santos", initials: "PS", what: "archived checkout-v1", when: "Yesterday" },
]

const TOP_PROJECTS = [
  { name: "acme-web", requests: 412_000 },
  { name: "billing-api", requests: 268_000 },
  { name: "docs", requests: 141_000 },
  { name: "mobile-gateway", requests: 87_000 },
]

/**
 * Round axis ticks (dataviz: clean numbers): 0 up to the first "nice" value
 * above the max, in about `count` steps of 1, 2, 2.5 or 5 × 10^n.
 */
function niceTicks(max: number, count = 4) {
  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw || 1))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ??
    magnitude * 10
  const top = Math.ceil(max / step) * step
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
}

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })

const compact = (n: number) =>
  n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--ds-chart-1)" },
} satisfies ChartConfig

const signupsConfig = {
  organic: { label: "Organic", color: "var(--ds-chart-1)" },
  paid: { label: "Paid", color: "var(--ds-chart-2)" },
} satisfies ChartConfig

// --- Page --------------------------------------------------------------------

/**
 * A product dashboard: KPI tiles, a revenue trend, signups by channel, recent
 * activity and top projects. The range lives in the URL (`?range=7d`), so a
 * shared link opens the same view. Swap `sampleData` for your queries.
 */
export function DashboardPage() {
  const [rangeValue, setRange] = useUrlState("range", "30d")
  const range = RANGES.find((r) => r.value === rangeValue) ?? RANGES[1]
  const { revenue, signups, stats } = React.useMemo(
    () => sampleData(range.days),
    [range.days]
  )
  const maxRequests = Math.max(...TOP_PROJECTS.map((p) => p.requests))
  const revenueTicks = niceTicks(Math.max(...revenue.map((r) => r.revenue)))
  const signupTicks = niceTicks(
    Math.max(...signups.flatMap((s) => [s.organic, s.paid]))
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Last {range.label}, updated 2 minutes ago
        </p>
        <Tabs value={range.value} onValueChange={(v) => setRange(String(v))}>
          <TabsList variant="segmented" aria-label="Range">
            {RANGES.map((r) => (
              <TabsTrigger key={r.value} value={r.value}>
                {r.value}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <section
        aria-label="Key metrics"
        className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatTile key={stat.label} stat={stat} period={range.label} />
        ))}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Daily, in USD</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="aspect-auto h-64 w-full">
              <AreaChart data={revenue} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  domain={[0, revenueTicks.at(-1) ?? "auto"]}
                  ticks={revenueTicks}
                  tickFormatter={(v: number) => `$${compact(v)}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      valueFormatter={(v) => usd(Number(v))}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  fill="var(--color-revenue)"
                  fillOpacity={0.1}
                  isAnimationActive={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signups</CardTitle>
            <CardDescription>Weekly, by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={signupsConfig} className="aspect-auto h-64 w-full">
              <BarChart data={signups} barGap={2} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  domain={[0, signupTicks.at(-1) ?? "auto"]}
                  ticks={signupTicks}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="organic"
                  fill="var(--color-organic)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="paid"
                  fill="var(--color-paid)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardAction>
              <a
                href="#activity"
                className="rounded-sm text-sm text-muted-foreground focus-ring hover:text-foreground"
              >
                View all
              </a>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {ACTIVITY.map((item) => (
                <li key={item.who + item.what} className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback className="text-xs">{item.initials}</AvatarFallback>
                  </Avatar>
                  <p className="min-w-0 flex-1 text-sm">
                    <span className="font-medium">{item.who}</span>{" "}
                    <span className="text-muted-foreground">{item.what}</span>
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {item.when}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top projects</CardTitle>
            <CardDescription>Requests this period</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {TOP_PROJECTS.map((project) => (
                <li key={project.name} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{project.name}</span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {compact(project.requests)}
                    </span>
                  </div>
                  <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-series-1"
                      style={{ width: `${(project.requests / maxRequests) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { Sparkline, StatTile, type Stat }
