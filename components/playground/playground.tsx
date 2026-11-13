"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { MoonIcon, PlusIcon, SunIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"

const RADII = [
  { label: "Theme", value: "var(--radius)" },
  { label: "Square", value: "0px" },
  { label: "Pill", value: "9999px" },
]

const DENSITIES = [
  { label: "Compact", value: "1.75rem" },
  { label: "Default", value: "2rem" },
  { label: "Comfortable", value: "2.5rem" },
]

function useRootAttr(name: string, value: string) {
  React.useEffect(() => {
    document.documentElement.setAttribute(name, value)
  }, [name, value])
}

function useRootVar(name: string, value: string) {
  React.useEffect(() => {
    document.documentElement.style.setProperty(name, value)
  }, [name, value])
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function Picker({
  items,
  value,
  onValueChange,
}: {
  items: { label: string; value: string }[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select items={items} value={value} onValueChange={(v) => v && onValueChange(v)}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function Playground({ themes }: { themes: string[] }) {
  const [theme, setTheme] = React.useState(themes.includes("neutral") ? "neutral" : themes[0])
  const [radius, setRadius] = React.useState(RADII[0].value)
  const [density, setDensity] = React.useState(DENSITIES[1].value)
  const { resolvedTheme, setTheme: setMode } = useTheme()

  useRootAttr("data-ds-theme", theme)
  useRootVar("--ds-radius-control", radius)
  useRootVar("--ds-control-h", density)
  useRootVar("--ds-control-h-sm", `calc(${density} - 0.25rem)`)
  useRootVar("--ds-control-h-xs", `calc(${density} - 0.5rem)`)
  useRootVar("--ds-control-h-lg", `calc(${density} + 0.25rem)`)

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-4 px-4 py-3">
          <div className="mr-auto">
            <h1 className="font-heading text-base font-semibold">renan/ui</h1>
            <p className="text-xs text-muted-foreground">Theme playground</p>
          </div>
          <Control label="Theme">
            <Picker
              items={themes.map((t) => ({ label: t, value: t }))}
              value={theme}
              onValueChange={setTheme}
            />
          </Control>
          <Control label="Control radius">
            <Picker items={RADII} value={radius} onValueChange={setRadius} />
          </Control>
          <Control label="Density">
            <Picker items={DENSITIES} value={density} onValueChange={setDensity} />
          </Control>
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setMode(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {/* CSS picks the icon: resolvedTheme is unknown during SSR. */}
            <SunIcon className="hidden dark:block" />
            <MoonIcon className="dark:hidden" />
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Variants and sizes follow the control tokens.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add">
                <PlusIcon />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>Form controls share one height and radius.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" placeholder="Acme dashboard" />
                <FieldDescription>Shown to everyone on your team.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Plan</FieldLabel>
                <Picker
                  items={[
                    { label: "Hobby", value: "hobby" },
                    { label: "Pro", value: "pro" },
                    { label: "Enterprise", value: "enterprise" },
                  ]}
                  value="pro"
                  onValueChange={() => {}}
                />
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="terms" defaultChecked />
                <FieldLabel htmlFor="terms">Send me product updates</FieldLabel>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button onClick={() => toast.success("Project created")}>Create</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Tabs, switches, badges and overlays.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="flex flex-col gap-4 pt-4">
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="emails">Email notifications</FieldLabel>
                  <Switch id="emails" defaultChecked />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Badge>Active</Badge>
                  <Badge variant="secondary">Beta</Badge>
                  <Badge variant="outline">Draft</Badge>
                  <Badge variant="destructive">Overdue</Badge>
                </div>
              </TabsContent>
              <TabsContent value="billing" className="pt-4 text-sm text-muted-foreground">
                You are on the Pro plan.
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>Delete workspace</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete workspace?</DialogTitle>
                  <DialogDescription>
                    This removes all projects and members. It can&apos;t be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </main>
      <Toaster />
    </div>
  )
}
