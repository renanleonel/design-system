"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const revenue = [18.2, 21.4, 19.8, 26.1, 29.5, 34.2].map((value, i) => ({
  month: MONTHS[i],
  revenue: value * 1000,
}))

const compact = (n: number) =>
  n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })

/** One series: no legend (the title names it), a 10% wash under a 2px line. */
export function Revenue() {
  const config = {
    revenue: { label: "Revenue", color: "var(--ds-chart-1)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-60 w-full">
      <AreaChart data={revenue} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v: number) => `$${compact(v)}`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
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

const signups = MONTHS.map((month, i) => ({
  month,
  organic: [120, 150, 170, 160, 210, 240][i],
  paid: [80, 95, 90, 130, 150, 145][i],
}))

/** Two series: a legend, bars capped at 24px with 4px rounded ends and a 2px gap. */
export function Bars() {
  const config = {
    organic: { label: "Organic", color: "var(--ds-chart-1)" },
    paid: { label: "Paid", color: "var(--ds-chart-2)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={signups} barGap={2} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="organic" fill="var(--color-organic)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        <Bar dataKey="paid" fill="var(--color-paid)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  )
}

const latency = MONTHS.map((month, i) => ({
  month,
  api: [182, 175, 190, 168, 160, 152][i],
  web: [240, 228, 251, 236, 219, 205][i],
  jobs: [96, 104, 99, 112, 108, 101][i],
}))

/** p95 latency in ms. Three series: hues 1-3 in order, a legend, the tooltip on hover. */
export function Lines() {
  const config = {
    api: { label: "API", color: "var(--ds-chart-1)" },
    web: { label: "Web", color: "var(--ds-chart-2)" },
    jobs: { label: "Jobs", color: "var(--ds-chart-3)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <LineChart data={latency} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={32}
          domain={[0, 300]}
          ticks={[0, 100, 200, 300]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {(["api", "web", "jobs"] as const).map((key) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}
