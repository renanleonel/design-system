"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { CheckIcon, ExternalLinkIcon, PaintbrushIcon } from "lucide-react"

import { CopyButton } from "@/components/docs/copy-button"
import { InstallCommand } from "@/components/docs/install-command"
import { CreateProjectCard } from "@/components/playground/create-project"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
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
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"

type Vars = Record<string, string>
export type PlaygroundTheme = {
  name: string
  cssVars: { light?: Vars; dark?: Vars }
  install: string
}

const TWEAKCN_URL = "https://tweakcn.com/editor/theme"
const CUSTOM = "custom"

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

/** Background tokens and the text token that sits on them. */
const PAIRS = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["popover", "popover-foreground"],
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["muted", "muted-foreground"],
  ["accent", "accent-foreground"],
  ["destructive", "primary-foreground"],
] as const
const LINES = ["border", "input", "ring"] as const
const CHART = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const
const TONES = [
  "gray",
  "blue",
  "green",
  "amber",
  "orange",
  "red",
  "purple",
] as const

const noopSubscribe = () => () => {}

/** "amethyst-haze" → "Amethyst Haze" */
const titleOf = (name: string) =>
  name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

// Theme and tokens live on <html> so portaled popups get them too. Written from the
// change handlers (not an effect); the initial values match the CSS defaults.
const root = () => document.documentElement

function applyDensity(density: string) {
  root().style.setProperty("--ds-control-h", density)
  root().style.setProperty("--ds-control-h-sm", `calc(${density} - 0.25rem)`)
  root().style.setProperty("--ds-control-h-xs", `calc(${density} - 0.5rem)`)
  root().style.setProperty("--ds-control-h-lg", `calc(${density} + 0.25rem)`)
}

/** A value that can't break out of the <style> it is written into. */
const safe = (v: string) => !/[<>{};]/.test(v)

/**
 * Reads tweakcn's Code export (`:root { --x: … } .dark { … }`) or a registry
 * theme JSON (`{ cssVars: { light, dark } }`).
 */
function parseTheme(text: string): { light: Vars; dark: Vars } | null {
  const trimmed = text.trim()
  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed) as {
        cssVars?: { light?: Vars; dark?: Vars }
      }
      const light = json.cssVars?.light ?? {}
      const dark = json.cssVars?.dark ?? {}
      return Object.keys(light).length ? { light, dark } : null
    } catch {
      return null
    }
  }
  const block = (selector: RegExp) => {
    const vars: Vars = {}
    const body = trimmed.match(selector)?.[1] ?? ""
    for (const [, key, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g))
      if (safe(value.trim())) vars[key] = value.trim()
    return vars
  }
  const light = block(/:root\s*\{([^}]*)\}/)
  const dark = block(/\.dark\s*\{([^}]*)\}/)
  return Object.keys(light).length ? { light, dark } : null
}

const decl = (vars: Vars = {}) =>
  Object.entries(vars)
    .filter(([, v]) => safe(v))
    .map(([k, v]) => `--${k}:${v};`)
    .join("")

