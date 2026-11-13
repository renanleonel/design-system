"use client"

import { HexagonIcon } from "lucide-react"

import { SetupWizard } from "@/components/blocks/onboarding/setup-wizard"
import { DemoBackLink } from "@/components/playground/demo-back-link"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Page() {
  return (
    <>
      <DemoBackLink position="top-right" />
      <SetupWizard
        brand={
          <span className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-foreground text-background [&_svg]:size-3.5">
              <HexagonIcon />
            </span>
            Acme
          </span>
        }
        continueHref="/blocks/dashboard"
        onComplete={async (values) => {
          await wait(900)
          if (values.workspace.slug === "taken")
            throw new Error(
              "acme.app/taken is already in use. Go back and pick another URL."
            )
        }}
      />
    </>
  )
}
