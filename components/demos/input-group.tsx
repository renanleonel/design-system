"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"

export function Search() {
  return (
    <InputGroup className="max-w-xs">
      <InputGroupInput placeholder="Search…" aria-label="Search" />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Kbd>/</Kbd>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function WithText() {
  return (
    <InputGroup className="max-w-xs">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="acme" aria-label="Domain" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.app</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function WithButton() {
  const [copied, setCopied] = React.useState(false)
  return (
    <InputGroup className="max-w-xs">
      <InputGroupInput readOnly value="demo_key_51Hq…9fA" aria-label="API key" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={copied ? "Copied" : "Copy"}
          // The check is a confirmation, not a control: no hover, no pointer.
          className={copied ? "pointer-events-none" : undefined}
          onClick={async () => {
            await navigator.clipboard.writeText("demo_key_51Hq…9fA")
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function Textarea() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupTextarea placeholder="Ask anything…" aria-label="Message" />
      <InputGroupAddon align="block-end" className="justify-end">
        <InputGroupButton variant="default" size="sm">
          Send
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
