"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"
import { ArrowLeftIcon, CheckIcon, RotateCcwIcon, XIcon } from "lucide-react"

import { CopyButton } from "@/components/docs/copy-button"
import { InstallCommand } from "@/components/docs/install-command"
import { ReleasesPanel } from "@/components/examples/releases-panel"
import { SettingsCard } from "@/components/playground/playground"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  setSearchParams,
  useSearchParams,
  useUrlState,
} from "@/hooks/use-url-state"
import {
  contrastRows,
  formatOklch,
  hexToOklch,
  parse,
  toHex,
} from "@/lib/color.mjs"
import { dark as dsDark, root as dsRoot } from "@/registry/tokens.mjs"

type Vars = Record<string, string>
type Mode = "light" | "dark"
type Edits = { light: Vars; dark: Vars }
type BaseTheme = { name: string; light: Vars; dark: Vars; install?: string }

const BLANK = "blank"
const DEFAULT_BASE = "neutral"
const EMPTY: Edits = { light: {}, dark: {} }

const GROUPS: { title: string; keys: string[] }[] = [
  {
    title: "Surfaces",
    keys: [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
    ],
  },
  {
    title: "Actions",
    keys: [
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "accent",
      "accent-foreground",
      "destructive",
    ],
  },
  {
    title: "Muted and lines",
    keys: ["muted", "muted-foreground", "border", "input", "ring"],
  },
  {
    title: "Charts",
    keys: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  },
]
const COLOR_KEYS = GROUPS.flatMap((g) => g.keys)
const ALPHA_KEYS = new Set(["border", "input"])

// System stacks, so the preview changes without loading a font file.
const FONTS = [
  { label: "Theme default", value: "" },
  {
    label: "System sans",
    value: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  {
    label: "Serif",
    value: "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
  },
  {
    label: "Monospace",
    value: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
]

const RADIUS_MAX = 1.5
const RADIUS_RE = /^\d*\.?\d+rem$/

const titleOf = (key: string) =>
  key.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase())

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "my-theme"

const noopSubscribe = () => () => {}

/** Edits from `?edits=`, keeping only values the builder itself could write. */
function readEdits(raw: string | null): Edits {
  if (!raw) return EMPTY
  try {
    const json = JSON.parse(raw) as Partial<Record<Mode, unknown>>
    const clean = (input: unknown, mode: Mode): Vars => {
      const out: Vars = {}
      if (!input || typeof input !== "object") return out
      for (const [key, value] of Object.entries(input)) {
        if (typeof value !== "string") continue
        if (COLOR_KEYS.includes(key) && parse(value)) out[key] = value
        else if (key === "radius" && mode === "light" && RADIUS_RE.test(value))
          out[key] = value
        else if (
          key.startsWith("font-") &&
          mode === "light" &&
          ["font-sans", "font-serif", "font-mono"].includes(key) &&
          FONTS.some((f) => f.value === value)
        )
          out[key] = value
      }
      return out
    }
    return { light: clean(json.light, "light"), dark: clean(json.dark, "dark") }
  } catch {
    return EMPTY
  }
}

const hasEdits = (e: Edits) =>
  Object.keys(e.light).length + Object.keys(e.dark).length > 0

const cssBlock = (selector: string, vars: Vars) =>
  `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n")}\n}`

function ColorRow({
  token,
  value,
  onChange,
}: {
  token: string
  value: string
  onChange: (next: string) => void
}) {
  const alpha = ALPHA_KEYS.has(token)
  const hex = toHex(value) ?? "#000000"
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
      <Label className="min-w-0 text-sm">{titleOf(token)}</Label>
      <ColorPicker
        alpha={alpha}
        value={alpha ? hex : hex.slice(0, 7)}
        onValueChange={(next) => onChange(formatOklch(hexToOklch(next)))}
        aria-label={titleOf(token)}
        className="w-40"
      />
    </div>
  )
}

