"use client"

import * as React from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "sonner"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

/** Type or paste 6 digits; `onComplete` fires on the last one. */
export function Default() {
  return (
    <Field className="w-auto">
      <FieldLabel htmlFor="otp">Verification code</FieldLabel>
      <InputOTP
        id="otp"
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        onComplete={(code) => toast.success(`Verified ${code}`)}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription>We sent it to ada@acme.com.</FieldDescription>
    </Field>
  )
}

export function Controlled() {
  const [value, setValue] = React.useState("")
  return (
    <div className="flex flex-col items-center gap-2">
      <InputOTP
        maxLength={4}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={setValue}
        aria-label="PIN"
      >
        <InputOTPGroup>
          {[0, 1, 2, 3].map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <p className="text-sm text-muted-foreground tabular-nums">
        {value ? `Entered ${value}` : "Enter your PIN"}
      </p>
    </div>
  )
}
