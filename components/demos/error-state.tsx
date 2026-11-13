"use client"

import * as React from "react"

import { ErrorState } from "@/components/ui/error-state"

export function Default() {
  const [retrying, setRetrying] = React.useState(false)
  return (
    <ErrorState
      title="Couldn't load invoices"
      description="The billing service didn't answer. Your data is safe."
      retrying={retrying}
      onRetry={() => {
        setRetrying(true)
        setTimeout(() => setRetrying(false), 1200)
      }}
      requestId="req_8f2a91c4"
    />
  )
}
