"use client"

import * as React from "react"
import {
  useHotkey,
  useHotkeys,
  type RegisterableHotkey,
} from "@tanstack/react-hotkeys"
import { Collapsible } from "@base-ui/react/collapsible"
import { cn } from "cn"
import {
  ChevronRightIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Hotkey } from "@/components/ui/hotkey"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  /** Trailing count or status, e.g. unread items. */
  badge?: React.ReactNode
  /** Usually a sequence: ["G", "P"] goes to Projects. */
  hotkey?: RegisterableHotkey
  /** Sub-pages: a collapsible group with a guide line under the parent's icon. */
  items?: Omit<NavItem, "items">[]
}
export type NavSection = { label?: string; items: NavItem[] }

type LinkComponent = React.ComponentType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

type ShellContext = {
  collapsed: boolean
  toggleSidebar: (fromKeyboard?: boolean) => void
  openMobileNav: () => void
  openPalette: () => void
}
const AppShellContext = React.createContext<ShellContext | null>(null)
const useAppShell = () => {
  const ctx = React.useContext(AppShellContext)
  if (!ctx) throw new Error("AppShellHeader must be used inside AppShell")
  return ctx
}

/** Keyboard actions never animate (animate skill): skip transitions for two frames. */
function instantly(change: () => void) {
  const root = document.documentElement
  root.setAttribute("data-ds-instant", "")
  change()
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-ds-instant"))
  )
}

/**
 * `variant="fade"`: labels stay mounted and the icons never move. How the
 * labels leave and return is set per `motion` through CSS variables on the
 * sidebar (`SIDEBAR_MOTION`): delay, per-row stagger (`--i`, top down),
 * duration, drift and blur. Keyboard toggles (Mod+B) skip all of it; reduced
 * motion keeps only the fade.
 */
const FADE_LABEL =
  "whitespace-nowrap opacity-[var(--sb-label-o,1)] transition-[opacity,filter,translate] duration-[var(--sb-dur,150ms)] ease-out delay-[calc(var(--sb-delay,0ms)_+_var(--i,0)*var(--sb-stagger,0ms))] group-data-collapsed/sidebar:pointer-events-none group-data-collapsed/sidebar:translate-x-[var(--sb-drift,-4px)] group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:blur-[var(--sb-blur,2px)] in-data-ds-instant:transition-none motion-reduce:translate-x-0 motion-reduce:blur-none"

export type SidebarMotion = "ease-out" | "cascade" | "scrub"

/** Rail width (icons only) and the drag width under which it snaps to it. */
const RAIL = 60
const SNAP = 160
const MAX_WIDTH = 360

type LabelTiming = {
  delay: number
  stagger: number
  duration: number
  drift: number
  blur: number
}
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)"
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)"
const fadeOnly: LabelTiming = { delay: 0, stagger: 0, duration: 160, drift: 0, blur: 0 }
const SIDEBAR_MOTION: Record<
  SidebarMotion,
  { out: LabelTiming; in: LabelTiming; width: { duration: number; ease: string } }
