"use client"

import { ErrorPage } from "@/components/blocks/error-pages/error-page"

export default function Page() {
  return (
    <ErrorPage
      variant="server-error"
      homeHref="/blocks"
      supportHref="#support"
      onRetry={() => window.location.reload()}
      requestId="req_8f2a91c4"
    />
  )
}
