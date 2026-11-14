"use client"

import * as React from "react"
import { MailIcon, RssIcon } from "lucide-react"

import { SiteFooter } from "@/components/blocks/site-footer/site-footer"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** SiteFooter filled with a sample company's links (block demos only). */
export function DemoFooter() {
  const [language, setLanguage] = React.useState("en")
  return (
    <SiteFooter
      brand="Acme"
      tagline="Project tracking for teams that ship weekly."
      onSubscribe={async (email) => {
        await wait(800)
        if (email.endsWith("@example.com"))
          throw new Error("That address bounced. Try another one.")
      }}
      columns={[
        {
          title: "Product",
          links: [
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Integrations", href: "#integrations" },
            { label: "Changelog", href: "#changelog", badge: "New" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "Docs", href: "#docs" },
            { label: "Guides", href: "#guides" },
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
        { label: "Email", href: "mailto:hello@acme.app", icon: <MailIcon /> },
        { label: "RSS", href: "#rss", icon: <RssIcon /> },
      ]}
      copyright="© 2026 Acme, Inc."
      status={{ label: "All systems normal", href: "#status" }}
      language={language}
      onLanguageChange={setLanguage}
    />
  )
}
