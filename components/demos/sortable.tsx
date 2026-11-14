"use client"

import * as React from "react"

import {
  Sortable,
  SortableHandle,
  SortableItem,
} from "@/components/ui/sortable"

const STEPS = [
  { id: "lint", name: "Lint" },
  { id: "test", name: "Run tests" },
  { id: "build", name: "Build" },
  { id: "deploy", name: "Deploy to production" },
]

/** Drag a handle, or focus it and use Space and the arrow keys. */
export function Default() {
  const [steps, setSteps] = React.useState(STEPS)
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Sortable
        items={steps}
        getId={(step) => step.id}
        getLabel={(step) => step.name}
        onReorder={setSteps}
      >
        {steps.map((step, i) => (
          <SortableItem key={step.id} id={step.id}>
            <div className="flex items-center gap-2 rounded-lg bg-card px-2 py-1.5 shadow-border">
              <SortableHandle label={`Reorder ${step.name}`} />
              <span className="w-4 text-sm text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <span className="text-sm font-medium">{step.name}</span>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  )
}

/**
 * `dragFrom="item"`: grab anywhere on the row, or focus it and press Space.
 * The grip stays as a visual cue. Keep buttons and inputs out of these rows.
 */
export function WholeRow() {
  const [steps, setSteps] = React.useState(STEPS)
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Sortable
        items={steps}
        getId={(step) => step.id}
        getLabel={(step) => step.name}
        onReorder={setSteps}
        dragFrom="item"
      >
        {steps.map((step, i) => (
          <SortableItem key={step.id} id={step.id}>
            <div className="flex items-center gap-2 rounded-lg bg-card px-2 py-1.5 shadow-border">
              <SortableHandle />
              <span className="w-4 text-sm text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <span className="text-sm font-medium">{step.name}</span>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  )
}
