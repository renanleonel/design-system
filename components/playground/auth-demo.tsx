"use client"

import { HexagonIcon } from "lucide-react"
import { toast } from "sonner"

import {
  AuthLayout,
  AuthShowcase,
  ResetPasswordForm,
  SignInForm,
  SignUpForm,
} from "@/components/blocks/auth/auth"
import { ReleasesPanel } from "@/components/examples/releases-panel"
import { Toaster } from "@/components/ui/sonner"
import { useSearchParams } from "@/hooks/use-url-state"

// Demo wiring: replace these with your auth library calls.
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const google = async () => {
  await wait(1200)
  toast("Redirecting to Google… (demo)")
}

const footerLink = (href: string, children: React.ReactNode) => (
  <a
    href={href}
    className="font-medium text-foreground underline-offset-4 hover:underline"
  >
    {children}
  </a>
)

/** ?layout=image-left | image-right switches to the split layout. */
function useLayout() {
  const layout = useSearchParams().get("layout")
  return layout === "image-left" || layout === "image-right"
    ? {
        media: (
          <AuthShowcase
            logo={<HexagonIcon />}
            brand="Acme"
            preview={<ReleasesPanel />}
          />
        ),
        mediaSide:
          layout === "image-left" ? ("start" as const) : ("end" as const),
      }
    : {}
}

export function SignInDemo() {
  const layout = useLayout()
  return (
    <>
      <AuthLayout
        logo={<HexagonIcon />}
        title="Sign in to Acme"
        description="Use password “demo” to get past the error state."
        footer={
          <>New to Acme? {footerLink("/blocks/sign-up", "Create an account")}</>
        }
        {...layout}
      >
        <SignInForm
          resetHref="/blocks/reset-password"
          onGoogle={google}
          onSso={() => toast("SSO (demo)")}
          onSubmit={async (values) => {
            await wait(900)
            if (values.password !== "demo") {
              throw new Error(
                "That email and password don't match. Try again or reset your password."
              )
            }
            toast.success("Signed in (demo)")
          }}
        />
      </AuthLayout>
      <Toaster />
    </>
  )
}

export function SignUpDemo() {
  const layout = useLayout()
  return (
    <>
      <AuthLayout
        logo={<HexagonIcon />}
        title="Create your Acme account"
        description="Free for 14 days. No card needed."
        footer={
          <>
            Already have an account? {footerLink("/blocks/sign-in", "Sign in")}
          </>
        }
        {...layout}
      >
        <SignUpForm
          onGoogle={google}
          onSubmit={async () => {
            await wait(900)
            toast.success("Account created (demo)")
          }}
        />
      </AuthLayout>
      <Toaster />
    </>
  )
}

export function ResetDemo() {
  return (
    <AuthLayout logo={<HexagonIcon />} title="Reset your password">
      <ResetPasswordForm
        signInHref="/blocks/sign-in"
        onSubmit={() => wait(800)}
      />
    </AuthLayout>
  )
}
