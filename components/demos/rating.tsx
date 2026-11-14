"use client"

import * as React from "react"

import { Rating } from "@/components/ui/rating"

/** Hover previews; arrow keys move and pick. */
export function Default() {
  const [value, setValue] = React.useState<number | null>(4)
  return (
    <div className="flex items-center gap-3">
      <Rating value={value} onValueChange={setValue} aria-label="Your rating" />
      <span className="text-sm text-muted-foreground tabular-nums">
        {value ? `${value} of 5` : "Not rated"}
      </span>
    </div>
  )
}

/** `allowHalf`: each star has a left and a right half; arrows step by 0.5. */
export function HalfStars() {
  const [value, setValue] = React.useState<number | null>(3.5)
  return (
    <div className="flex items-center gap-3">
      <Rating
        allowHalf
        value={value}
        onValueChange={setValue}
        aria-label="Your rating"
      />
      <span className="text-sm text-muted-foreground tabular-nums">
        {value ? `${value} of 5` : "Not rated"}
      </span>
    </div>
  )
}

/** Review summaries: read-only, with fractions. */
export function ReadOnly() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Rating value={4.6} readOnly size="sm" />
      <span className="font-medium tabular-nums">4.6</span>
      <span className="text-muted-foreground tabular-nums">
        (1,284 reviews)
      </span>
    </div>
  )
}

export function Disabled() {
  return <Rating defaultValue={3} disabled aria-label="Rating" />
}
