"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

/** On a phone (below 640px) the same dialog opens as a swipeable drawer. */
export function Default() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Edit profile
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Changes are visible to everyone in the workspace.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="dialog-name">Name</FieldLabel>
            <Input id="dialog-name" defaultValue="Renan Leonel" />
          </Field>
          <Field>
            <FieldLabel htmlFor="dialog-handle">Handle</FieldLabel>
            <Input id="dialog-handle" defaultValue="@ada" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** `responsive={false}` keeps the centered dialog on every screen size. */
export function AlwaysCentered() {
  return (
    <Dialog responsive={false}>
      <DialogTrigger render={<Button variant="outline" />}>
        What&apos;s new
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Version 2.4</DialogTitle>
          <DialogDescription>
            Faster search, saved filters and a new billing page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
