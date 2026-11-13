import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex w-fit max-w-full shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent font-medium whitespace-nowrap tabular-nums focus-ring transition-colors has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive [--ds-focus-ring:var(--destructive)] dark:bg-destructive/20 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        plain: "",
      },
      // Status pill: the tone's text on a 12% tint of itself (contrast-checked).
      tone: {
        gray: "bg-tone-gray/12 text-tone-gray",
        blue: "bg-tone-blue/12 text-tone-blue",
        green: "bg-tone-green/12 text-tone-green",
        amber: "bg-tone-amber/12 text-tone-amber",
        orange: "bg-tone-orange/12 text-tone-orange",
        red: "bg-tone-red/12 text-tone-red",
        purple: "bg-tone-purple/12 text-tone-purple",
      },
      size: {
        sm: "h-5 px-2 py-0.5 text-xs [&>svg]:size-3!",
        md: "h-7 px-2.5 text-sm [&>svg]:size-3.5!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

function Badge({
  className,
  variant = "default",
  tone,
  size,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        // A tone replaces the variant's colors.
        className: cn(
          badgeVariants({ variant: tone ? "plain" : variant, tone, size }),
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
