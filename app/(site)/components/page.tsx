import type { Metadata } from "next"
import Link from "next/link"

import { getComponents } from "@/lib/docs"

export const metadata: Metadata = { title: "Components · renan/ui" }

export default function ComponentsIndex() {
  const components = getComponents()
  const groups = [...new Set(components.map((c) => c.group))]
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Components
        </h1>
        <p className="max-w-prose text-muted-foreground">
          {components.length} components on Base UI. Each one covers hover,
          focus, disabled, loading and invalid states, works with the keyboard
          and adapts to touch screens.
        </p>
      </header>
      {groups.map((group) => (
        <section key={group} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">{group}</h2>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {components
              .filter((c) => c.group === group)
              .map((c) => (
                <li key={c.name}>
                  <Link
                    href={c.href}
                    className="group/link -mx-2 flex flex-col rounded-lg px-2 py-2 focus-ring transition-colors hover:bg-muted/60"
                  >
                    <span className="font-medium">{c.title}</span>
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {c.description}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
