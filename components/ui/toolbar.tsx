"use client"

import * as React from "react"
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"

function Toolbar({ className, ...props }: ToolbarPrimitive.Root.Props) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={cn(
        "flex w-fit max-w-full items-center gap-1 rounded-control p-1 shadow-border data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    />
  )
}

/** Takes `Button`'s variants and sizes; defaults to a small ghost button. */
function ToolbarButton({
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: ToolbarPrimitive.Button.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      className={cn(
        buttonVariants({ variant, size }),
        "data-pressed:bg-muted data-pressed:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function ToolbarLink({
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: ToolbarPrimitive.Link.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function ToolbarGroup({ className, ...props }: ToolbarPrimitive.Group.Props) {
  return (
    <ToolbarPrimitive.Group
      data-slot="toolbar-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        "shrink-0 bg-border data-horizontal:my-1 data-horizontal:h-px data-horizontal:w-full data-vertical:mx-1 data-vertical:h-5 data-vertical:w-px",
        className
      )}
      {...props}
    />
  )
}

function ToolbarInput({ className, ...props }: ToolbarPrimitive.Input.Props) {
  return (
    <ToolbarPrimitive.Input
      data-slot="toolbar-input"
      className={cn(
        "h-control-sm min-w-0 rounded-control border border-input bg-transparent px-2 text-sm focus-ring outline-none placeholder:text-muted-foreground disabled:opacity-50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarInput,
}
