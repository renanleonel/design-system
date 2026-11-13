import { cn } from "cn"

/**
 * First run of a product area ("Projects — Where it all starts"): the page is
 * the empty state. A two-line title (the second muted), pill actions, art
 * bleeding off the top-trailing corner over a faint column grid, and an
 * optional hint near the bottom. Everything enters once with a short fade-up
 * (`@starting-style`, no JS); reduced motion skips it.
 *
 *   <FeatureIntro
 *     title="Projects"
 *     tagline="Where it all starts"
 *     actions={<><Button>…</Button><Button variant="ghost">Import</Button></>}
 *     art={<IntroArt />}
 *     hint={<>Not sure where to start? <a>Use a template</a></>}
 *   />
 */
export function FeatureIntro({
  title,
  tagline,
  actions,
  art,
  hint,
  className,
}: {
  title: React.ReactNode
  tagline?: React.ReactNode
  actions?: React.ReactNode
  /** Decorative: hidden from assistive tech, clipped by the page edge. */
  art?: React.ReactNode
  hint?: React.ReactNode
  className?: string
}) {
  const enter =
    "transition-[opacity,translate] duration-500 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:delay-0"
  return (
    <section
      data-slot="feature-intro"
      className={cn(
        "relative isolate flex min-h-[32rem] flex-1 flex-col overflow-hidden",
        className
      )}
    >
      {/* Column grid, fading out toward the bottom. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(90deg,var(--border)_0_1px,transparent_1px_3rem)] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] opacity-50"
      />
      {art && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-6 -right-10 -z-10 w-[min(36rem,70%)] delay-100 sm:-right-6 starting:scale-95",
            enter,
            "transition-[opacity,translate,scale]"
          )}
        >
          {art}
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:ps-[clamp(2rem,18%,16rem)]">
        <div className={cn("max-w-md", enter)}>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
            {tagline && (
              <span className="block text-muted-foreground">{tagline}</span>
            )}
          </h1>
          {actions && (
            <div className="mt-8 flex flex-wrap items-center gap-2 [--ds-radius-control:9999px]">
              {actions}
            </div>
          )}
        </div>
      </div>
      {hint && (
        <div className="px-6 pb-10 sm:ps-[clamp(2rem,18%,16rem)]">
          <p
            className={cn(
              "max-w-md text-sm text-muted-foreground delay-150 [&_strong]:font-medium [&_strong]:text-foreground",
              enter
            )}
          >
            {hint}
          </p>
        </div>
      )}
    </section>
  )
}

/**
 * Sample art for FeatureIntro: soft-lit shapes in the chart palette, drawn in
 * CSS (swap for your own renders). Static: FeatureIntro gives any `art` one
 * entrance, so the pieces don't animate a second time inside it.
 */
export function IntroArt() {
  const piece = "absolute"
  const light =
    "radial-gradient(circle at 30% 25%, oklch(1 0 0 / 0.75), transparent 45%)"
  return (
    <div className="relative aspect-[4/3] w-full">
      <span
        className={cn(
          piece,
          "top-[8%] left-[8%] h-[52%] w-[34%] rotate-[-12deg] rounded-[40%_40%_18%_18%] shadow-xl"
        )}
        style={{
          background: `${light}, linear-gradient(160deg, var(--ds-chart-4), var(--ds-chart-2) 45%, var(--ds-chart-7))`,
        }}
      />
      <span
        className={cn(
          piece,
          "top-[2%] left-[52%] size-[22%] rotate-[18deg] rounded-[28%] shadow-lg"
        )}
        style={{
          background: `${light}, linear-gradient(135deg, var(--ds-chart-3), oklch(0.35 0.06 200))`,
        }}
      />
      <span
        className={cn(
          piece,
          "top-[10%] right-[2%] h-[38%] w-[24%] rotate-[14deg] rounded-[32%] opacity-90 shadow-xl"
        )}
        style={{
          background: `${light}, linear-gradient(180deg, var(--ds-chart-1), oklch(0.35 0.15 262))`,
        }}
      />
      <span
        className={cn(
          piece,
          "top-[52%] left-[44%] size-[24%] rotate-[-8deg] rounded-[30%] shadow-lg"
        )}
        style={{
          background: `${light}, linear-gradient(140deg, var(--ds-chart-6), oklch(0.35 0.12 145))`,
        }}
      />
      <span
        className={cn(
          piece,
          "top-[46%] right-[-4%] h-[44%] w-[32%] rounded-[45%_45%_38%_38%] shadow-xl"
        )}
        style={{
          background: `${light}, linear-gradient(170deg, var(--ds-chart-4), oklch(0.5 0.12 55))`,
        }}
      />
    </div>
  )
}
