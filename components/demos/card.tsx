"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function Default() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Invite your team</CardTitle>
        <CardDescription>Members can edit every project.</CardDescription>
        <CardAction>
          <Badge tone="blue">3 seats left</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Input placeholder="name@company.com" aria-label="Email" />
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Skip</Button>
        <Button>Send invite</Button>
      </CardFooter>
    </Card>
  )
}

export function Small() {
  return (
    <Card size="sm" className="w-full max-w-xs">
      <CardHeader>
        <CardTitle>Monthly revenue</CardTitle>
        <CardDescription>May 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-semibold tabular-nums">$48,210</p>
      </CardContent>
    </Card>
  )
}
