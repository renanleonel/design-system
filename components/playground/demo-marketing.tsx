"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BoxesIcon,
  GaugeIcon,
  GitBranchIcon,
  HexagonIcon,
  KeyboardIcon,
  LayersIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TriangleIcon,
  WavesIcon,
} from "lucide-react"

import { MarketingHeader } from "@/components/blocks/marketing/marketing-header"
import {
  FeatureGrid,
  Hero,
  LogoCloud,
  Testimonials,
} from "@/components/blocks/marketing/sections"
import {
  CtaBand,
  PeriodToggle,
  PricingFaq,
  PricingPlans,
  SAMPLE_FAQ,
  SAMPLE_PLANS,
  type Period,
} from "@/components/blocks/pricing/pricing"
import { DemoFooter } from "@/components/playground/demo-footer"
import { Button } from "@/components/ui/button"
import { useUrlState } from "@/hooks/use-url-state"

/** Header and footer around the marketing demos, wired to Next.js. */
export function DemoMarketingFrame({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <MarketingHeader
        brand={
          <>
            <span className="grid size-6 place-items-center rounded-md bg-foreground text-background [&_svg]:size-3.5">
              <HexagonIcon />
            </span>
            Acme
          </>
        }
        links={[
          { label: "Product", href: "/blocks/landing" },
          { label: "Pricing", href: "/blocks/pricing" },
          { label: "Docs", href: "/components" },
          { label: "Changelog", href: "#changelog" },
        ]}
        currentPath={pathname}
        signInHref="/blocks/sign-in"
        cta={{ label: "Start for free", href: "/blocks/sign-up" }}
        linkComponent={Link}
      />
      <main className="flex flex-1 flex-col">{children}</main>
      <DemoFooter />
    </div>
  )
}

const wordmark = (icon: React.ReactNode, name: string) => (
  <span className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight [&_svg]:size-5">
    {icon}
    {name}
  </span>
)

/** A landing page assembled from the marketing and pricing blocks. */
export function DemoLanding() {
  const [periodParam, setPeriod] = useUrlState("period", "yearly")
  const period: Period = periodParam === "monthly" ? "monthly" : "yearly"
  return (
    <div className="flex flex-col gap-24 pb-24 md:gap-32">
      <Hero
        announcement={{ label: "New: resizable sidebars", href: "/blocks" }}
        title="The fastest way from idea to production"
        description="Preview every push, roll back in a click and see what your users see. Built for teams who ship daily."
        actions={
          <>
            <Button size="lg">Start for free</Button>
            <Button size="lg" variant="outline">
              Book a demo
            </Button>
          </>
        }
        media={
          <iframe
            src="/blocks/dashboard?chrome=0"
            title="Product preview"
            tabIndex={-1}
            aria-hidden
            loading="lazy"
            className="pointer-events-none block aspect-[16/10] w-full bg-background"
          />
        }
      />
      <LogoCloud
        title="Trusted by teams at"
        logos={[
          { name: "Northwind", logo: wordmark(<WavesIcon />, "Northwind") },
          { name: "Triangle", logo: wordmark(<TriangleIcon />, "Triangle") },
          { name: "Boxed", logo: wordmark(<BoxesIcon />, "Boxed") },
          { name: "Layerly", logo: wordmark(<LayersIcon />, "Layerly") },
          { name: "Sparkle", logo: wordmark(<SparklesIcon />, "Sparkle") },
        ]}
      />
      <FeatureGrid
        eyebrow="Why Acme"
        title="Everything between the commit and the customer"
        description="Fewer tools to wire together, and nothing to babysit."
        features={[
          {
            icon: <GitBranchIcon />,
            tone: "blue",
            title: "Preview every branch",
            description:
              "A live URL for every pull request, with comments right on the page.",
          },
          {
            icon: <GaugeIcon />,
            tone: "green",
            title: "Fast by default",
            description:
              "Edge caching and image optimization without a config file.",
          },
          {
            icon: <ShieldCheckIcon />,
            tone: "purple",
            title: "Secure from day one",
            description:
              "SSO, audit logs and least-privilege roles on every plan that needs them.",
          },
          {
            icon: <KeyboardIcon />,
            tone: "amber",
            title: "Keyboard first",
            description:
              "Command palette, hotkeys for every action, and nothing hidden behind hover.",
          },
          {
            icon: <PaletteIcon />,
            tone: "orange",
            title: "Your brand, everywhere",
            description:
              "Themes from one file: colors, radius and density follow through.",
          },
          {
            icon: <LayersIcon />,
            tone: "gray",
            title: "Grows with you",
            description:
              "From a side project to an enterprise rollout on the same stack.",
          },
        ]}
      />
      <Testimonials
        title="Teams ship more and worry less"
        items={[
          {
            quote:
              "We went from weekly releases to shipping several times a day, and our incident count went down.",
            name: "Marta Silva",
            role: "VP Engineering, Northwind",
            initials: "MS",
          },
          {
            quote:
              "Previews changed how design reviews work here. Nobody waits for staging anymore.",
            name: "Pedro Almeida",
            role: "Design lead, Layerly",
            initials: "PA",
          },
          {
            quote: "The audit log alone got us through our SOC 2 review.",
            name: "Beatriz Costa",
            role: "Security, Boxed",
            initials: "BC",
          },
          {
            quote:
              "Setup took an afternoon. Migrating our twelve services took a week.",
            name: "Lucas Ferreira",
            role: "Platform, Triangle",
            initials: "LF",
          },
        ]}
      />
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Pricing
          </h2>
          <PeriodToggle
            value={period}
            onValueChange={setPeriod}
            yearlyDiscount={0.2}
          />
        </div>
        <PricingPlans plans={SAMPLE_PLANS} period={period} className="w-full" />
      </section>
      <PricingFaq
        items={SAMPLE_FAQ}
        className="mx-auto w-full max-w-6xl px-6"
      />
      <CtaBand
        className="mx-auto w-full max-w-6xl px-6"
        title="Ship your next project this week"
        description="Free for side projects. 14-day Pro trial, no card required."
        actions={
          <>
            <Button size="lg">Start for free</Button>
            <Button size="lg" variant="outline">
              Talk to sales
            </Button>
          </>
        }
      />
    </div>
  )
}
