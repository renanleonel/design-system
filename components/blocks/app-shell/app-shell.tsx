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
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
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

// Unlabeled sections are keyed by their first link, which is unique per nav.
const sectionKey = (section: NavSection) =>
  section.label ?? section.items[0]?.href ?? "section"

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
  "whitespace-nowrap opacity-[var(--sb-label-o,1)] transition-[opacity,filter,translate] duration-[var(--sb-dur,150ms)] ease-out delay-[calc(var(--sb-delay,0ms)_+_min(var(--i,0),6)*var(--sb-stagger,0ms))] group-data-collapsed/sidebar:pointer-events-none group-data-collapsed/sidebar:translate-x-[var(--sb-drift,-4px)] group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:blur-[var(--sb-blur,2px)] in-data-ds-instant:transition-none motion-reduce:translate-x-0 motion-reduce:blur-none motion-reduce:delay-0"

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
const fadeOnly: LabelTiming = {
  delay: 0,
  stagger: 0,
  duration: 160,
  drift: 0,
  blur: 0,
}
const SIDEBAR_MOTION: Record<
  SidebarMotion,
  {
    out: LabelTiming
    in: LabelTiming
    width: { duration: number; ease: string }
  }
> = {
  // Labels fade in 0.16s while the width glides over 0.2s.
  "ease-out": {
    out: fadeOnly,
    in: { ...fadeOnly, delay: 60 },
    width: { duration: 200, ease: EASE_OUT },
  },
  // Labels drift left and fade from the top down; the width moves in one motion.
  cascade: {
    // Stagger stops after 6 rows (FADE_LABEL), so in lands by ~300ms.
    out: { delay: 0, stagger: 12, duration: 140, drift: -8, blur: 2 },
    in: { delay: 40, stagger: 16, duration: 180, drift: -8, blur: 2 },
    width: { duration: 220, ease: EASE_IN_OUT },
  },
  // While dragging, label opacity follows the width; toggles behave like ease-out.
  scrub: {
    out: fadeOnly,
    in: { ...fadeOnly, delay: 60 },
    width: { duration: 200, ease: EASE_OUT },
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
  onDragEnd: (to?: number) => void
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
            onLostPointerCapture={() => {
              // Only when capture is lost mid-drag (pointerup already cleaned up).
              if (!origin.current) return
              origin.current = null
              if (dragging) onDragEnd()
            }}
            onDoubleClick={onToggle}
            onKeyDown={(event) => {
              // Escape mid-drag puts the sidebar back where the drag began.
              if (event.key === "Escape" && dragging && origin.current) {
                const to = origin.current.width
                origin.current = null
                onDragEnd(to)
              } else if (event.key === "Enter") onToggle()
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
  index === undefined ? undefined : ({ "--i": index } as React.CSSProperties)

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
      {/* The wrapper fades with the labels (staggered); the chevron itself
          turns with the panel, on no delay. */}
      <span className={cn("flex", fade && FADE_LABEL)}>
        <ChevronRightIcon className="text-muted-foreground transition-[rotate] duration-200 ease-out group-data-panel-open/navtrigger:rotate-90 motion-reduce:transition-none" />
      </span>
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
      <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out group-data-collapsed/sidebar:h-0 in-data-ds-instant:transition-none data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
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
            aria-label={
              !fade && collapsed ? `Account: ${user.name}` : undefined
            }
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

/** Leaf links: groups contribute their sub-pages, plain items themselves. */
const leaves = (items: NavItem[]) =>
  items.flatMap((item) => (item.items?.length ? item.items : [item]))

/** Only the most specific matching link is current (/blocks/projects, not also /blocks). */
function activeHrefFor(items: NavItem[], currentPath: string) {
  return items
    .map((item) => item.href)
    .filter(
      (href) => currentPath === href || currentPath.startsWith(`${href}/`)
    )
    .sort((a, b) => b.length - a.length)[0]
}

type NavProps = {
  activeHref: string | undefined
  fade: boolean
  Link: LinkComponent
  onItemClick?: () => void
  onExpand: () => void
}

function NavEntry({
  item,
  rail,
  index,
  activeHref,
  fade,
  Link,
  onItemClick,
  onExpand,
}: NavProps & { item: NavItem; rail: boolean; index: number }) {
  if (item.items?.length)
    return (
      <NavGroup
        item={item}
        activeHref={activeHref}
        collapsed={rail}
        fade={fade}
        index={index}
        Link={Link}
        onClick={onItemClick}
        onExpand={onExpand}
      />
    )
  return (
    <NavLink
      item={item}
      active={item.href === activeHref}
      collapsed={rail}
      fade={fade}
      index={index}
      Link={Link}
      onClick={onItemClick}
    />
  )
}

/**
 * Running index for the staggered label fade-in: section labels and items in
 * reading order; a group's sub-items take the indices after it.
 */
function staggerOrder(sections: NavSection[], showLabels: boolean) {
  let index = 0
  return sections.map((section) => {
    const label = section.label && showLabels ? index++ : index
    const items: number[] = []
    for (const item of section.items) {
      items.push(index)
      index += 1 + (item.items?.length ?? 0)
    }
    return { label, items }
  })
}

function SidebarNav({
  sections,
  rail,
  ...nav
}: NavProps & { sections: NavSection[]; rail: boolean }) {
  const showLabels = nav.fade || !rail
  const order = staggerOrder(sections, showLabels)
  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {sections.map((section, s) => (
        <div key={sectionKey(section)} className="flex flex-col gap-0.5">
          {section.label && showLabels && (
            <p
              style={indexStyle(order[s].label)}
              className={cn(
                "px-2.5 pb-1 text-xs font-medium text-muted-foreground",
                nav.fade && FADE_LABEL
              )}
            >
              {section.label}
            </p>
          )}
          {section.items.map((item, i) => (
            <NavEntry
              key={item.href}
              item={item}
              rail={rail}
              index={order[s].items[i]}
              {...nav}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}

type ShellUser = { name: string; email: string; initials: string }
type Workspace = { name: string; logo: React.ReactNode; plan?: string }

/** Workspace, search, nav, footer links and the account menu: the rail and the phone drawer. */
function SidebarBody({
  rail,
  workspace,
  sections,
  footerItems,
  user,
  settingsHref,
  onSignOut,
  onSearch,
  ...nav
}: NavProps & {
  rail: boolean
  workspace: Workspace
  sections: NavSection[]
  footerItems?: NavItem[]
  user: ShellUser
  settingsHref?: string
  onSignOut?: () => void
  onSearch: () => void
}) {
  const { fade } = nav
  const labels = fade || !rail
  return (
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
        {labels && (
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
          nav.onItemClick?.()
          onSearch()
        }}
        aria-label={rail ? "Search" : undefined}
        className={cn(
          "flex h-control items-center gap-2.5 rounded-control bg-background px-2.5 text-sm text-muted-foreground shadow-border focus-ring transition-shadow hover:shadow-border-hover",
          !fade && rail && "justify-center px-0"
        )}
      >
        <SearchIcon className="size-4 shrink-0" />
        {labels && (
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
        <SidebarNav sections={sections} rail={rail} {...nav} />
      </div>
      {footerItems && (
        <div className="flex flex-col gap-0.5">
          {footerItems.map((item, i) => (
            <NavEntry
              key={item.href}
              item={item}
              rail={rail}
              index={i}
              {...nav}
            />
          ))}
        </div>
      )}
      <UserMenu
        user={user}
        collapsed={rail}
        fade={fade}
        onSignOut={onSignOut}
        settingsHref={settingsHref}
        Link={nav.Link}
      />
    </>
  )
}

/** Mod+K: every nav page, with its sequence hotkey. */
function NavPalette({
  open,
  onOpenChange,
  sections,
  onNavigate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: NavSection[]
  onNavigate: (href: string) => void
}) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Go to">
      <Command>
        <CommandInput placeholder="Go to…" />
        <CommandList>
          <CommandEmpty>No pages match.</CommandEmpty>
          {sections.map((section) => (
            <CommandGroup
              key={sectionKey(section)}
              heading={section.label ?? "Pages"}
            >
              {leaves(section.items).map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => {
                    onOpenChange(false)
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
  )
}

/**
 * Fade variant: what the sidebar shows right now. Ease out snaps to the rail
 * as soon as a drag crosses 160px; cascade and scrub keep following the
 * pointer until it's released.
 */
function fadeState({
  motion,
  collapsed,
  width,
  dragging,
  dragBelowSnap,
}: {
  motion: SidebarMotion
  collapsed: boolean
  width: number
  dragging: boolean
  dragBelowSnap: boolean
}) {
  const timing = SIDEBAR_MOTION[motion]
  const belowSnap = dragging && dragBelowSnap
  const snapped = dragging && motion === "ease-out" && belowSnap
  const restingWidth = collapsed ? RAIL : width
  let labelsHidden = collapsed
  if (dragging) labelsHidden = motion === "scrub" ? false : belowSnap
  const label = labelsHidden ? timing.out : timing.in
  const style = {
    // Snapped (ease-out below 160px) shows the rail; otherwise a drag's
    // `--sb-drag-w` wins over the resting width.
    width: snapped ? RAIL : `var(--sb-drag-w, ${restingWidth}px)`,
    transitionDuration:
      dragging && !snapped ? "0ms" : `${timing.width.duration}ms`,
    transitionTimingFunction: timing.width.ease,
    "--sb-delay": `${label.delay}ms`,
    "--sb-stagger": `${label.stagger}ms`,
    "--sb-dur": dragging && motion === "scrub" ? "0ms" : `${label.duration}ms`,
    "--sb-drift": `${label.drift}px`,
    "--sb-blur": `${label.blur}px`,
  } as React.CSSProperties
  return { restingWidth, labelsHidden, style }
}

/**
 * Drag-to-resize. React only tracks the discrete states (dragging, below the
 * snap width); the width itself is written to `--sb-drag-w` on the aside every
 * pointer move, so dragging never re-renders the shell.
 */
function useSidebarDrag({
  asideRef,
  motion,
  defaultWidth,
  collapsed,
  setCollapsed,
}: {
  asideRef: React.RefObject<HTMLElement | null>
  motion: SidebarMotion
  defaultWidth: number
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}) {
  // The expanded width, and the live width while dragging.
  const [width, setWidth] = React.useState(defaultWidth)
  const [dragging, setDragging] = React.useState(false)
  const [dragBelowSnap, setDragBelowSnap] = React.useState(false)
  const dragWidth = React.useRef(0)

  const settle = (next: number) => {
    if (next < SNAP) setCollapsed(true)
    else {
      setWidth(next)
      setCollapsed(false)
    }
  }
  const applyDrag = (next: number) => {
    dragWidth.current = next
    const el = asideRef.current
    if (!el) return
    el.style.setProperty("--sb-drag-w", `${next}px`)
    // Scrub: labels fade with the width between the rail and 160px.
    if (motion === "scrub")
      el.style.setProperty(
        "--sb-label-o",
        String(clamp((next - RAIL) / (SNAP - RAIL), 0, 1))
      )
    setDragBelowSnap(next < SNAP)
  }
  const endDrag = (to?: number) => {
    const final = to ?? dragWidth.current
    asideRef.current?.style.removeProperty("--sb-drag-w")
    asideRef.current?.style.removeProperty("--sb-label-o")
    setDragging(false)
    setDragBelowSnap(false)
    settle(final)
  }
  const state = fadeState({ motion, collapsed, width, dragging, dragBelowSnap })
  return {
    ...state,
    dragging,
    startDrag: () => {
      applyDrag(state.restingWidth)
      setDragging(true)
    },
    applyDrag,
    endDrag,
    nudge: (delta: number) =>
      settle(clamp((collapsed ? RAIL : width) + delta, RAIL, MAX_WIDTH)),
  }
}

/**
 * The frame every app page sits in: a tinted sidebar and the page on an inset
 * white surface (nested surfaces, docs/COMPOSITION.md).
 *
 * - Desktop: drag the edge to resize; under 160px (or Mod+B) it settles to an
 *   icon rail with tooltips. Labels leave per `motion` (ease-out, cascade,
 *   scrub) and the icons never move.
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
  variant = "fade",
  motion = "cascade",
  resizable = true,
  defaultWidth = 256,
  footerItems,
  children,
}: {
  workspace: Workspace
  sections: NavSection[]
  user: ShellUser
  currentPath: string
  linkComponent?: LinkComponent
  onNavigate?: (href: string) => void
  settingsHref?: string
  onSignOut?: () => void
  defaultCollapsed?: boolean
  /**
   * `fade` (the DS standard for resizable sidebars): labels stay mounted and
   * leave per `motion`, the edge resizes, icons never move. `classic`: the old
   * rail (labels unmount, icons center), no resizing.
   */
  variant?: "fade" | "classic"
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
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const asideRef = React.useRef<HTMLElement>(null)
  const drag = useSidebarDrag({
    asideRef,
    motion,
    defaultWidth,
    collapsed,
    setCollapsed,
  })
  const items = leaves([
    ...sections.flatMap((s) => s.items),
    ...(footerItems ?? []),
  ])
  const activeHref = activeHrefFor(items, currentPath)

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

  const body = {
    workspace,
    sections,
    footerItems,
    user,
    settingsHref,
    onSignOut,
    activeHref,
    fade,
    Link,
    onExpand: () => setCollapsed(false),
    onSearch: () => setPaletteOpen(true),
  }
  const labelsHidden = fade ? drag.labelsHidden : collapsed

  return (
    <AppShellContext value={context}>
      <TooltipProvider>
        <div
          data-slot="app-shell"
          data-collapsed={collapsed || undefined}
          className="flex min-h-dvh bg-sidebar text-sidebar-foreground"
        >
          <aside
            ref={asideRef}
            data-slot="app-sidebar"
            data-collapsed={labelsHidden || undefined}
            data-motion={fade ? motion : undefined}
            style={fade ? drag.style : undefined}
            className={cn(
              "group/sidebar sticky top-0 hidden h-dvh shrink-0 flex-col gap-4 overflow-hidden p-3 transition-[width] in-data-ds-instant:transition-none motion-reduce:transition-none md:flex",
              !fade && "duration-200 ease-in-out",
              !fade && (collapsed ? "w-16" : "w-64")
            )}
          >
            <SidebarBody rail={collapsed} {...body} />
            {fade && resizable && (
              <ResizeHandle
                width={drag.restingWidth}
                dragging={drag.dragging}
                onDragStart={drag.startDrag}
                onDrag={drag.applyDrag}
                onDragEnd={drag.endDrag}
                onToggle={() => toggleSidebar()}
                onNudge={drag.nudge}
              />
            )}
          </aside>

          {/* Phones: a left drawer that tracks the finger and swipes away. */}
          <Drawer
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            swipeDirection="left"
          >
            <DrawerContent className="bg-sidebar text-sidebar-foreground [--drawer-bleed-background:var(--color-sidebar)] [--drawer-content-width:18rem]! md:hidden">
              <DrawerTitle className="sr-only">Navigation</DrawerTitle>
              <div className="flex min-h-0 flex-1 flex-col gap-4 p-3 ps-[calc(--spacing(3)+env(safe-area-inset-left))] pt-[calc(--spacing(3)+env(safe-area-inset-top))] pb-[calc(--spacing(3)+env(safe-area-inset-bottom))]">
                <SidebarBody
                  rail={false}
                  onItemClick={() => setMobileOpen(false)}
                  {...body}
                />
              </div>
            </DrawerContent>
          </Drawer>

          {/* A `fill` page (full-height table, board) pins the column to the
              viewport so only its own region scrolls, never the window too. */}
          <div className="flex min-w-0 flex-1 flex-col has-data-fill:h-dvh md:py-2 md:pe-2">
            <main
              id="main"
              className="flex min-h-full flex-1 flex-col bg-background text-foreground has-data-fill:min-h-0 has-data-fill:overflow-y-auto md:rounded-xl md:shadow-border"
            >
              {children}
            </main>
          </div>
        </div>

        <NavPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          sections={sections}
          onNavigate={onNavigate}
        />
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
/**
 * The page body. Cap reading-width pages with a class (`max-w-4xl`); they
 * center in the space beside the sidebar. `fill` makes it take exactly the height left under the
 * header (for a table or board that scrolls inside itself); without it the
 * window scrolls.
 */
function AppShellContent({
  className,
  fill,
  ...props
}: React.ComponentProps<"div"> & { fill?: boolean }) {
  return (
    <div
      data-slot="app-shell-content"
      data-fill={fill || undefined}
      className={cn(
        // mx-auto: a page that caps its width (max-w-4xl) sits centered.
        "mx-auto flex w-full flex-col gap-6 p-4 md:p-6",
        fill && "min-h-0 flex-1",
        className
      )}
      {...props}
    />
  )
}

export { AppShell, AppShellContent, AppShellHeader, useAppShell }