function Control({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function Picker({
  label,
  items,
  value,
  onValueChange,
}: {
  label: string
  items: { label: string; value: string }[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(v) => v && onValueChange(v)}
      // The native picker on touch screens takes the name from Select itself.
      aria-label={label}
    >
      <SelectTrigger className="w-36" aria-label={label}>
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

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

/** One theme as a pickable card, drawn in its own colors. */
function ThemeCard({
  name,
  vars,
  selected,
  onSelect,
}: {
  name: string
  vars: Vars
  selected: boolean
  onSelect: () => void
}) {
  const dots = ["primary", "secondary", "accent", "muted", "destructive"]
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="group/theme flex flex-col gap-3 rounded-2xl bg-card p-2 text-start shadow-border focus-ring transition-shadow hover:shadow-popover aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-foreground"
    >
      <span
        aria-hidden
        className="flex flex-col gap-3 rounded-xl p-3"
        style={{
          background: vars.background,
          color: vars.foreground,
          boxShadow: `inset 0 0 0 1px ${vars.border}`,
        }}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="font-heading text-xl font-semibold">Aa</span>
          <span
            className="rounded-md px-2 py-1 text-xs font-medium"
            style={{
              background: vars.primary,
              color: vars["primary-foreground"],
              borderRadius: vars.radius,
            }}
          >
            Button
          </span>
        </span>
        <span className="flex gap-1.5">
          {dots.map((d) => (
            <span
              key={d}
              className="h-5 flex-1 rounded-sm"
              style={{
                background: vars[d],
                boxShadow: `inset 0 0 0 1px ${vars.border}`,
              }}
            />
          ))}
        </span>
      </span>
      <span className="flex items-center justify-between gap-2 px-1 pb-1">
        <span className="truncate text-sm font-medium">{titleOf(name)}</span>
        <CheckIcon
          aria-hidden
          className="size-4 shrink-0 opacity-0 transition-opacity group-aria-pressed/theme:opacity-100"
        />
      </span>
    </button>
  )
}

function Swatch({
  token,
  on,
  value,
}: {
  token: string
  on?: string
  value?: string
}) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-card shadow-border">
      <div
        className="flex h-16 items-end p-2.5 font-heading text-lg font-semibold shadow-[inset_0_-1px_0_var(--border)]"
        style={{
          background: `var(--${token})`,
          color: on ? `var(--${on})` : undefined,
        }}
      >
        {on && <span aria-hidden>Aa</span>}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 p-2.5">
        <span className="truncate text-sm font-medium">{token}</span>
        <span
          className="truncate font-mono text-xs text-muted-foreground"
          title={value}
        >
          {value ?? "—"}
        </span>
      </div>
    </div>
  )
}

function ImportDialog({
  onImport,
}: {
  onImport: (vars: { light: Vars; dark: Vars }) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <PaintbrushIcon data-icon="inline-start" />
        Import from tweakcn
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import a tweakcn theme</DialogTitle>
          <DialogDescription>
            Design a theme in tweakcn, open its Code panel and copy the CSS (or
            paste a registry theme JSON). It applies to this page only.
          </DialogDescription>
        </DialogHeader>
        <form
          id="import-theme"
          onSubmit={(e) => {
            e.preventDefault()
            const parsed = parseTheme(text)
            if (!parsed) {
              setError(
                "No theme variables found. Paste the CSS with the :root and .dark blocks."
              )
              return
            }
            onImport(parsed)
            setOpen(false)
          }}
        >
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="theme-css">Theme CSS or JSON</FieldLabel>
            <Textarea
              id="theme-css"
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setError(null)
              }}
              aria-invalid={error ? true : undefined}
              placeholder={
                ":root {\n  --background: oklch(1 0 0);\n  …\n}\n.dark { … }"
              }
              className="h-48 font-mono text-xs"
            />
            {error ? (
              <FieldError>{error}</FieldError>
            ) : (
              <FieldDescription>
                Tokens it leaves out keep the site defaults.
              </FieldDescription>
            )}
          </Field>
        </form>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            render={<a href={TWEAKCN_URL} target="_blank" rel="noreferrer" />}
            nativeButton={false}
          >
            Open tweakcn
            <ExternalLinkIcon data-icon="inline-end" />
          </Button>
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" form="import-theme" disabled={!text.trim()}>
              Apply theme
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Tabs, switches and badges.</CardDescription>
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
          <TabsContent
            value="billing"
            className="pt-4 text-sm text-muted-foreground"
          >
            You are on the Pro plan.
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
      </CardFooter>
    </Card>
  )
}

