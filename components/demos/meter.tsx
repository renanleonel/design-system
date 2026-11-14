"use client"

import { Meter, MeterLabel, MeterValue } from "@/components/ui/meter"

export function Default() {
  return (
    <Meter value={64} className="w-full max-w-xs">
      <MeterLabel>Storage used</MeterLabel>
      <MeterValue />
    </Meter>
  )
}

/** Same tones as Badge. Choose from the value, not the other way round. */
export function Tones() {
  const tones = [
    "default",
    "gray",
    "blue",
    "green",
    "amber",
    "orange",
    "red",
    "purple",
  ] as const
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      {tones.map((tone, i) => (
        <Meter key={tone} value={20 + i * 10} tone={tone}>
          <MeterLabel className="capitalize">{tone}</MeterLabel>
          <MeterValue />
        </Meter>
      ))}
    </div>
  )
}

/** Plain-language value instead of a percentage. */
export function CustomValue() {
  return (
    <Meter value={7} min={0} max={10} tone="amber" className="w-full max-w-xs">
      <MeterLabel>Seats</MeterLabel>
      <MeterValue>{(_, value) => `${value} of 10 used`}</MeterValue>
    </Meter>
  )
}

export function Formatted() {
  return (
    <Meter
      value={42}
      format={{ style: "unit", unit: "percent" }}
      locale="en-US"
      tone="green"
      className="w-full max-w-xs"
    >
      <MeterLabel>Coverage</MeterLabel>
      <MeterValue />
    </Meter>
  )
}

export function Empty() {
  return (
    <Meter value={0} className="w-full max-w-xs">
      <MeterLabel>Storage used</MeterLabel>
      <MeterValue />
    </Meter>
  )
}

export function One() {
  return (
    <Meter value={100} tone="red" className="w-full max-w-xs">
      <MeterLabel>Storage used</MeterLabel>
      <MeterValue>{() => "Full"}</MeterValue>
    </Meter>
  )
}

export function WorstCase() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Meter value={87}>
        <MeterLabel>
          Maria Eduarda dos Santos Albuquerque Cavalcanti e Silva Junior
        </MeterLabel>
        <MeterValue />
      </Meter>
      <Meter value={50}>
        <MeterLabel>
          这是一个非常长的中文标题用来测试换行和截断的行为
        </MeterLabel>
        <MeterValue />
      </Meter>
      <Meter value={50}>
        <MeterLabel>هذا نص طويل جدا لاختبار التفاف الأسطر</MeterLabel>
        <MeterValue />
      </Meter>
      <Meter value={9876543210} min={0} max={10000000000} tone="red">
        <MeterLabel>Extreme</MeterLabel>
        <MeterValue>
          {(formatted) => `${formatted} / 10.000.000.000 bytes`}
        </MeterValue>
      </Meter>
    </div>
  )
}
