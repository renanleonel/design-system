import { cn } from "cn"
import { ChevronRightIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconTile } from "@/components/ui/icon-tile"

const ENTER =
  "transition-[opacity,translate] duration-500 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:delay-0"

/**
 * The opening section: an announcement pill, a balanced headline, one line of
 * description, actions, then the product in a frame with a soft glow. Enters
 * once with a staggered fade-up (no JS).
 */
export function Hero({
  announcement,
  title,
  description,
  actions,
  media,
  className,
}: {
  /** e.g. { label: "Charts are here", href: "/changelog" } */
  announcement?: { label: React.ReactNode; href: string }
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** A screenshot, video or live preview; framed and glowing. */
  media?: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col items-center gap-14 px-6 pt-16 md:pt-24",
        className
      )}
    >
      <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
        {announcement && (
          <a
            href={announcement.href}
            className={cn(
              "group/pill inline-flex items-center gap-1.5 rounded-full bg-card py-1 ps-3 pe-2 text-sm shadow-border focus-ring transition-shadow hover:shadow-border-hover",
              ENTER
            )}
          >
            {announcement.label}
            <ChevronRightIcon className="size-3.5 text-muted-foreground transition-transform duration-150 ease-out group-hover/pill:translate-x-0.5" />
          </a>
        )}
        <h1
          className={cn(
            "font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl",
            ENTER,
            "delay-75"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "max-w-xl text-lg text-pretty text-muted-foreground",
              ENTER,
              "delay-150"
            )}
          >
            {description}
          </p>
        )}
        {actions && (
          <div
            className={cn(
              "flex flex-wrap justify-center gap-2 [--ds-radius-control:9999px]",
              ENTER,
              "delay-200"
            )}
          >
            {actions}
          </div>
        )}
      </div>
      {media && (
        <div className={cn("relative w-full", ENTER, "delay-300")}>
          <div
            aria-hidden
            className="absolute inset-x-[10%] top-[8%] bottom-0 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--ds-chart-1)_35%,transparent),transparent)] blur-3xl"
          />
          <div className="overflow-hidden rounded-2xl bg-card p-1.5 shadow-modal">
            <div className="overflow-hidden rounded-xl shadow-border">
              {media}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/** "Trusted by" row: muted logos that reflow, full color on hover. */
export function LogoCloud({
  title,
  logos,
  className,
}: {
  title?: React.ReactNode
  logos: { name: string; logo: React.ReactNode }[]
  className?: string
}) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6",
        className
      )}
    >
      {title && (
        <p className="text-center text-sm text-muted-foreground">{title}</p>
      )}
      <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {logos.map((item) => (
          <li
            key={item.name}
            title={item.name}
            className="text-muted-foreground grayscale transition-[color,filter] duration-200 hover:text-foreground hover:grayscale-0"
          >
            {item.logo}
          </li>
        ))}
      </ul>
    </section>
  )
}

type Tone = "blue" | "green" | "amber" | "orange" | "red" | "purple" | "gray"

/** A heading and a grid of features, each an icon tile, title and sentence. */
export function FeatureGrid({
  eyebrow,
  title,
  description,
  features,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  features: {
    icon: React.ReactNode
    title: string
    description: React.ReactNode
    tone?: Tone
  }[]
  className?: string
}) {
  return (
    <section
      className={cn(
        "@container mx-auto flex w-full max-w-6xl flex-col gap-12 px-6",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-3">
        {eyebrow && (
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        )}
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </div>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 @xl:grid-cols-2 @4xl:grid-cols-3">
        {features.map((feature) => (
          <li key={feature.title} className="flex flex-col gap-3">
            <IconTile tone={feature.tone ?? "neutral"}>{feature.icon}</IconTile>
            <h3 className="font-medium">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export type Testimonial = {
  quote: string
  name: string
  role: string
  initials: string
}

/**
 * Quotes in balanced columns. The first one is featured: larger, spanning the
 * width above the rest.
 */
export function Testimonials({
  title,
  items,
  className,
}: {
  title?: React.ReactNode
  items: Testimonial[]
  className?: string
}) {
  const [featured, ...rest] = items
  const person = (item: Testimonial) => (
    <figcaption className="flex items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback className="text-xs">{item.initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm">
        <span className="block font-medium">{item.name}</span>
        <span className="block text-muted-foreground">{item.role}</span>
      </span>
    </figcaption>
  )
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-6",
        className
      )}
    >
      {title && (
        <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance">
          {title}
        </h2>
      )}
      {featured && (
        <figure className="flex flex-col gap-6 rounded-2xl bg-muted/60 p-8 md:p-12">
          <blockquote className="font-heading text-2xl font-medium tracking-tight text-balance md:text-3xl">
            “{featured.quote}”
          </blockquote>
          {person(featured)}
        </figure>
      )}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {rest.map((item) => (
          <figure
            key={item.name}
            className="mb-4 flex break-inside-avoid flex-col gap-5 rounded-2xl bg-card p-6 shadow-border"
          >
            <blockquote className="text-sm leading-relaxed">
              “{item.quote}”
            </blockquote>
            {person(item)}
          </figure>
        ))}
      </div>
    </section>
  )
}
