"use client"

import Link from "next/link"
import {
  ChevronRightIcon,
  FileSpreadsheetIcon,
  GlobeIcon,
  PlusIcon,
  RocketIcon,
  ServerIcon,
  UploadIcon,
} from "lucide-react"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { EmptyStateCard } from "@/components/blocks/onboarding/empty-state-card"
import {
  FeatureIntro,
  IntroArt,
} from "@/components/blocks/onboarding/feature-intro"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "@/hooks/use-url-state"

export default function Page() {
  const card = useSearchParams().get("variant") === "card"
  if (card)
    return (
      <>
        <AppShellHeader title="Deployments" />
        <AppShellContent>
          <EmptyStateCard
            title="Ship your first deployment"
            description="Connect a repository and every push gets a preview URL."
            actions={
              <>
                <Button>
                  <PlusIcon data-icon="inline-start" />
                  New deployment
                </Button>
                <Button variant="outline">Import</Button>
              </>
            }
            tiles={[
              <RocketIcon key="a" />,
              <GlobeIcon key="b" />,
              <ServerIcon key="c" />,
              <FileSpreadsheetIcon key="d" />,
            ]}
          />
        </AppShellContent>
      </>
    )
  return (
    <>
      <AppShellHeader title="Projects" />
      <FeatureIntro
        title="Projects"
        tagline="Where it all starts"
        art={<IntroArt />}
        actions={
          <>
            <Button hotkey="Mod+Enter">
              <PlusIcon data-icon="inline-start" />
              Project
            </Button>
            <Button variant="ghost">
              <UploadIcon data-icon="inline-start" />
              Import
            </Button>
          </>
        }
        hint={
          <>
            <strong>Don&apos;t have an idea yet?</strong> Start from a
            template: a landing page, a dashboard or an API, deployed in a
            minute and yours to change.{" "}
            {/* _top leaves the gallery's preview frame. */}
            <Link
              href="/blocks"
              target="_top"
              className="inline-flex items-center gap-0.5 rounded-sm font-medium text-foreground focus-ring hover:underline"
            >
              Browse templates
              <ChevronRightIcon className="size-3.5" />
            </Link>
          </>
        }
      />
    </>
  )
}
