"use client"

import * as React from "react"
import { cn } from "cn"
import { ArrowLeftIcon, CheckIcon, PartyPopperIcon } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormBanner,
  FormField,
  FormSubmit,
  useZodForm,
} from "@/components/ui/form"
import { IconTile } from "@/components/ui/icon-tile"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { setSearchParams, useUrlState } from "@/hooks/use-url-state"

// --- Schemas ---------------------------------------------------------------------

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)

const workspaceSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "The URL needs at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  region: z.enum(["fra", "iad", "gru", "sin"]),
})

const emailList = z.string().transform((value, ctx) => {
  const emails = value
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean)
  const invalid = emails.filter((e) => !z.email().safeParse(e).success)
  if (invalid.length)
    ctx.addIssue({
      code: "custom",
      message: `Check ${invalid.length === 1 ? "this address" : "these addresses"}: ${invalid.join(", ")}`,
    })
  return [...new Set(emails)]
})

const teamSchema = z.object({
  emails: emailList,
  role: z.enum(["member", "admin"]),
})

const planSchema = z.object({ plan: z.enum(["hobby", "pro", "enterprise"]) })

export type SetupValues = {
  workspace: z.output<typeof workspaceSchema>
  team: z.output<typeof teamSchema>
  plan: z.output<typeof planSchema>
}

const STEPS = [
  { id: "workspace", title: "Workspace", description: "Name and URL" },
  { id: "team", title: "Team", description: "Invite people" },
  { id: "plan", title: "Plan", description: "Pick what fits" },
] as const
type StepId = (typeof STEPS)[number]["id"] | "done"

const REGIONS = [
  { value: "fra", label: "Frankfurt (eu-central)" },
  { value: "iad", label: "Virginia (us-east)" },
  { value: "gru", label: "São Paulo (sa-east)" },
  { value: "sin", label: "Singapore (ap-southeast)" },
]

const ROLES = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
]

const PLANS = [
  { value: "hobby", label: "Hobby", price: "Free", description: "3 projects, 1 seat" },
  { value: "pro", label: "Pro", price: "$24 / seat", description: "Unlimited projects, previews, audit log" },
  { value: "enterprise", label: "Enterprise", price: "Custom", description: "SSO, SLA and a success manager" },
]

// --- Pieces ----------------------------------------------------------------------