function ContrastList({ vars }: { vars: Vars }) {
  const rows = contrastRows(vars)
  const failing = rows.filter((r) => !r.pass).length
  return (
    <section
      aria-labelledby="contrast-title"
      className="flex flex-col gap-3 rounded-2xl bg-card p-4 text-card-foreground shadow-border"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="contrast-title" className="text-sm font-medium">
          Contrast
        </h2>
        <Badge tone={failing ? "red" : "green"} role="status">
          {failing ? `${failing} failing` : "All pass"}
        </Badge>
      </div>
      <ul className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <li
            key={`${r.fg}-${r.bg}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="grid size-6 shrink-0 place-items-center rounded-md text-xs font-semibold shadow-border"
                style={{ background: vars[r.bg], color: vars[r.fg] }}
              >
                Aa
              </span>
              <span className="truncate">
                {r.fg} <span className="text-muted-foreground">on</span> {r.bg}
              </span>
            </span>
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 font-mono text-xs tabular-nums",
                r.pass ? "text-muted-foreground" : "text-destructive"
              )}
            >
              {r.ratio.toFixed(2)}
              <span className="text-muted-foreground">/ {r.min}</span>
              {r.pass ? (
                <CheckIcon aria-label="Pass" className="size-3.5" />
              ) : (
                <XIcon aria-label="Fail" className="size-3.5" />
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ExportPanel({
  name,
  base,
  edits,
  light,
  dark,
  shareUrl,
}: {
  name: string
  base: BaseTheme
  edits: Edits
  light: Vars
  dark: Vars
  shareUrl: string
}) {
  const json = JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name,
      type: "registry:theme",
      cssVars: { light, dark },
    },
    null,
    2
  )
  const css = `${cssBlock(":root", light)}\n\n${cssBlock(".dark", dark)}\n`
  const untouched = !hasEdits(edits) && base.name !== BLANK && base.install
  return (
    <section
      aria-labelledby="export-title"
      className="flex flex-col gap-3 rounded-2xl bg-card p-4 text-card-foreground shadow-border"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="export-title" className="text-sm font-medium">
          Export
        </h2>
        <Button
          variant="outline"
          size="sm"
          disabled={!shareUrl}
          onClick={() => void navigator.clipboard.writeText(shareUrl)}
        >
          Copy share link
        </Button>
      </div>
      <Tabs defaultValue="json" className="gap-3">
        <TabsList variant="line" className="h-8">
          <TabsTrigger value="json">tweakcn JSON</TabsTrigger>
          <TabsTrigger value="css">CSS vars</TabsTrigger>
          <TabsTrigger value="install">Install</TabsTrigger>
        </TabsList>
        <TabsContent value="json" className="flex flex-col gap-2">
          <CodeBox value={json} label="Copy theme JSON" />
          <p className="text-xs text-muted-foreground">
            Save as{" "}
            <code className="font-mono">registry/themes/{name}.json</code>, run{" "}
            <code className="font-mono">pnpm check:contrast</code>, then{" "}
            <code className="font-mono">pnpm registry:build</code>.
          </p>
        </TabsContent>
        <TabsContent value="css" className="flex flex-col gap-2">
          <CodeBox value={css} label="Copy CSS variables" />
          <p className="text-xs text-muted-foreground">
            Paste into your globals.css.
          </p>
        </TabsContent>
        <TabsContent value="install" className="flex flex-col gap-2">
          {untouched ? (
            <InstallCommand command={base.install!} />
          ) : (
            <p className="text-sm text-muted-foreground">
              A custom theme has no hosted URL yet. Add the JSON to{" "}
              <code className="font-mono text-xs">registry/themes/</code>, run{" "}
              <code className="font-mono text-xs">pnpm registry:build</code>,
              and it installs as{" "}
              <code className="font-mono text-xs">theme-{name}</code>.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}

function CodeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="relative rounded-xl bg-muted/40 shadow-border">
      <pre
        tabIndex={0}
        className="max-h-60 overflow-auto p-3 pe-12 font-mono text-xs leading-relaxed focus-ring"
      >
        {value}
      </pre>
      <CopyButton
        value={value}
        label={label}
        className="absolute end-1 top-1"
      />
    </div>
  )
}

function BaseControls({
  themes,
  base,
  name,
  editMode,
  edited,
  onBaseChange,
  onNameChange,
  onModeChange,
  onReset,
}: {
  themes: BaseTheme[]
  base: BaseTheme
  name: string
  editMode: Mode
  edited: boolean
  onBaseChange: (name: string) => void
  onNameChange: (name: string) => void
  onModeChange: (mode: string) => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-muted/40 p-4 shadow-border">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Start from</Label>
        <Select
          items={[
            ...themes.map((t) => ({ label: titleOf(t.name), value: t.name })),
            { label: "Blank (neutral colors)", value: BLANK },
          ]}
          value={base.name}
          onValueChange={(v) => v && onBaseChange(v)}
          aria-label="Start from"
        >
          <SelectTrigger className="w-full" aria-label="Start from">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {themes.map((t) => (
              <SelectItem key={t.name} value={t.name}>
                {titleOf(t.name)}
              </SelectItem>
            ))}
            <SelectItem value={BLANK}>Blank (neutral colors)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="theme-name" className="text-xs text-muted-foreground">
          Name
        </Label>
        <Input
          id="theme-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Tabs value={editMode} onValueChange={(v) => onModeChange(String(v))}>
          <TabsList variant="segmented" aria-label="Mode being edited">
            <TabsTrigger value="light">Light</TabsTrigger>
            <TabsTrigger value="dark">Dark</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="sm" disabled={!edited} onClick={onReset}>
          <RotateCcwIcon data-icon="inline-start" />
          Reset
        </Button>
      </div>
    </div>
  )
}

function ShapeAndType({
  radius,
  edits,
  setVar,
  writeEdits,
}: {
  radius: number
  edits: Edits
  setVar: (key: string, value: string) => void
  writeEdits: (next: Edits) => void
}) {
  const fontOf = (key: string) =>
    FONTS.find((f) => f.value === (edits.light[key] ?? ""))?.value ?? ""
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-border">
      <h2 className="text-sm font-medium">Shape and type</h2>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Radius</Label>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {radius}rem
          </span>
        </div>
        <Slider
          aria-label="Radius"
          min={0}
          max={RADIUS_MAX}
          step={0.025}
          value={[radius]}
          onValueChange={(v) =>
            setVar("radius", `${+(Array.isArray(v) ? v[0] : v).toFixed(3)}rem`)
          }
        />
      </div>
      {(["font-sans", "font-serif", "font-mono"] as const).map((key) => (
        <div
          key={key}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5"
        >
          <Label className="text-sm">{titleOf(key)}</Label>
          <Select
            items={FONTS.map((f) => ({
              label: f.label,
              value: f.value || "default",
            }))}
            value={fontOf(key) || "default"}
            onValueChange={(v) => {
              if (!v) return
              if (v === "default") {
                const rest = { ...edits.light }
                delete rest[key]
                writeEdits({ ...edits, light: rest })
              } else
                writeEdits({ ...edits, light: { ...edits.light, [key]: v } })
            }}
            aria-label={titleOf(key)}
          >
            <SelectTrigger className="w-40" aria-label={titleOf(key)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f.label} value={f.value || "default"}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  )
}

function ColorGroups({
  editMode,
  resolved,
  edits,
  setVar,
  clearVar,
}: {
  editMode: Mode
  resolved: Vars
  edits: Edits
  setVar: (key: string, value: string) => void
  clearVar: (key: string) => void
}) {
  return (
    <>
      {GROUPS.map((group) => (
        <div
          key={group.title}
          className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-border"
        >
          <h2 className="text-sm font-medium">
            {group.title}
            <span className="sr-only">, {editMode}</span>
          </h2>
          {group.keys.map((key) => (
            <div key={key} className="flex items-center gap-1">
              <div className="min-w-0 flex-1">
                <ColorRow
                  token={key}
                  value={resolved[key] ?? "#000000"}
                  onChange={(next) => setVar(key, next)}
                />
              </div>
              {edits[editMode][key] !== undefined && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Reset ${titleOf(key)}`}
                  onClick={() => clearVar(key)}
                >
                  <RotateCcwIcon />
                </Button>
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

function ThemePreview({
  editMode,
  previewStyle,
}: {
  editMode: Mode
  previewStyle: React.CSSProperties
}) {
  return (
    <div
      data-slot="theme-preview"
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-2xl bg-background p-4 font-sans text-foreground shadow-border sm:p-6",
        editMode === "dark" ? "dark" : "ds-force-light"
      )}
      style={{ ...previewStyle, fontFamily: "var(--font-sans)" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Delete</Button>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-2">
        <SettingsCard />
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-border">
          <h3 className="font-heading text-sm font-medium">Chart series</h3>
          <div className="flex h-24 items-end gap-2" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="flex-1 rounded-t-md"
                style={{
                  height: `${30 + ((n * 37) % 60)}%`,
                  background: `var(--chart-${n})`,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Muted text on a card, with a border and an input below.
          </p>
          <Input placeholder="Search releases" aria-label="Search releases" />
        </div>
      </div>
      <div className="min-w-0 overflow-x-auto">
        <ReleasesPanel />
      </div>
    </div>
  )
}

export function ThemeBuilder({ themes }: { themes: BaseTheme[] }) {
  const hydrated = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
  const params = useSearchParams()
  const [baseName] = useUrlState("base", DEFAULT_BASE)
  const [name, setName] = useUrlState("name", "my-theme")
  const [mode, setMode] = useUrlState("mode", "light")
  const editMode: Mode = mode === "dark" ? "dark" : "light"

  const neutral = themes.find((t) => t.name === DEFAULT_BASE) ?? themes[0]
  const base: BaseTheme = React.useMemo(
    () =>
      baseName === BLANK
        ? { ...neutral, name: BLANK, install: undefined }
        : (themes.find((t) => t.name === baseName) ?? neutral),
    [baseName, themes, neutral]
  )
  const rawEdits = params.get("edits")
  const edits = React.useMemo(() => readEdits(rawEdits), [rawEdits])

  const light = React.useMemo(
    () => ({ ...base.light, ...edits.light }),
    [base, edits]
  )
  const dark = React.useMemo(
    () => ({ ...base.dark, ...edits.dark }),
    [base, edits]
  )
  const resolved: Vars = React.useMemo(
    () => (editMode === "dark" ? { ...light, ...dark } : light),
    [editMode, light, dark]
  )

  const writeEdits = (next: Edits) =>
    setSearchParams({
      edits: hasEdits(next)
        ? JSON.stringify(
            Object.fromEntries(
              Object.entries(next).filter(([, v]) => Object.keys(v).length)
            )
          )
        : null,
    })
  const setVar = (key: string, value: string) =>
    writeEdits({ ...edits, [editMode]: { ...edits[editMode], [key]: value } })
  const clearVar = (key: string) => {
    const rest = { ...edits[editMode] }
    delete rest[key]
    writeEdits({ ...edits, [editMode]: rest })
  }

  // Scoped preview: theme vars, plus every --ds-* token that is computed from
  // them (panel tray, focus ring...), re-declared so they follow the edits.
  const previewStyle = React.useMemo(() => {
    const ds: Record<string, string> = {
      ...dsRoot,
      ...(editMode === "dark" ? dsDark : {}),
    }
    const style: Record<string, string> = {}
    // All of them, not just the computed ones: a light preview inside a dark
    // page must not inherit the page's dark tones, charts and shadows.
    // Control heights are left to the page: coarse pointers resize them.
    for (const [k, v] of Object.entries(ds))
      if (!k.startsWith("ds-control-h")) style[`--${k}`] = v
    for (const [k, v] of Object.entries(resolved)) style[`--${k}`] = v
    return style as React.CSSProperties
  }, [resolved, editMode])

  const shareUrl = hydrated ? window.location.href : ""
  const radius = parseFloat(resolved.radius ?? "0.5")

  const changeBase = (value: string) =>
    setSearchParams({
      base: value === DEFAULT_BASE ? null : value,
      edits: null,
    })

  const exportName = slug(name)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/themes"
          className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground focus-ring hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Themes
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Theme builder
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Start from a theme, edit light and dark, and watch the preview and
          contrast checks update. The URL holds your theme, so it is shareable.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <BaseControls
            themes={themes}
            base={base}
            name={name}
            editMode={editMode}
            edited={hasEdits(edits)}
            onBaseChange={changeBase}
            onNameChange={setName}
            onModeChange={setMode}
            onReset={() => writeEdits(EMPTY)}
          />

          <ShapeAndType
            radius={radius}
            edits={edits}
            setVar={setVar}
            writeEdits={writeEdits}
          />

          <ColorGroups
            editMode={editMode}
            resolved={resolved}
            edits={edits}
            setVar={setVar}
            clearVar={clearVar}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-20">
          <ThemePreview editMode={editMode} previewStyle={previewStyle} />

          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-2">
            <ContrastList vars={resolved} />
            <ExportPanel
              name={exportName}
              base={base}
              edits={edits}
              light={light}
              dark={dark}
              shareUrl={shareUrl}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
