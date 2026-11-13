"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

import type { NavGroup } from "@/lib/docs"

/** The grouped page list: the desktop sidebar and the mobile menu. */
export function DocsNav({
  groups,
  onNavigate,
  className,
}: {
  groups: NavGroup[]
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()
  return (
    <nav aria-label="Docs" className={cn("flex flex-col gap-6", className)}>
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-2 text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const active = item.href === pathname
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className="flex h-8 items-center rounded-md px-2 text-sm text-foreground/80 focus-ring transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground pointer-coarse:h-11"
                  >
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
