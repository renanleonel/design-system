"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

/** Drag it down to dismiss; the backdrop follows your finger. */
export function Default() {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open drawer
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <p className="px-4 text-center font-heading text-5xl font-semibold tabular-nums">
            350
            <span className="ms-1 text-sm font-normal text-muted-foreground">
              kcal/day
            </span>
          </p>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Save goal</DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export function FromTheSide() {
  return (
    <Drawer swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" />}>
        Open from the right
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Activity</DrawerTitle>
          <DrawerDescription>Swipe right to close.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}
