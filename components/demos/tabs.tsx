"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Default() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">
        3 deployments this week.
      </TabsContent>
      <TabsContent value="activity" className="pt-3 text-sm text-muted-foreground">
        Ada merged #412.
      </TabsContent>
      <TabsContent value="settings" className="pt-3 text-sm text-muted-foreground">
        Builds run on every push.
      </TabsContent>
    </Tabs>
  )
}

/** The pill slides between options. */
export function Segmented() {
  return (
    <Tabs defaultValue="monthly">
      <TabsList variant="segmented">
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">Yearly</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export function Line() {
  return (
    <Tabs defaultValue="all">
      <TabsList variant="line">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="open">Open</TabsTrigger>
        <TabsTrigger value="closed">Closed</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export function Vertical() {
  return (
    <Tabs defaultValue="general" orientation="vertical">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
