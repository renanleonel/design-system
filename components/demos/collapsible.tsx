"use client"

import { ChevronsUpDownIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function Default() {
  return (
    <Collapsible className="w-full max-w-sm rounded-xl p-3 shadow-border">
      <div className="flex items-center justify-between gap-2">
        <h4 className="min-w-0 truncate text-sm font-medium">
          3 repositories starred
        </h4>
        <CollapsibleTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label="Toggle repositories"
        >
          <ChevronsUpDownIcon />
        </CollapsibleTrigger>
      </div>
      <div className="mt-2 rounded-lg px-3 py-2 text-sm shadow-border">
        renanleonel/ui
      </div>
      <CollapsibleContent>
        <div className="mt-2 flex flex-col gap-2">
          <div className="rounded-lg px-3 py-2 text-sm shadow-border">
            base-ui/react
          </div>
          <div className="rounded-lg px-3 py-2 text-sm shadow-border">
            shadcn-ui/ui
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** A text trigger with a chevron that turns while open. */
export function ShowMore() {
  return (
    <Collapsible className="w-full max-w-sm">
      <p className="text-sm text-muted-foreground">
        Invoices are issued on the first business day of each month.
      </p>
      <CollapsibleContent>
        <p className="pt-2 text-sm text-muted-foreground">
          Late payments accrue 2% per month. Disputes must be opened within 30
          days of the invoice date.
        </p>
      </CollapsibleContent>
      <CollapsibleTrigger className="mt-2 flex items-center gap-1 text-sm font-medium">
        <span className="group-data-panel-open/collapsible-trigger:hidden">
          Show more
        </span>
        <span className="hidden group-data-panel-open/collapsible-trigger:inline">
          Show less
        </span>
        <ChevronDownIcon className="size-4 transition-transform duration-(--ds-duration-popover) ease-out group-data-panel-open/collapsible-trigger:rotate-180 motion-reduce:transition-none" />
      </CollapsibleTrigger>
    </Collapsible>
  )
}

export function Disabled() {
  return (
    <Collapsible disabled className="w-full max-w-sm">
      <CollapsibleTrigger
        render={<Button variant="outline" />}
        className="w-full justify-between"
      >
        Advanced settings
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsibleContent>Hidden.</CollapsibleContent>
    </Collapsible>
  )
}

export function WorstCase() {
  return (
    <Collapsible
      defaultOpen
      className="w-full max-w-sm rounded-xl p-3 shadow-border"
    >
      <CollapsibleTrigger
        render={<Button variant="ghost" />}
        className="w-full min-w-0 justify-start"
      >
        <span className="min-w-0 truncate">
          Maria Eduarda dos Santos Albuquerque Cavalcanti e Silva Junior
        </span>
        <ChevronDownIcon className="ms-auto transition-transform duration-(--ds-duration-popover) ease-out group-data-panel-open/collapsible-trigger:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 px-2.5 pt-2">
          <p>
            Supercalifragilisticexpialidocious_Supercalifragilisticexpialidocious
          </p>
          <p>这是一个非常长的中文标题用来测试换行和截断的行为是否正常工作</p>
          <p dir="rtl">
            هذا نص طويل جدا لاختبار التفاف الأسطر في الاتجاه من اليمين إلى اليسار
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function Empty() {
  return (
    <Collapsible
      defaultOpen
      className="w-full max-w-sm rounded-xl p-3 shadow-border"
    >
      <CollapsibleTrigger
        render={<Button variant="ghost" />}
        className="w-full justify-start"
      >
        Attachments (0)
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="px-2.5 pt-2 text-muted-foreground">No attachments yet.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}
