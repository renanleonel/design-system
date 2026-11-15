"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Stepper } from "@/components/ui/stepper"

const CHECKOUT = [
  { title: "Cart", description: "Review your items" },
  { title: "Shipping", description: "Where should it go?" },
  { title: "Payment", description: "Card or Pix" },
  { title: "Confirmation" },
]

/** Controlled: Back and Next move the current step; earlier steps turn into checks. */
export function Default() {
  const [step, setStep] = React.useState(1)
  return (
    <div className="flex w-full flex-col gap-6">
      <Stepper steps={CHECKOUT} value={step} aria-label="Checkout progress" />
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </Button>
        <Button
          disabled={step === CHECKOUT.length}
          onClick={() => setStep((s) => s + 1)}
        >
          {step === CHECKOUT.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  )
}

/** Stacks; the connector runs down between markers. */
export function Vertical() {
  return (
    <Stepper
      orientation="vertical"
      value={2}
      aria-label="Onboarding progress"
      className="max-w-sm"
      steps={[
        { title: "Create account", description: "Email and password" },
        {
          title: "Verify email",
          description: "Code sent to renan@example.com",
        },
        { title: "Choose a plan", description: "Free, Pro or Team" },
        { title: "Invite your team" },
      ]}
    />
  )
}

/** Uncontrolled and clickable: pick any step. Starts at the second. */
export function Clickable() {
  return (
    <Stepper
      clickable
      defaultValue={1}
      aria-label="Setup steps"
      steps={[
        { title: "Profile" },
        { title: "Workspace" },
        { title: "Billing" },
        {
          title: "Review",
          disabled: true,
          description: "Locked until billing",
        },
      ]}
    />
  )
}

/** A failed step keeps its place and shows red. */
export function WithError() {
  return (
    <Stepper
      value={2}
      aria-label="Import progress"
      steps={[
        { title: "Upload" },
        {
          title: "Map columns",
          error: true,
          description: "2 columns unmapped",
        },
        { title: "Validate" },
        { title: "Import" },
      ]}
    />
  )
}

/** Everything done: `value` equals the number of steps. */
export function Complete() {
  return <Stepper value={CHECKOUT.length} steps={CHECKOUT} aria-label="Done" />
}

/** Twelve steps, long Brazilian names, CJK and Arabic. Wraps instead of overflowing. */
export function WorstCase() {
  return (
    <div className="flex w-full flex-col gap-8">
      <Stepper
        value={4}
        clickable
        aria-label="Long flow"
        steps={[
          {
            title: "Maria Eduarda dos Santos Albuquerque Cavalcanti",
            description: "Titular da conta e responsável legal",
          },
          { title: "João Pedro de Oliveira Neto" },
          {
            title: "プロジェクトの設定",
            description: "チームメンバーを招待する",
          },
          { title: "إعداد المشروع", description: "دعوة أعضاء الفريق" },
          {
            title:
              "Supercalifragilisticexpialidocious_unbreakable_word_0123456789",
          },
          { title: "Seis" },
          { title: "Sete", error: true },
          { title: "Oito" },
          { title: "Nove" },
          { title: "Dez" },
          { title: "Onze" },
          { title: "Doze" },
        ]}
      />
      <Stepper
        orientation="vertical"
        value={1}
        aria-label="Long flow, stacked"
        className="max-w-xs"
        steps={[
          {
            title:
              "Contrato de prestação de serviços de Maria Eduarda dos Santos",
          },
          {
            title: "インボイスの確認と承認",
            description: "経理部門が確認します",
          },
          { title: "مراجعة الفاتورة", description: "سيتم المراجعة قريبا" },
        ]}
      />
    </div>
  )
}

/** One step: just the marker. */
export function One() {
  return <Stepper steps={[{ title: "Only step" }]} aria-label="Single step" />
}

/** No steps renders an empty list. */
export function Empty() {
  return (
    <div className="text-sm text-muted-foreground">
      <Stepper steps={[]} aria-label="No steps" />
      No steps configured.
    </div>
  )
}
