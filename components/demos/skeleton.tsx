"use client"

import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton"

/** Shape skeletons like the content they replace. */
export function Default() {
  return (
    <SkeletonGroup label="Loading profile" delay={false} className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </SkeletonGroup>
  )
}

export function Card() {
  return (
    <SkeletonGroup
      label="Loading project"
      delay={false}
      className="flex w-64 flex-col gap-3 rounded-xl p-4 shadow-border"
    >
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </SkeletonGroup>
  )
}