/** Step list: done steps get a check and can be revisited, upcoming ones can't. */
function Stepper({
  current,
  completed,
  onGo,
}: {
  current: number
  completed: number
  onGo: (index: number) => void
}) {
  return (
    <ol className="flex gap-2 md:flex-col md:gap-1">
      {STEPS.map((step, i) => {
        const done = i < completed
        const active = i === current
        return (
          <li key={step.id} className="min-w-0 flex-1 md:flex-none">
            <button
              type="button"
              disabled={!done && !active}
              aria-current={active ? "step" : undefined}
              onClick={() => onGo(i)}
              className="group/step flex w-full items-center gap-3 rounded-lg p-1.5 text-start focus-ring transition-colors enabled:hover:bg-muted/60 disabled:cursor-default md:p-2"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors duration-200",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-foreground",
                  !done && !active && "text-muted-foreground"
                )}
              >
                {done ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden min-w-0 md:block">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    !done && !active && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function StepFooter({
  onBack,
  onSkip,
  submitLabel = "Continue",
}: {
  onBack?: () => void
  onSkip?: () => void
  submitLabel?: string
}) {
  return (
    <div className="flex items-center gap-2 border-t pt-6">
      {onBack && (
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
      )}
      <div className="ms-auto flex items-center gap-2">
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <FormSubmit hotkey="Mod+Enter" showHotkey>
          {submitLabel}
        </FormSubmit>
      </div>
    </div>
  )
}

// --- Steps -----------------------------------------------------------------------

function WorkspaceStep({
  defaults,
  onNext,
}: {
  defaults?: SetupValues["workspace"]
  onNext: (values: SetupValues["workspace"]) => void
}) {
  const form = useZodForm(workspaceSchema, {
    defaultValues: defaults ?? { name: "", slug: "", region: "fra" },
  })
  // The URL follows the name until someone edits it by hand.
  const [slugEdited, setSlugEdited] = React.useState(!!defaults)
  return (
    <Form form={form} onSubmit={onNext} className="flex flex-col gap-6">
      <StepHeader
        title="Create your workspace"
        description="This is where your projects and team live. You can rename it later."
      />
      <FormBanner />
      <FormField
        name="name"
        label="Workspace name"
        required
        render={({ onChange, ...field }) => (
          <Input
            placeholder="Acme"
            autoComplete="organization"
            onChange={(event) => {
              onChange(event)
              if (!slugEdited)
                form.setValue("slug", slugify(event.target.value), {
                  shouldValidate: form.formState.isSubmitted,
                })
            }}
            {...field}
          />
        )}
      />
      <FormField
        name="slug"
        label="URL"
        required
        description="Letters, numbers and dashes."
        render={({ onChange, ...field }) => (
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>acme.app/</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              spellCheck={false}
              onChange={(event) => {
                setSlugEdited(true)
                onChange(event)
              }}
              {...field}
            />
          </InputGroup>
        )}
      />
      <FormField
        name="region"
        label="Data region"
        description="Where your data is stored. Pick the one closest to your users."
        render={({ value, onChange, id, ...field }) => (
          <Select items={REGIONS} value={value} onValueChange={onChange} id={id}>
            <SelectTrigger id={id} className="w-full" {...field}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <StepFooter />
    </Form>
  )
}

function TeamStep({
  defaults,
  onNext,
  onBack,
}: {
  defaults?: z.input<typeof teamSchema>
  onNext: (values: SetupValues["team"]) => void
  onBack: () => void
}) {
  const form = useZodForm(teamSchema, {
    defaultValues: defaults ?? { emails: "", role: "member" },
  })
  return (
    <Form form={form} onSubmit={onNext} className="flex flex-col gap-6">
      <StepHeader
        title="Invite your team"
        description="Paste a list, one per line or separated by commas. They'll get an email to join."
      />
      <FormField
        name="emails"
        label="Email addresses"
        render={(field) => (
          <Textarea
            rows={4}
            spellCheck={false}
            placeholder={"ana@acme.com\njoao@acme.com"}
            {...field}
          />
        )}
      />
      <FormField
        name="role"
        label="Role"
        description="Admins can manage billing and members."
        render={({ value, onChange, id, ...field }) => (
          <Select items={ROLES} value={value} onValueChange={onChange} id={id}>
            <SelectTrigger id={id} className="w-40" {...field}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <StepFooter
        onBack={onBack}
        onSkip={() => onNext({ emails: [], role: "member" })}
        submitLabel="Send invites"
      />
    </Form>
  )
}

function PlanStep({
  defaults,
  onNext,
  onBack,
}: {
  defaults?: SetupValues["plan"]
  onNext: (values: SetupValues["plan"]) => Promise<void>
  onBack: () => void
}) {
  const form = useZodForm(planSchema, {
    defaultValues: defaults ?? { plan: "pro" },
  })
  return (
    <Form form={form} onSubmit={onNext} className="flex flex-col gap-6">
      <StepHeader
        title="Choose a plan"
        description="Pro starts with a 14-day trial. No card needed until it ends."
      />
      <FormBanner />
      <FormField
        name="plan"
        label="Plan"
        className="[&>[data-slot=field-label]]:sr-only"
        render={({ value, onChange, id, ...field }) => (
          <RadioGroup
            value={value}
            onValueChange={onChange}
            aria-label="Plan"
            className="gap-2"
            {...field}
          >
            {PLANS.map((plan) => (
              <label
                key={plan.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl p-4 shadow-border transition-shadow hover:shadow-border-hover has-data-checked:ring-2 has-data-checked:ring-primary has-data-checked:shadow-none"
              >
                <RadioGroupItem value={plan.value} id={plan.value === value ? id : undefined} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{plan.label}</span>
                  <span className="block text-sm text-muted-foreground">
                    {plan.description}
                  </span>
                </span>
                <span className="text-sm font-medium tabular-nums">{plan.price}</span>
              </label>
            ))}
          </RadioGroup>
        )}
      />
      <StepFooter onBack={onBack} submitLabel="Create workspace" />
    </Form>
  )
}

// --- Wizard ----------------------------------------------------------------------

/**
 * First-run setup: workspace → team → plan → done. The step lives in the URL
 * (`?step=team`), so back/forward and refresh work; a step can't be opened
 * before the ones it depends on. Each step validates on its own, values are
 * kept when going back, and the content slides in the direction you move.
 * `onComplete` runs on the last step; a throw shows its message in a banner.
 */
export function SetupWizard({
  brand,
  onComplete,
  continueHref = "/",
}: {
  brand: React.ReactNode
  onComplete: (values: SetupValues) => Promise<void> | void
  /** Where "Go to dashboard" leads when done. */
  continueHref?: string
}) {
  const [stepParam] = useUrlState("step", "workspace", "push")
  const [values, setValues] = React.useState<Partial<SetupValues>>({})
  const [teamInput, setTeamInput] = React.useState<z.input<typeof teamSchema>>()
  const [direction, setDirection] = React.useState<1 | -1>(1)

  // Derive the step during render: never past the first unfinished one.
  const completed = values.workspace ? (values.team ? (values.plan ? 3 : 2) : 1) : 0
  const requested = STEPS.findIndex((s) => s.id === stepParam)
  const index =
    stepParam === "done" && completed === 3
      ? 3
      : Math.min(requested === -1 ? 0 : requested, completed)
  const step: StepId = index === 3 ? "done" : STEPS[index].id

  const go = (next: number) => {
    setDirection(next >= index ? 1 : -1)
    setSearchParams(
      { step: next === 0 ? null : next === 3 ? "done" : STEPS[next].id },
      "push"
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground md:flex-row">
      <aside className="flex flex-col gap-6 border-b bg-sidebar p-4 md:w-72 md:border-e md:border-b-0 md:p-6">
        <div className="font-heading text-sm font-semibold">{brand}</div>
        {step !== "done" && (
          <Stepper current={index} completed={completed} onGo={go} />
        )}
        <p className="hidden text-xs text-muted-foreground md:mt-auto md:block">
          Step {Math.min(index + 1, 3)} of 3
        </p>
      </aside>
      <main className="flex flex-1 justify-center px-4 py-10 md:items-center md:px-10">
        <div
          key={step}
          style={{ "--dir": direction } as React.CSSProperties}
          className="w-full max-w-lg transition-[opacity,translate] duration-300 ease-out starting:translate-x-[calc(var(--dir)*1rem)] starting:opacity-0 motion-reduce:transition-none"
        >
          {step === "workspace" && (
            <WorkspaceStep
              defaults={values.workspace}
              onNext={(workspace) => {
                setValues((v) => ({ ...v, workspace }))
                go(1)
              }}
            />
          )}
          {step === "team" && (
            <TeamStep
              defaults={teamInput}
              onBack={() => go(0)}
              onNext={(team) => {
                setTeamInput({ emails: team.emails.join("\n"), role: team.role })
                setValues((v) => ({ ...v, team }))
                go(2)
              }}
            />
          )}
          {step === "plan" && (
            <PlanStep
              defaults={values.plan}
              onBack={() => go(1)}
              onNext={async (plan) => {
                const all = { ...values, plan } as SetupValues
                await onComplete(all)
                setValues(all)
                go(3)
              }}
            />
          )}
          {step === "done" && (
            <div className="flex flex-col items-start gap-6">
              <IconTile tone="green" size="lg">
                <PartyPopperIcon />
              </IconTile>
              <StepHeader
                title={`${values.workspace?.name} is ready`}
                description={
                  values.team?.emails.length
                    ? `We sent ${values.team.emails.length} invite${values.team.emails.length === 1 ? "" : "s"}. Next, create your first project.`
                    : "Next, create your first project. You can invite your team any time from Settings."
                }
              />
              <Button size="lg" render={<a href={continueHref} />} nativeButton={false}>
                Go to dashboard
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
