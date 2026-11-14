"use client"

// The dashboard's two charts. dashboard-page.tsx loads this module lazily, so
// recharts arrives after the page's first paint instead of blocking it.
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

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

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number }[]
}) {
  const ticks = niceTicks(Math.max(...data.map((r) => r.revenue)))
  return (
    <ChartContainer config={revenueConfig} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
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
          domain={[0, ticks.at(-1) ?? "auto"]}
          ticks={ticks}
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
  )
}

export function SignupsChart({
  data,
}: {
  data: { week: string; organic: number; paid: number }[]
}) {
  const ticks = niceTicks(Math.max(...data.flatMap((s) => [s.organic, s.paid])))
  return (
    <ChartContainer config={signupsConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} barGap={2} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={32}
          domain={[0, ticks.at(-1) ?? "auto"]}
          ticks={ticks}
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
  )
}
