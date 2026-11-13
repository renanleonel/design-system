import { HexagonIcon } from "lucide-react"

import { AuthLayout, SignInForm } from "@/components/blocks/auth/auth"

export default function Page() {
  return (
    <AuthLayout
      logo={<HexagonIcon />}
      title="Sign in to Acme"
      description="Use password “demo” to get past the error state."
      footer={
        <>
          New to Acme?{" "}
          <a
            href="/blocks/sign-up"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </a>
        </>
      }
    >
      <SignInForm resetHref="/blocks/reset-password" />
    </AuthLayout>
  )
}