> = {
  // Labels fade in 0.16s while the width glides over 0.4s.
  "ease-out": {
    out: fadeOnly,
    in: { ...fadeOnly, delay: 120 },
    width: { duration: 400, ease: EASE_OUT },
  },
  // Labels drift left and fade from the top down; the width moves in one motion.
  cascade: {
    out: { delay: 0, stagger: 25, duration: 160, drift: -8, blur: 2 },
    in: { delay: 100, stagger: 25, duration: 200, drift: -8, blur: 2 },
    width: { duration: 400, ease: EASE_IN_OUT },
  },
  // While dragging, label opacity follows the width; toggles behave like ease-out.
  scrub: {
    out: fadeOnly,
    in: { ...fadeOnly, delay: 120 },
    width: { duration: 400, ease: EASE_OUT },
  },
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/**
 * The sidebar's trailing edge: drag to resize (below 160px it settles to the
 * icon rail), double-click or Enter to collapse/expand, arrows to resize by
 * 16px. A 2px line shows on hover and while dragging.
 */
function ResizeHandle({
  width,
  dragging,
  onDragStart,
  onDrag,
  onDragEnd,
  onToggle,
  onNudge,
}: {
  width: number
  dragging: boolean
  onDragStart: () => void
  onDrag: (width: number) => void
  onDragEnd: () => void
  onToggle: () => void
  onNudge: (delta: number) => void
}) {
  const origin = React.useRef<{ x: number; width: number } | null>(null)
  return (
    <Tooltip disabled={dragging}>
      <TooltipTrigger
        render={
          <div
            role="separator"
            tabIndex={0}
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuemin={RAIL}
            aria-valuemax={MAX_WIDTH}
            aria-valuenow={Math.round(width)}
            data-dragging={dragging || undefined}
            onPointerDown={(event) => {
              if (event.button !== 0) return
              event.currentTarget.setPointerCapture(event.pointerId)
              origin.current = { x: event.clientX, width }
            }}
            onPointerMove={(event) => {
              const start = origin.current
              if (!start) return
              const dx = event.clientX - start.x
              if (!dragging && Math.abs(dx) < 3) return
              if (!dragging) onDragStart()
              onDrag(clamp(start.width + dx, RAIL, MAX_WIDTH))
            }}
            onPointerUp={() => {
              origin.current = null
              if (dragging) onDragEnd()
            }}
            onPointerCancel={() => {
              origin.current = null
              if (dragging) onDragEnd()
            }}
            onDoubleClick={onToggle}
            onKeyDown={(event) => {
              if (event.key === "Enter") onToggle()
              else if (event.key === "ArrowLeft") onNudge(-16)
              else if (event.key === "ArrowRight") onNudge(16)
              else return
              event.preventDefault()
            }}
            className="group/handle absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none outline-none select-none focus-visible:[&>span]:opacity-100"
          >
            <span className="absolute inset-y-0 right-0 w-0.5 bg-primary opacity-0 transition-opacity duration-150 group-hover/handle:opacity-100 group-data-dragging/handle:opacity-100" />
          </div>
        }
      />
      <TooltipContent side="right">Drag to resize sidebar</TooltipContent>
    </Tooltip>
  )
}

const NAV_ROW =
  "flex h-control items-center gap-2.5 rounded-control px-2.5 text-sm text-sidebar-foreground/75 focus-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0"

const indexStyle = (index?: number) =>
  index === undefined
    ? undefined
    : ({ "--i": index } as React.CSSProperties)

function NavLink({
  item,
  active,
  collapsed,
  fade = false,
  index,
  Link,
  onClick,
}: {
  item: Omit<NavItem, "items">
  active: boolean
  collapsed: boolean
  fade?: boolean
  index?: number
  Link: LinkComponent
  onClick?: () => void
}) {
  const showLabel = fade || !collapsed
  const link = (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      style={indexStyle(index)}
      className={cn(
        "group/nav",
        NAV_ROW,
        "aria-[current=page]:bg-background aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-[current=page]:shadow-border dark:aria-[current=page]:bg-sidebar-accent",
        !fade && collapsed && "justify-center px-0"
      )}
    >
      {item.icon}
      {showLabel && (
        <span className={cn("min-w-0 flex-1 truncate", fade && FADE_LABEL)}>
          {item.label}
        </span>
      )}
      {showLabel && item.badge != null && (
        <span
          className={cn(
            "text-xs text-muted-foreground tabular-nums",
            fade && FADE_LABEL
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
  // Fade: one element in both states (no remount, focus survives a toggle).
  if (fade)
    return (
      <Tooltip disabled={!collapsed}>
        <TooltipTrigger render={link} />
        <TooltipContent side="right" hotkey={item.hotkey}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right" hotkey={item.hotkey}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * A parent with sub-pages. Open while one of them is current; the panel's
 * height animates. In the rail the group folds away (smoothly, so the icons
 * below glide up) and clicking the parent expands the sidebar on it.
 */
function NavGroup({
  item,
  activeHref,
  collapsed,
  fade,
  index,
  Link,
  onClick,
  onExpand,
}: {
  item: NavItem
  activeHref?: string
  collapsed: boolean
  fade: boolean
  index: number
  Link: LinkComponent
  onClick?: () => void
  onExpand: () => void
}) {
  const children = item.items ?? []
  const childActive = children.some((c) => c.href === activeHref)
  const [open, setOpen] = React.useState(childActive)
  if (collapsed && !fade)
    return (
      <NavLink
        item={item}
        active={childActive}
        collapsed
        Link={Link}
        onClick={onClick}
      />
    )
  const trigger = (
    <Collapsible.Trigger
      style={indexStyle(index)}
      onClick={(event) => {
        if (!collapsed) return
        event.preventDefault()
        setOpen(true)
        onExpand()
      }}
      className={cn(
        "group/navtrigger w-full text-start",
        NAV_ROW,
        childActive &&
          "text-foreground group-data-collapsed/sidebar:bg-background group-data-collapsed/sidebar:shadow-border dark:group-data-collapsed/sidebar:bg-sidebar-accent"
      )}
    >
      {item.icon}
      <span className={cn("min-w-0 flex-1 truncate", fade && FADE_LABEL)}>
        {item.label}
      </span>
      <ChevronRightIcon
        className={cn(
          "text-muted-foreground transition-[rotate,opacity,filter,translate] duration-200 ease-out group-data-panel-open/navtrigger:rotate-90",
          fade && FADE_LABEL
        )}
      />
    </Collapsible.Trigger>
  )
  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="flex flex-col"
    >
      {fade ? (
        <Tooltip disabled={!collapsed}>
          <TooltipTrigger render={trigger} />
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 group-data-collapsed/sidebar:h-0 in-data-ds-instant:transition-none motion-reduce:transition-none">
        {/* The guide line sits under the parent's icon (row padding + half the icon). */}
        <div className="ms-4.5 flex flex-col gap-0.5 border-s border-sidebar-border ps-2 pt-0.5">
          {children.map((child, i) => (
            <NavLink
              key={child.href}
              item={child}
              active={child.href === activeHref}
              collapsed={false}
              fade={fade}
              index={index + i + 1}
              Link={Link}
              onClick={onClick}
            />
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}

function UserMenu({
  user,
  collapsed,
  fade = false,
  onSignOut,
  settingsHref,
  Link,
}: {
  user: { name: string; email: string; initials: string }
  collapsed: boolean
  fade?: boolean
  onSignOut?: () => void
  settingsHref?: string
  Link: LinkComponent
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Account: ${user.name}`}
            className={cn(
              "flex h-control-lg w-full items-center gap-2.5 rounded-control px-1.5 text-start text-sm focus-ring transition-colors hover:bg-sidebar-accent aria-expanded:bg-sidebar-accent",
              !fade && collapsed && "justify-center px-0"
            )}
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-tone-blue-soft text-xs font-medium text-tone-blue">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        {(fade || !collapsed) && (
          <>
            <span className={cn("min-w-0 flex-1", fade && FADE_LABEL)}>
              <span className="block truncate font-medium">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
            <ChevronsUpDownIcon
              className={cn(
                "size-4 shrink-0 text-muted-foreground",
                fade && FADE_LABEL
              )}
            />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align="start"
        className="min-w-56"
      >
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        {settingsHref && (
          <DropdownMenuItem render={<Link href={settingsHref} />}>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => document.documentElement.classList.toggle("dark")}
        >
          <MoonIcon />
          Toggle theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The frame every app page sits in: a tinted sidebar and the page on an inset
 * white surface (nested surfaces, docs/COMPOSITION.md).
 *
 * - Desktop: the sidebar collapses to an icon rail (Mod+B), labels move to tooltips.
 * - Mobile (< md): the sidebar becomes a sheet opened from the header.
 * - Mod+K opens a command palette over every nav item; each item can have its
 *   own sequence hotkey (G then P).
 * - Router-agnostic: pass `currentPath`, and `linkComponent` / `onNavigate`
 *   from your router (defaults to plain links).
 *
 * Pages render `<AppShellHeader title actions />` first, then their content.
 */
function AppShell({
  workspace,
  sections,
  user,
  currentPath,
  linkComponent: Link = "a" as unknown as LinkComponent,
  onNavigate = (href) => window.location.assign(href),
  settingsHref,
  onSignOut,
  defaultCollapsed = false,
  variant = "default",
  motion = "cascade",
  resizable = true,
  defaultWidth = 256,
  footerItems,
  children,
}: {
  workspace: { name: string; logo: React.ReactNode; plan?: string }
  sections: NavSection[]
  user: { name: string; email: string; initials: string }
  currentPath: string
  linkComponent?: LinkComponent
  onNavigate?: (href: string) => void
  settingsHref?: string
  onSignOut?: () => void
  defaultCollapsed?: boolean
  /** `fade`: labels fade and blur out before the rail closes; icons never move. */
  variant?: "default" | "fade"
  /** Fade variant: how the labels leave and return (see SIDEBAR_MOTION). */
  motion?: SidebarMotion
  /** Fade variant: drag the trailing edge to resize; under 160px it settles to icons. */
  resizable?: boolean
  /** Fade variant: expanded width in px. */
  defaultWidth?: number
  /** Pinned above the account menu (Settings, Help…). */
  footerItems?: NavItem[]
  children: React.ReactNode
}) {
  const fade = variant === "fade"
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  // Fade variant: the expanded width, and the live width while dragging.
  const [width, setWidth] = React.useState(defaultWidth)
  const [dragWidth, setDragWidth] = React.useState<number | null>(null)
  const dragging = dragWidth !== null
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const items = [
    ...sections.flatMap((s) => s.items),
    ...(footerItems ?? []),
  ].flatMap((item) => (item.items?.length ? item.items : [item]))
  // Only the most specific matching link is current (/blocks/projects, not also /blocks).
  const activeHref = items
    .map((item) => item.href)
    .filter(
      (href) => currentPath === href || currentPath.startsWith(`${href}/`)
    )
    .sort((a, b) => b.length - a.length)[0]
  const isActive = (href: string) => href === activeHref

  const toggleSidebar = React.useCallback((fromKeyboard = false) => {
    const change = () => setCollapsed((c) => !c)
    if (fromKeyboard) instantly(change)
    else change()
  }, [])

  useHotkey("Mod+B", () => toggleSidebar(true))
  useHotkey("Mod+K", () => setPaletteOpen((open) => !open))
  useHotkeys(
    items
      .filter((item) => item.hotkey)
      .map((item) => ({
        hotkey: item.hotkey!,
        callback: () => onNavigate(item.href),
      }))
  )

  const context = React.useMemo<ShellContext>(
    () => ({
      collapsed,
      toggleSidebar,
      openMobileNav: () => setMobileOpen(true),
      openPalette: () => setPaletteOpen(true),
    }),
    [collapsed, toggleSidebar]
  )

  const expand = () => setCollapsed(false)
  const navItem = (
    item: NavItem,
    rail: boolean,
    index: number,
    onItemClick?: () => void
  ) =>
    item.items?.length ? (
      <NavGroup
        key={item.href}
        item={item}
        activeHref={activeHref}
        collapsed={rail}
        fade={fade}
        index={index}
        Link={Link}
        onClick={onItemClick}
        onExpand={expand}
      />
    ) : (
      <NavLink
        key={item.href}
        item={item}
        active={isActive(item.href)}
        collapsed={rail}
        fade={fade}
        index={index}
        Link={Link}
        onClick={onItemClick}
      />
    )

  const nav = (rail: boolean, onItemClick?: () => void) => {
    // Running index for the staggered label fade-in.
    let index = 0
    return (
      <nav aria-label="Main" className="flex flex-col gap-5">
        {sections.map((section, i) => (
          <div key={section.label ?? i} className="flex flex-col gap-0.5">
            {section.label && (fade || !rail) && (
              <p
                style={indexStyle(index++)}
                className={cn(
                  "px-2.5 pb-1 text-xs font-medium text-muted-foreground",
                  fade && FADE_LABEL
                )}
              >
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const node = navItem(item, rail, index, onItemClick)
              index += 1 + (item.items?.length ?? 0)
              return node
            })}
          </div>
        ))}
      </nav>
    )
  }

  const sidebarBody = (rail: boolean, onItemClick?: () => void) => (
    <>
      <div
        className={cn(
          "flex items-center gap-2.5",
          // Fade: the logo's center lines up with the nav icons in both states.
          fade ? "px-0.5" : "px-1.5",
          !fade && rail && "justify-center px-0"
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background [&_svg]:size-4">
          {workspace.logo}
        </span>
        {(fade || !rail) && (
          <div className={cn("min-w-0", fade && FADE_LABEL)}>
            <p className="truncate text-sm font-medium">{workspace.name}</p>
            {workspace.plan && (
              <p className="truncate text-xs text-muted-foreground">
                {workspace.plan}
              </p>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          onItemClick?.()
          setPaletteOpen(true)
        }}
        aria-label={rail ? "Search" : undefined}
        className={cn(
          "flex h-control items-center gap-2.5 rounded-control bg-background px-2.5 text-sm text-muted-foreground shadow-border focus-ring transition-shadow hover:shadow-border-hover",
          !fade && rail && "justify-center px-0"
        )}
      >
        <SearchIcon className="size-4 shrink-0" />
        {(fade || !rail) && (
          <>
            <span className={cn("flex-1 text-start", fade && FADE_LABEL)}>
              Search
            </span>
            <Hotkey
              hotkey="Mod+K"
              variant="text"
              className={cn("text-xs", fade && FADE_LABEL)}
            />
          </>
        )}
      </button>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {nav(rail, onItemClick)}
      </div>
      {footerItems && (
        <div className="flex flex-col gap-0.5">
          {footerItems.map((item, i) => navItem(item, rail, i, onItemClick))}
        </div>
      )}
      <UserMenu
        user={user}
        collapsed={rail}
        fade={fade}
        onSignOut={onSignOut}
        settingsHref={settingsHref}
        Link={Link}
      />
    </>
  )

  // Fade variant: what the sidebar shows right now.
  const timing = SIDEBAR_MOTION[motion]
  const belowSnap = dragging && dragWidth < SNAP
  // Ease out snaps to the rail as soon as the drag crosses 160px; cascade and
  // scrub keep following the pointer until it's released.
  const snapped = dragging && motion === "ease-out" && belowSnap
  const shownWidth = dragging
    ? snapped
      ? RAIL
      : dragWidth
    : collapsed
      ? RAIL
      : width
  const labelsHidden = fade
    ? dragging
      ? motion === "scrub"
        ? false
        : belowSnap
      : collapsed
    : collapsed
  const label = labelsHidden ? timing.out : timing.in
  const sidebarStyle = {
    width: shownWidth,
    transitionDuration: dragging && !snapped ? "0ms" : `${timing.width.duration}ms`,
    transitionTimingFunction: timing.width.ease,
    "--sb-delay": `${label.delay}ms`,
    "--sb-stagger": `${label.stagger}ms`,
    "--sb-dur": dragging && motion === "scrub" ? "0ms" : `${label.duration}ms`,
    "--sb-drift": `${label.drift}px`,
    "--sb-blur": `${label.blur}px`,
    // Scrub: labels fade with the width between the rail and 160px.
    "--sb-label-o":
      dragging && motion === "scrub"
        ? clamp((dragWidth - RAIL) / (SNAP - RAIL), 0, 1)
        : 1,
  } as React.CSSProperties

  return (
    <AppShellContext value={context}>
      <TooltipProvider>
        <div
          data-slot="app-shell"
          data-collapsed={collapsed || undefined}
          className="flex min-h-dvh bg-sidebar text-sidebar-foreground"
        >
          <aside
            data-slot="app-sidebar"
            data-collapsed={labelsHidden || undefined}
            data-motion={fade ? motion : undefined}
            style={fade ? sidebarStyle : undefined}
            className={cn(
              "group/sidebar sticky top-0 hidden h-dvh shrink-0 flex-col gap-4 overflow-hidden p-3 transition-[width] in-data-ds-instant:transition-none motion-reduce:transition-none md:flex",
              !fade && "duration-200 ease-in-out",
              !fade && (collapsed ? "w-16" : "w-64")
            )}
          >
            {sidebarBody(collapsed)}
            {fade && resizable && (
              <ResizeHandle
                width={shownWidth}
                dragging={dragging}
                onDragStart={() => setDragWidth(collapsed ? RAIL : width)}
                onDrag={setDragWidth}
                onDragEnd={() => {
                  const final = dragWidth ?? width
                  setDragWidth(null)
                  if (final < SNAP) setCollapsed(true)
                  else {
                    setWidth(final)
                    setCollapsed(false)
                  }
                }}
                onToggle={() => toggleSidebar()}
                onNudge={(delta) => {
                  const next = clamp((collapsed ? RAIL : width) + delta, RAIL, MAX_WIDTH)
                  if (next < SNAP) setCollapsed(true)
                  else {
                    setWidth(next)
                    setCollapsed(false)
                  }
                }}
              />
            )}
          </aside>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              className="w-72 gap-4 bg-sidebar p-3 text-sidebar-foreground"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {sidebarBody(false, () => setMobileOpen(false))}
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 flex-col md:py-2 md:pe-2">
            <main
              id="main"
              className="flex min-h-full flex-1 flex-col bg-background text-foreground md:rounded-xl md:shadow-border"
            >
              {children}
            </main>
          </div>
        </div>

        <CommandDialog
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          title="Go to"
        >
          <Command>
            <CommandInput placeholder="Go to…" />
            <CommandList>
              <CommandEmpty>No pages match.</CommandEmpty>
              {sections.map((section, i) => (
                <CommandGroup
                  key={section.label ?? i}
                  heading={section.label ?? "Pages"}
                >
                  {section.items
                    .flatMap((item) => (item.items?.length ? item.items : [item]))
                    .map((item) => (
                    <CommandItem
                      key={item.href}
                      value={item.label}
                      onSelect={() => {
                        setPaletteOpen(false)
                        onNavigate(item.href)
                      }}
                    >
                      {item.icon}
                      {item.label}
                      {item.hotkey && (
                        <CommandShortcut>
                          <Hotkey hotkey={item.hotkey} variant="text" />
                        </CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </CommandDialog>
      </TooltipProvider>
    </AppShellContext>
  )
}

/** Page header: sidebar toggle (mobile menu), title + description, trailing actions. */
function AppShellHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  const { collapsed, toggleSidebar, openMobileNav } = useAppShell()
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "flex flex-wrap items-center gap-3 border-b px-4 py-3 md:px-6",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={openMobileNav}
      >
        <MenuIcon />
      </Button>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-keyshortcuts="Control+B Meta+B"
              onClick={() => toggleSidebar()}
            />
          }
        >
          <PanelLeftIcon />
        </TooltipTrigger>
        <TooltipContent hotkey="Mod+B">
          {collapsed ? "Expand sidebar" : "Collapse sidebar"}
        </TooltipContent>
      </Tooltip>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-heading text-lg leading-tight font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  )
}

/**
 * Page body with the standard gutter, sharing the header's leading edge.
 * Narrow pages add a max width (`max-w-4xl`) but stay start-aligned, never centered.
 */
function AppShellContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-content"
      className={cn("flex w-full flex-col gap-6 p-4 md:p-6", className)}
      {...props}
    />
  )
}

export { AppShell, AppShellContent, AppShellHeader, useAppShell }
