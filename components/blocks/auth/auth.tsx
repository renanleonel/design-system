"use client"

import * as React from "react"
import { cn } from "cn"
import { z } from "zod"
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  MailCheckIcon,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormBanner,
  FormField,
  FormSubmit,
  useZodForm,
} from "@/components/ui/form"
import { IconTile } from "@/components/ui/icon-tile"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Centered auth card on the tray tone, logo above, a quiet footer link below. */
function AuthLayout({
  logo,
  title,
  description,
  footer,
  children,
}: {
  logo: React.ReactNode
  title: string
  description?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-panel px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background [&_svg]:size-5">
            {logo}
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-border">{children}</div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </main>
  )
}

/** Password with a show/hide toggle. Paste always allowed; autocomplete set by the caller. */
function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  const [visible, setVisible] = React.useState(false)
  return (
    <InputGroup className={className}>
      <InputGroupInput
        type={visible ? "text" : "password"}
        spellCheck={false}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

const signInSchema = z.object({
  email: z.email("Enter an email like name@company.com"),
  password: z.string().min(1, "Enter your password"),
})

function SignInForm({ resetHref = "#" }: { resetHref?: string }) {
  const form = useZodForm(signInSchema, {
    defaultValues: { email: "", password: "" },
  })
  return (
    <div className="flex flex-col gap-5">
      <Button variant="outline" className="w-full">
        <KeyRoundIcon data-icon="inline-start" />
        Continue with SSO
      </Button>
      <Divider>or with email</Divider>
      <Form
        form={form}
        className="gap-4"
        onSubmit={async (values) => {
          await wait(900)
          if (values.password !== "demo") {
            throw new Error(
              "That email and password don't match. Try again or reset your password."
            )
          }
        }}
      >
        <FormBanner />
        <FormField
          name="email"
          label="Email"
          render={(field) => (
            <Input
              type="email"
              autoComplete="username"
              spellCheck={false}
              placeholder="name@company.com"
              {...field}
            />
          )}
        />
        <div className="flex flex-col gap-2">
          <FormField
            name="password"
            label="Password"
            render={(field) => (
              <PasswordInput autoComplete="current-password" {...field} />
            )}
          />
          <a
            href={resetHref}
            className="self-end rounded-sm text-sm text-muted-foreground underline-offset-4 focus-ring hover:text-foreground hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <FormSubmit className="w-full">Sign in</FormSubmit>
      </Form>
    </div>
  )
}

const RULES = [
  { label: "At least 10 characters", test: (v: string) => v.length >= 10 },
  { label: "A number", test: (v: string) => /\d/.test(v) },
  { label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
]

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters"),
  email: z.email("Enter an email like name@company.com"),
  password: z
    .string()
    .refine(
      (v) => RULES.every((r) => r.test(v)),
      "Password needs all three requirements below"
    ),
  terms: z.boolean().refine(Boolean, "Accept the terms to create an account"),
})

function SignUpForm() {
  const form = useZodForm(signUpSchema, {
    defaultValues: { name: "", email: "", password: "", terms: false },
  })

  const password = form.watch("password")
  return (
    <Form
      form={form}
      className="gap-4"
      onSubmit={async () => {
        await wait(900)
      }}
    >
      <FormBanner />
      <FormField
        name="name"
        label="Full name"
        render={(field) => <Input autoComplete="name" {...field} />}
      />
      <FormField
        name="email"
        label="Work email"
        render={(field) => (
          <Input
            type="email"
            autoComplete="email"
            spellCheck={false}
            {...field}
          />
        )}
      />
      <div className="flex flex-col gap-2">
        <FormField
          name="password"
          label="Password"
          render={(field) => (
            <PasswordInput autoComplete="new-password" {...field} />
          )}
        />
        <ul
          aria-label="Password requirements"
          className="flex flex-col gap-1 text-sm"
        >
          {RULES.map((rule) => {
            const ok = rule.test(password)
            return (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  ok ? "text-tone-green" : "text-muted-foreground"
                )}
              >
                <CheckIcon
                  className={cn("size-3.5", !ok && "opacity-30")}
                  aria-hidden
                />
                {rule.label}
                <span className="sr-only">{ok ? "(met)" : "(not met)"}</span>
              </li>
            )
          })}
        </ul>
      </div>
      <FormField
        name="terms"
        orientation="horizontal"
        label={
          <span className="font-normal">
            I agree to the{" "}
            <a href="#" className="underline underline-offset-4">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4">
              Privacy Policy
            </a>
          </span>
        }
        render={({ value, onChange, ...field }) => (
          <Checkbox checked={value} onCheckedChange={onChange} {...field} />
        )}
      />
      <FormSubmit className="w-full">Create account</FormSubmit>
    </Form>
  )
}

const resetSchema = z.object({
  email: z.email("Enter an email like name@company.com"),
})

function ResetPasswordForm({ signInHref = "#" }: { signInHref?: string }) {
  const [sentTo, setSentTo] = React.useState<string | null>(null)
  const form = useZodForm(resetSchema, { defaultValues: { email: "" } })
  if (sentTo) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 text-center"
      >
        <IconTile tone="green" size="lg">
          <MailCheckIcon />
        </IconTile>
        <div className="flex flex-col gap-1">
          <p className="font-medium">Check your inbox</p>
          <p className="text-sm text-muted-foreground">
            If <span className="font-medium text-foreground">{sentTo}</span> has
            an account, a reset link is on its way. It expires in 30 minutes.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSentTo(null)}
          >
            Use another email
          </Button>
          <a
            href={signInHref}
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
          >
            Back to sign in
          </a>
        </div>
      </div>
    )
  }
  return (
    <Form
      form={form}
      className="gap-4"
      onSubmit={async (values) => {
        await wait(800)
        setSentTo(values.email)
      }}
    >
      <FormField
        name="email"
        label="Email"
        description="We'll send a link to choose a new password."
        render={(field) => (
          <Input
            type="email"
            autoComplete="username"
            spellCheck={false}
            placeholder="name@company.com"
            {...field}
          />
        )}
      />
      <FormSubmit className="w-full">Send reset link</FormSubmit>
    </Form>
  )
}

export { AuthLayout, PasswordInput, ResetPasswordForm, SignInForm, SignUpForm }
