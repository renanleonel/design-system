import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * An icon on a rounded, tinted square: the leading visual of list rows, dialog
 * headers and palette results. The tile sets the icon size; the tone colors both.
 */
const iconTileVariants = cva(
  "inline-flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-foreground",
        inverse:
          "bg-foreground text-background dark:bg-muted dark:text-foreground dark:shadow-border",
        gray: "bg-tone-gray/12 text-tone-gray",
        blue: "bg-tone-blue/12 text-tone-blue",
        green: "bg-tone-green/12 text-tone-green",
        amber: "bg-tone-amber/12 text-tone-amber",
        orange: "bg-tone-orange/12 text-tone-orange",
        red: "bg-tone-red/12 text-tone-red",
        purple: "bg-tone-purple/12 text-tone-purple",
      },
      size: {
        sm: "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        md: "size-9 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        lg: "size-11 rounded-xl [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
)

function IconTile({
  className,
  tone,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof iconTileVariants>) {
  return (
    <span
      data-slot="icon-tile"
      aria-hidden
      className={cn(iconTileVariants({ tone, size }), className)}
      {...props}
    />
  )
}

export { IconTile, iconTileVariants }
