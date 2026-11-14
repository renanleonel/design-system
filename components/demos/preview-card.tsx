"use client"

import * as React from "react"

import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/components/ui/preview-card"

/** Hover or focus the link. Touch screens just follow it. */
export function Default() {
  return (
    <PreviewCard>
      <p className="max-w-md text-sm text-pretty">
        Read the{" "}
        <PreviewCardTrigger href="#guide">typography guide</PreviewCardTrigger>{" "}
        before changing the type scale.
      </p>
      <PreviewCardContent>
        <p className="font-medium">Typography guide</p>
        <p className="text-muted-foreground">
          Sizes, weights and line heights for every surface, with the reasons
          behind them.
        </p>
      </PreviewCardContent>
    </PreviewCard>
  )
}

/** Long names, an unbroken word, CJK and Arabic text. */
export function WorstCase() {
  return (
    <PreviewCard>
      <p className="max-w-xs text-sm">
        Assigned to{" "}
        <PreviewCardTrigger href="#worst">
          Maria Eduarda dos Santos Albuquerque Cavalcanti
        </PreviewCardTrigger>
      </p>
      <PreviewCardContent>
        <p className="font-medium">
          Maria Eduarda dos Santos Albuquerque Cavalcanti
        </p>
        <p className="text-muted-foreground">
          maria.eduarda.albuquerque.cavalcanti@departamento-de-engenharia.empresa.com.br
        </p>
        <p className="text-muted-foreground">Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>
        <p>山田太郎さんは東京の開発チームでデザインシステムを担当しています。</p>
        <p>مهندسة برمجيات تعمل على نظام التصميم في فريق المنتج.</p>
      </PreviewCardContent>
    </PreviewCard>
  )
}

export function Empty() {
  return (
    <PreviewCard>
      <p className="max-w-xs text-sm">
        Linked to{" "}
        <PreviewCardTrigger href="#missing">a deleted page</PreviewCardTrigger>
      </p>
      <PreviewCardContent>
        <p className="text-muted-foreground">No preview available.</p>
      </PreviewCardContent>
    </PreviewCard>
  )
}
