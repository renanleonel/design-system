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
  XIcon,
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

/* ------------------------------------------------------------------ layout */

/**
 * Auth page frame. Without `media`: a centered card on the tray tone. With
 * `media`: a split screen, the form on the page background and the media on
 * an inset panel at `mediaSide` (hidden below lg, where the form stays alone).
 */
function AuthLayout({
  logo,
  title,
  description,
  footer,
  media,
  mediaSide = "end",
  children,
}: {
  logo: React.ReactNode
  title: string
  description?: React.ReactNode
  footer?: React.ReactNode
  /** `<AuthShowcase />`, `<AuthImage src alt />` or anything else. */
  media?: React.ReactNode
  mediaSide?: "start" | "end"
  children: React.ReactNode
}) {
  const heading = (
    <div
      className={cn(
        "flex flex-col gap-4",
        media ? "items-start" : "items-center text-center"
      )}
    >
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
  )
  const footerNode = footer && (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        media ? "text-start" : "text-center"
      )}
    >
      {footer}
    </p>
  )

  if (!media) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-panel px-4 py-12">
        <div className="flex w-full max-w-sm flex-col gap-6">
          {heading}
          <div className="rounded-2xl bg-card p-6 shadow-border">
            {children}
          </div>
          {footerNode}
        </div>
      </main>
    )
  }

  return (
    <main className="grid min-h-dvh grid-cols-[minmax(0,1fr)] bg-background p-2 lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-sm flex-col gap-8">
          {heading}
          {children}
          {footerNode}
        </div>
      </div>
      <aside
        className={cn(
          "relative hidden overflow-hidden rounded-xl lg:block",
          mediaSide === "start" && "lg:order-first"
        )}
      >
        {media}
      </aside>
    </main>
  )
}

/** A full-bleed image for the media panel, with the 1px inset outline from surfaces.md. */
function AuthImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- router/framework-agnostic block
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 size-full object-cover outline -outline-offset-1 outline-black/10 dark:outline-white/10"
    />
  )
}

/**
 * Default media when you have no photography: the brand on top, a real product
 * preview in the middle (pass any UI, it's rendered inert and hidden from screen
 * readers as a duplicate), and one customer quote with three proof points.
 */
function AuthShowcase({
  logo,
  brand,
  preview,
  quote = "We moved our whole release process over in an afternoon. The team hasn't looked back.",
  author = {
    name: "Juliana Alves",
    role: "Head of Engineering, Northwind",
    initials: "JA",
  },
  stats = [
    { value: "4,200+", label: "teams" },
    { value: "99.99%", label: "uptime" },
    { value: "SOC 2", label: "Type II" },
  ],
}: {
  logo?: React.ReactNode
  brand?: string
  /** A screenshot or live UI of the product, shown scaled down. */
  preview?: React.ReactNode
  quote?: string
  author?: { name: string; role: string; initials: string }
  stats?: { value: string; label: string }[]
}) {
  return (
    <div className="absolute inset-0 flex flex-col gap-10 overflow-hidden bg-foreground p-10 text-background">
      {(logo || brand) && (
        <div className="flex items-center gap-2.5 font-medium [&_svg]:size-5">
          {logo}
          {brand}
        </div>
      )}
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {preview && (
          <div
            aria-hidden
            inert
            className="pointer-events-none w-[44rem] max-w-none origin-center scale-[0.78] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] text-foreground select-none xl:scale-90"
          >
            {preview}
          </div>
        )}
      </div>
      <figure className="flex max-w-lg flex-col gap-5">
        <blockquote className="font-heading text-xl leading-snug font-medium tracking-tight text-balance">
          “{quote}”
        </blockquote>
        <figcaption className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-background/15 text-sm font-medium">
            {author.initials}
          </span>
          <span className="flex flex-col">
            <span className="font-medium">{author.name}</span>
            <span className="text-sm text-background/70">{author.role}</span>
          </span>
        </figcaption>
      </figure>
      <dl className="grid grid-cols-3 gap-6 border-t border-background/15 pt-6">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <dt className="order-last text-sm text-background/70">{s.label}</dt>
            <dd className="font-heading text-xl font-semibold tabular-nums">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* -------------------------------------------------------------- controls */

/** Google's mark. Brand rules require the four-color G, so it ignores currentColor. */
function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.35-2.09V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

/**
 * "Continue with Google". Wire it to your auth library:
 *   onClick={() => signIn("google")}                          // Auth.js / NextAuth
 *   onClick={() => authClient.signIn.social({ provider: "google" })}  // Better Auth
 *   onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
 *   href="/api/auth/google"                                    // server redirect
 * Stays busy until the page navigates away; on a thrown error it resets and
 * reports through `onError`.
 */
function GoogleButton({
  onClick,
  href,
  onError,
  label = "Continue with Google",
  className,
}: {
  onClick?: () => unknown
  href?: string
  onError?: (error: unknown) => void
  label?: string
  className?: string
}) {
  const [pending, setPending] = React.useState(false)
  if (href) {
    return (
      <a
        href={href}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full",
          className
        )}
      >
        <GoogleIcon data-icon="inline-start" />
        {label}
      </a>
    )
  }
  return (
    <Button
      variant="outline"
      className={cn("w-full", className)}
      loading={pending}
      onClick={async () => {
        setPending(true)
        try {
          await onClick?.()
        } catch (error) {
          setPending(false)
          onError?.(error)
        }
      }}
    >
      <GoogleIcon data-icon="inline-start" />
      {label}
    </Button>
  )
}

