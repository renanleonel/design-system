"use client"

import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function Default() {
  return (
    <Alert className="max-w-md">
      <InfoIcon />
      <AlertTitle>New sign-in from Chrome on Windows</AlertTitle>
      <AlertDescription>
        If this wasn&apos;t you, reset your password.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Review
        </Button>
      </AlertAction>
    </Alert>
  )
}

export function Destructive() {
  return (
    <Alert variant="destructive" className="max-w-md">
      <CircleAlertIcon />
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>
        Update your card by June 4 to keep the Pro plan.
      </AlertDescription>
    </Alert>
  )
}

/** `tone` makes a borderless callout. */
export function Tones() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <Alert tone="blue">
        <InfoIcon />
        <AlertDescription>Imports run in the background.</AlertDescription>
      </Alert>
      <Alert tone="green">
        <CircleCheckIcon />
        <AlertDescription>Your domain is verified.</AlertDescription>
      </Alert>
      <Alert tone="amber">
        <TriangleAlertIcon />
        <AlertDescription>You&apos;ve used 90% of your seats.</AlertDescription>
      </Alert>
      <Alert tone="red">
        <CircleAlertIcon />
        <AlertDescription>The webhook failed 3 times today.</AlertDescription>
      </Alert>
    </div>
  )
}
