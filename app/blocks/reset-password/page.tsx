import { HexagonIcon } from "lucide-react"

import { AuthLayout, ResetPasswordForm } from "@/components/blocks/auth/auth"

export default function Page() {
  return (
    <AuthLayout logo={<HexagonIcon />} title="Reset your password">
      <ResetPasswordForm signInHref="/blocks/sign-in" />
    </AuthLayout>
  )
}
