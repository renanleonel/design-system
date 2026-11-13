"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const STATUSES = ["Active", "Paused", "Archived"]

export function Default() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Filters</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Changes apply immediately.</SheetDescription>
        </SheetHeader>
        <FieldGroup className="gap-3 px-4">
          {STATUSES.map((status) => (
            <Field key={status} orientation="horizontal">
              <Checkbox id={`sheet-${status}`} defaultChecked={status !== "Archived"} />
              <FieldLabel htmlFor={`sheet-${status}`}>{status}</FieldLabel>
            </Field>
          ))}
        </FieldGroup>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function Sides() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="outline" className="capitalize" />}>
            {side}
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="capitalize">{side} sheet</SheetTitle>
              <SheetDescription>Escape or a click outside closes it.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
