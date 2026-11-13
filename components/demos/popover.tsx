"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Default() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Share</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Share link</PopoverTitle>
          <PopoverDescription>Anyone with the link can view.</PopoverDescription>
        </PopoverHeader>
        <Input readOnly value="https://acme.app/p/q3-report" aria-label="Link" />
      </PopoverContent>
    </Popover>
  )
}

export function Placement() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button variant="outline" className="capitalize" />}>
            {side}
          </PopoverTrigger>
          <PopoverContent side={side} className="w-auto">
            <p className="text-sm">Opens on the {side}.</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
