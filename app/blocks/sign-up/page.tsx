import { HexagonIcon } from "lucide-react"

import { AuthLayout, SignUpForm } from "@/components/blocks/auth/auth"

export default function Page() {
  return (
    <AuthLayout
      logo={<HexagonIcon />}
      title="Create your Acme account"
      description="Free for 14 days. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <a
            href="/blocks/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </>
      }
    >
      <SignUpForm />
    </AuthLayout>
  )
}
