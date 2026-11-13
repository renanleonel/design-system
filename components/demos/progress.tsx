"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"

export function Default() {
  return (
    <Progress value={64} className="w-full max-w-xs">
      <ProgressLabel>Uploading 3 files</ProgressLabel>
      <ProgressValue />
    </Progress>
  )
}

/** The bar eases to each new value. */
export function Animated() {
  const [value, setValue] = React.useState(20)
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Progress value={value}>
        <ProgressLabel>Import</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setValue((v) => (v >= 100 ? 0 : Math.min(100, v + 20)))}
      >
        {value >= 100 ? "Restart" : "Advance"}
      </Button>
    </div>
  )
}

/** `value={null}`: we don't know how long it takes. */
export function Indeterminate() {
  return (
    <Progress value={null} className="w-full max-w-xs">
      <ProgressLabel>Preparing export</ProgressLabel>
    </Progress>
  )
}
