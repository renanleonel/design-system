"use client"

import { MailIcon, RssIcon } from "lucide-react"

import { SiteFooter } from "@/components/blocks/site-footer/site-footer"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** SiteFooter filled with sample links (used by the docs site and the demo). */
export function DemoFooter() {
  return (
    <SiteFooter
      brand="renan/ui"
      tagline="Components and blocks for shipping SaaS fast."
      onSubscribe={async (email) => {
        await wait(800)
        if (email.endsWith("@example.com"))
          throw new Error("That address bounced. Try another one.")
      }}
      columns={[
        {
          title: "Product",
          links: [
            { label: "Components", href: "/components" },
            { label: "Blocks", href: "/blocks" },
            { label: "Themes", href: "/themes" },
            { label: "Changelog", href: "#changelog", badge: "New" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "Examples", href: "/examples" },
            { label: "Composition guide", href: "#composition" },
            { label: "Accessibility", href: "#a11y" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#about" },
            { label: "Blog", href: "#blog" },
            { label: "Contact", href: "#contact" },
          ],
        },
        {
          title: "Legal",
          links: [
            { label: "Privacy", href: "#privacy" },
            { label: "Terms", href: "#terms" },
          ],
        },
      ]}
      social={[
        { label: "Email", href: "mailto:hello@example.com", icon: <MailIcon /> },
        { label: "RSS", href: "#rss", icon: <RssIcon /> },
      ]}
      copyright="© 2026 renan/ui"
      status={{ label: "All systems normal", href: "#status" }}
    />
  )
}