/**
 * Password with a show/hide toggle. The toggle doesn't take focus on click, so
 * revealing never blurs (and validates) the field. Paste is always allowed.
 */
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
          onPointerDown={(event) => event.preventDefault()}
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

/** Social / SSO buttons above the email form, with the "or" divider. */
function Providers({
  onGoogle,
  onSso,
}: {
  onGoogle?: () => unknown
  onSso?: () => unknown
}) {
  if (!onGoogle && !onSso) return null
  return (
    <>
      <div className="flex flex-col gap-2">
        {onGoogle && <GoogleButton onClick={onGoogle} />}
        {onSso && (
          <Button variant="outline" className="w-full" onClick={() => onSso()}>
            <KeyRoundIcon data-icon="inline-start" />
            Continue with SSO
          </Button>
        )}
      </div>
      <Divider>or with email</Divider>
    </>
  )
}

/* ----------------------------------------------------------------- forms */

const signInSchema = z.object({
  email: z.email("Enter an email like name@company.com"),
  password: z.string().min(1, "Enter your password"),
})
type SignInValues = z.output<typeof signInSchema>

/**
 * Email + password sign in. `onSubmit` throws to show a banner (the message is
 * shown as-is, so make it say what to do): "That email and password don't match."
 */
function SignInForm({
  onSubmit,
  onGoogle,
  onSso,
  resetHref = "#",
}: {
  onSubmit: (values: SignInValues) => unknown
  onGoogle?: () => unknown
  onSso?: () => unknown
  resetHref?: string
}) {
  const form = useZodForm(signInSchema, {
    defaultValues: { email: "", password: "" },
  })
  return (
    <div className="flex flex-col gap-5">
      <Providers onGoogle={onGoogle} onSso={onSso} />
      <Form form={form} className="gap-4" onSubmit={onSubmit}>
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
      "Meet every password requirement"
    ),
  terms: z.boolean().refine(Boolean, "Accept the terms to create an account"),
})
type SignUpValues = z.output<typeof signUpSchema>

/**
 * Sign up with live password rules. The rules list is the password's error:
 * unmet rules turn red once the field is invalid, instead of a second message.
 */
function SignUpForm({
  onSubmit,
  onGoogle,
  onSso,
  termsHref = "#",
  privacyHref = "#",
}: {
  onSubmit: (values: SignUpValues) => unknown
  onGoogle?: () => unknown
  onSso?: () => unknown
  termsHref?: string
  privacyHref?: string
}) {
  const rulesId = React.useId()
  const form = useZodForm(signUpSchema, {
    defaultValues: { name: "", email: "", password: "", terms: false },
  })
  const password = form.watch("password")
  const invalid = !!form.formState.errors.password

  return (
    <div className="flex flex-col gap-5">
      <Providers onGoogle={onGoogle} onSso={onSso} />
      <Form form={form} className="gap-4" onSubmit={onSubmit}>
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
            hideError
            describedBy={rulesId}
            render={(field) => (
              <PasswordInput autoComplete="new-password" {...field} />
            )}
          />
          <ul
            id={rulesId}
            aria-label="Password requirements"
            className="flex flex-col gap-1 text-sm"
          >
            {RULES.map((rule) => {
              const ok = rule.test(password)
              const failing = !ok && invalid
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    ok
                      ? "text-tone-green"
                      : failing
                        ? "text-destructive"
                        : "text-muted-foreground"
                  )}
                >
                  {failing ? (
                    <XIcon className="size-3.5 shrink-0" aria-hidden />
                  ) : (
                    <CheckIcon
                      className={cn("size-3.5 shrink-0", !ok && "opacity-30")}
                      aria-hidden
                    />
                  )}
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
              <a href={termsHref} className="underline underline-offset-4">
                Terms
              </a>{" "}
              and{" "}
              <a href={privacyHref} className="underline underline-offset-4">
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
    </div>
  )
}

const resetSchema = z.object({
  email: z.email("Enter an email like name@company.com"),
})

/**
 * Request a reset link. Always ends on "check your inbox" (never reveal whether
 * an account exists).
 */
function ResetPasswordForm({
  onSubmit,
  signInHref = "#",
}: {
  onSubmit: (values: { email: string }) => unknown
  signInHref?: string
}) {
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
        await onSubmit(values)
        setSentTo(values.email)
      }}
    >
      <FormBanner />
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

export {
  AuthImage,
  AuthLayout,
  AuthShowcase,
  GoogleButton,
  GoogleIcon,
  PasswordInput,
  ResetPasswordForm,
  SignInForm,
  SignUpForm,
  type SignInValues,
  type SignUpValues,
}
