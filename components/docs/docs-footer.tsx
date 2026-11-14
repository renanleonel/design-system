"use client"

import Link from "next/link"
import { MailIcon } from "lucide-react"

import { SiteFooter } from "@/components/blocks/site-footer/site-footer"
import { GitHubIcon } from "@/components/docs/github-icon"
import { LogoMark } from "@/components/docs/logo-mark"

const EMAIL = "renanleonel0@gmail.com"

/** The docs site's footer: every link resolves (pages here, or the repo). */
export function DocsFooter({ githubUrl }: { githubUrl: string }) {
  const blob = (path: string) => `${githubUrl}/blob/main/${path}`
  return (
    <SiteFooter
      brand={
        <span className="flex items-center gap-2">
          <LogoMark className="size-5" />
          renanleonel/ui
        </span>
      }
      tagline="An open-source shadcn registry on Base UI. Components and blocks for shipping SaaS fast."
      linkComponent={Link}
      columns={[
        {
          title: "Library",
          links: [
            { label: "Components", href: "/components" },
            { label: "Blocks", href: "/blocks" },
            { label: "Themes", href: "/themes" },
          ],
        },
        {
          title: "Guides",
          links: [
            { label: "Component rules", href: blob("docs/RULES.md") },
            { label: "Composition", href: blob("docs/COMPOSITION.md") },
            { label: "Blocks", href: blob("docs/BLOCKS.md") },
            { label: "Workflows", href: blob("docs/WORKFLOWS.md") },
          ],
        },
        {
          title: "Project",
          links: [
            { label: "Source on GitHub", href: githubUrl },
            { label: "Changelog", href: `${githubUrl}/commits/main` },
            { label: "Report an issue", href: `${githubUrl}/issues/new` },
            { label: "Contact", href: `mailto:${EMAIL}` },
          ],
        },
      ]}
      social={[
        {
          label: `Email ${EMAIL}`,
          href: `mailto:${EMAIL}`,
          icon: <MailIcon />,
        },
        {
          label: "GitHub",
          href: githubUrl,
          icon: <GitHubIcon className="size-4" />,
        },
      ]}
      copyright="© 2026 renanleonel/ui"
    />
  )
}
