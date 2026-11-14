import { cn } from "cn"

// x, y of each 9×9 block in a 24×24 box; the last one is the piece being placed.
const BLOCKS = [
  [2, 2],
  [13, 2],
  [2, 13],
  [13, 13],
] as const

/**
 * The renanleonel/ui mark: a registry of blocks, the last one still tilted
 * mid-placement. Blocks fade in once on load (40ms stagger); hovering the
 * parent `group/logo` snaps the last block into the grid. Reduced motion
 * keeps it still.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-6 shrink-0 overflow-visible", className)}
    >
      {BLOCKS.map(([x, y], i) => {
        const last = i === BLOCKS.length - 1
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={9}
            height={9}
            rx={2.5}
            style={{ animationDelay: `${i * 40}ms` }}
            className={cn(
              "origin-center fill-current [transform-box:fill-box] motion-safe:animate-[logo-block-in_300ms_var(--ds-ease-out)_backwards]",
              last &&
                "scale-[0.8] rotate-45 fill-primary transition-transform duration-(--ds-duration-popover) ease-(--ds-ease-out) group-hover/logo:scale-100 group-hover/logo:rotate-0 motion-reduce:transition-none"
            )}
          />
        )
      })}
    </svg>
  )
}
