import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:grid-cols-[minmax(0,1fr)_auto] has-data-[slot=alert-action]:items-center has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 has-[>svg]:has-data-[slot=alert-action]:grid-cols-[auto_minmax(0,1fr)_auto] *:[svg]:translate-y-0.5 *:[svg]:text-current has-data-[slot=alert-action]:*:[svg]:translate-y-0 has-data-[slot=alert-title]:*:[svg]:row-span-2 *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
      // Inline callout: tinted fill, no border, the tone carries the meaning.
      tone: {
        gray: "border-transparent bg-tone-gray/10 text-tone-gray *:data-[slot=alert-description]:text-tone-gray",
        blue: "border-transparent bg-tone-blue/10 text-tone-blue *:data-[slot=alert-description]:text-tone-blue",
        green:
          "border-transparent bg-tone-green/10 text-tone-green *:data-[slot=alert-description]:text-tone-green",
        amber:
          "border-transparent bg-tone-amber/10 text-tone-amber *:data-[slot=alert-description]:text-tone-amber",
        red: "border-transparent bg-tone-red/10 text-tone-red *:data-[slot=alert-description]:text-tone-red",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  tone,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, tone }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-end-[-1] row-start-1 self-center group-has-data-[slot=alert-title]/alert:row-span-2",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
