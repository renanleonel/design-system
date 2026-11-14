"use client"

import * as React from "react"

import { CodeFigure } from "@/components/docs/code-figure"
import { Skeleton } from "@/components/ui/skeleton"

type SourceFile = { path: string; code: string; html: string }

const requests = new Map<string, Promise<SourceFile[] | null>>()

function load(registry: string) {
  let request = requests.get(registry)
  if (!request) {
    request = fetch(`/block-source/${registry}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { files: SourceFile[] } | null) => data?.files ?? null)
      .catch(() => null)
    requests.set(registry, request)
  }
  return request
}

function File({ registry, path }: { registry: string; path: string }) {
  const files = React.use(load(registry))
  const file = files?.find((f) => f.path === path)
  if (!file) {
    return (
      <p className="rounded-xl px-4 py-6 text-sm text-muted-foreground shadow-border">
        Couldn&apos;t load {path}. Reload the page to try again.
      </p>
    )
  }
  return <CodeFigure html={file.html} code={file.code} title={file.path} />
}

/** One file of a block's source, fetched the first time a Code tab shows it. */
export function BlockSource({
  registry,
  path,
}: {
  registry: string
  path: string
}) {
  return (
    <React.Suspense fallback={<Skeleton className="h-[32rem] rounded-xl" />}>
      <File registry={registry} path={path} />
    </React.Suspense>
  )
}
