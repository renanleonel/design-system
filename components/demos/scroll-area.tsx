"use client"

import { ScrollArea } from "@/components/ui/scroll-area"

const TAGS = Array.from({ length: 40 }, (_, i) => `v1.${40 - i}.0`)

export function Default() {
  return (
    <ScrollArea
      className="h-64 w-full max-w-xs rounded-xl shadow-border"
      viewportProps={{ "aria-label": "Releases" }}
    >
      <div className="p-4">
        <h4 className="mb-3 text-sm font-medium">Releases</h4>
        <ul className="flex flex-col">
          {TAGS.map((tag) => (
            <li key={tag} className="border-b py-2 text-sm last:border-b-0">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  )
}

/** Edges fade only where more content waits beyond them. */
export function Fade() {
  return (
    <ScrollArea
      fade
      className="h-64 w-full max-w-xs rounded-xl shadow-border"
      viewportProps={{ "aria-label": "Releases" }}
    >
      <ul className="flex flex-col p-4">
        {TAGS.map((tag) => (
          <li key={tag} className="border-b py-2 text-sm last:border-b-0">
            {tag}
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

export function Horizontal() {
  return (
    <ScrollArea
      orientation="horizontal"
      className="w-full max-w-sm rounded-xl shadow-border"
      viewportProps={{ "aria-label": "Gallery" }}
    >
      <div className="flex w-max gap-3 p-4">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="grid h-24 w-32 shrink-0 place-items-center rounded-lg bg-muted text-sm text-muted-foreground"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export function Both() {
  return (
    <ScrollArea
      orientation="both"
      className="h-56 w-full max-w-sm rounded-xl shadow-border"
      viewportProps={{ "aria-label": "Grid" }}
    >
      <div className="grid w-[40rem] grid-cols-6 gap-2 p-4">
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="grid h-12 place-items-center rounded-md bg-muted text-xs text-muted-foreground tabular-nums"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export function WorstCase() {
  return (
    <ScrollArea
      fade
      orientation="both"
      className="h-56 w-full max-w-xs rounded-xl shadow-border"
      viewportProps={{ "aria-label": "Worst case" }}
    >
      <ul className="flex w-max min-w-full flex-col gap-2 p-4 text-sm">
        <li>Maria Eduarda dos Santos Albuquerque Cavalcanti e Silva Junior</li>
        <li>
          Supercalifragilisticexpialidocious_Supercalifragilisticexpialidocious
        </li>
        <li>
          这是一个非常长的中文标题用来测试换行和截断的行为是否正常工作这是一个非常长的中文标题
        </li>
        <li dir="rtl">
          هذا نص طويل جدا لاختبار التفاف الأسطر في الاتجاه من اليمين إلى اليسار
        </li>
        {Array.from({ length: 20 }, (_, i) => (
          <li key={i}>João Pedro de Oliveira Neto #{i + 1}</li>
        ))}
      </ul>
    </ScrollArea>
  )
}

/** Content that fits: no scrollbar, no fade. */
export function One() {
  return (
    <ScrollArea
      fade
      className="max-h-64 w-full max-w-xs rounded-xl shadow-border"
      viewportProps={{ "aria-label": "Single item" }}
    >
      <p className="p-4 text-sm">Only one release so far.</p>
    </ScrollArea>
  )
}