export function Playground({ themes }: { themes: PlaygroundTheme[] }) {
  const { resolvedTheme } = useTheme()
  // The server can't know the mode; read it only after hydration so the
  // first client render matches the server's (light) markup.
  const hydrated = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
  const mode = hydrated && resolvedTheme === "dark" ? "dark" : "light"
  const [theme, setTheme] = React.useState(
    themes.some((t) => t.name === "neutral") ? "neutral" : themes[0]?.name
  )
  const [custom, setCustom] = React.useState<{
    light: Vars
    dark: Vars
  } | null>(null)
  const [radius, setRadius] = React.useState(RADII[0].value)
  const [density, setDensity] = React.useState(DENSITIES[1].value)

  const varsOf = (t: { light?: Vars; dark?: Vars }): Vars => ({
    ...t.light,
    ...(mode === "dark" ? t.dark : {}),
  })
  const current =
    theme === CUSTOM ? custom : themes.find((t) => t.name === theme)?.cssVars
  const vars = current ? varsOf(current) : {}
  const install = themes.find((t) => t.name === theme)?.install

  const changeTheme = (value: string) => {
    setTheme(value)
    root().setAttribute("data-ds-theme", value)
  }
  const changeRadius = (value: string) => {
    setRadius(value)
    root().style.setProperty("--ds-radius-control", value)
  }
  const changeDensity = (value: string) => {
    setDensity(value)
    applyDensity(value)
  }

  const customJson = custom
    ? JSON.stringify(
        {
          $schema: "https://ui.shadcn.com/schema/registry-item.json",
          name: "my-theme",
          type: "registry:theme",
          cssVars: custom,
        },
        null,
        2
      )
    : ""

  return (
    <TooltipProvider>
      {custom && (
        <style>
          {`:root[data-ds-theme="${CUSTOM}"]{${decl(custom.light)}}` +
            `:root.dark[data-ds-theme="${CUSTOM}"]{${decl(custom.dark)}}`}
        </style>
      )}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Themes
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Components read the shadcn theme variables, so any tweakcn theme
            works. Pick one below, or import your own from tweakcn, and the
            whole site follows. Toggle dark mode to see its other half.
          </p>
        </div>

        <Section
          title="Pick a theme"
          description="Each card is drawn in its own colors for the current mode."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((t) => (
              <ThemeCard
                key={t.name}
                name={t.name}
                vars={varsOf(t.cssVars)}
                selected={theme === t.name}
                onSelect={() => changeTheme(t.name)}
              />
            ))}
            {custom && (
              <ThemeCard
                name="Imported"
                vars={varsOf(custom)}
                selected={theme === CUSTOM}
                onSelect={() => changeTheme(CUSTOM)}
              />
            )}
          </div>
          <div className="flex flex-wrap items-end gap-4 rounded-xl bg-muted/40 p-4 shadow-border">
            <Control label="Control radius">
              <Picker
                label="Control radius"
                items={RADII}
                value={radius}
                onValueChange={changeRadius}
              />
            </Control>
            <Control label="Density">
              <Picker
                label="Density"
                items={DENSITIES}
                value={density}
                onValueChange={changeDensity}
              />
            </Control>
            <div className="sm:ms-auto">
              <ImportDialog
                onImport={(parsed) => {
                  setCustom(parsed)
                  changeTheme(CUSTOM)
                }}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Install"
          description={
            theme === CUSTOM ? (
              <>
                Copy the imported theme as a registry item, save it as{" "}
                <code className="font-mono text-xs">
                  registry/themes/&lt;name&gt;.json
                </code>
                , then run{" "}
                <code className="font-mono text-xs">pnpm check:contrast</code>{" "}
                and{" "}
                <code className="font-mono text-xs">pnpm registry:build</code>{" "}
                to publish it here.
              </>
            ) : (
              <>
                Adds {titleOf(theme ?? "")}&apos;s variables to your
                globals.css.
              </>
            )
          }
        >
          {theme === CUSTOM ? (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 py-2 ps-4 pe-2 shadow-border">
              <span className="truncate font-mono text-sm">my-theme.json</span>
              <CopyButton value={customJson} label="Copy theme JSON" />
            </div>
          ) : (
            install && <InstallCommand command={install} />
          )}
        </Section>

        <Section
          title="Colors"
          description="The live tokens of the selected theme. Each background shows the text token that sits on it."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PAIRS.map(([token, on]) => (
              <Swatch key={token} token={token} on={on} value={vars[token]} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LINES.map((token) => (
              <Swatch key={token} token={token} value={vars[token]} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Chart</h3>
            <div className="grid grid-cols-5 overflow-hidden rounded-xl shadow-border">
              {CHART.map((token) => (
                <div
                  key={token}
                  title={`${token}: ${vars[token] ?? ""}`}
                  className="h-12"
                  style={{ background: `var(--${token})` }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Tones</h3>
            <p className="text-sm text-muted-foreground">
              Status colors from the token layer; every theme shares them, so
              green means live everywhere.
            </p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => (
                <Badge key={tone} tone={tone} className="capitalize">
                  {tone}
                </Badge>
              ))}
            </div>
          </div>
        </Section>

        <Section
          title="In context"
          description="Real components under the selected theme, radius and density."
        >
          <div className="grid items-start gap-6 md:grid-cols-2">
            <CreateProjectCard />
            <SettingsCard />
          </div>
        </Section>
      </div>
    </TooltipProvider>
  )
}
