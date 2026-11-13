"use client"

import * as React from "react"
import { ArrowBigUpDashIcon, EyeIcon, EyeOffIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

/**
 * A password field with a show/hide toggle and a Caps Lock warning. Defaults
 * to `autoComplete="current-password"`; pass `"new-password"` on sign-up so
 * password managers offer to generate one. Showing the password keeps focus
 * and the caret where they were.
 */
function PasswordInput({
  className,
  autoComplete = "current-password",
  onKeyDown,
  onKeyUp,
  onBlur,
  disabled,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false)
  const [capsLock, setCapsLock] = React.useState(false)
  const readCaps = (e: React.KeyboardEvent) => {
    const on = e.getModifierState("CapsLock")
    if (on !== capsLock) setCapsLock(on)
  }

  return (
    <InputGroup data-slot="password-input" className={className}>
      <InputGroupInput
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        onKeyDown={(e) => {
          readCaps(e)
          onKeyDown?.(e)
        }}
        onKeyUp={(e) => {
          readCaps(e)
          onKeyUp?.(e)
        }}
        onBlur={(e) => {
          setCapsLock(false)
          onBlur?.(e)
        }}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {capsLock && (
          <InputGroupText role="status" className="text-xs">
            <ArrowBigUpDashIcon aria-hidden />
            Caps Lock is on
          </InputGroupText>
        )}
        <InputGroupButton
          size="icon-xs"
          aria-label="Show password"
          aria-pressed={visible}
          disabled={disabled}
          className="hit-area"
          // Keeps focus (and the caret) in the input on click.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
