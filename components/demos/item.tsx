"use client"

import * as React from "react"
import { ChevronRightIcon, FileTextIcon, ShieldCheckIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { IconTile } from "@/components/ui/icon-tile"
import { initials } from "@/lib/utils"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"
import { TooltipOverflow } from "@/components/ui/tooltip"

export function Default() {
  return (
    <Item variant="outline" className="max-w-md">
      <ItemMedia>
        <IconTile tone="green">
          <ShieldCheckIcon />
        </IconTile>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Two-factor authentication</ItemTitle>
        <ItemDescription>Required for every admin since May 2.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">
          Manage
        </Button>
      </ItemActions>
    </Item>
  )
}

/** `render={<a />}` makes the whole row the link. */
export function AsLink() {
  return (
    <Item variant="muted" className="max-w-md" render={<a href="#invoice" />}>
      <ItemMedia variant="icon">
        <FileTextIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Invoice INV-2041</ItemTitle>
        <ItemDescription>Paid on May 1 · $480.00</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      </ItemActions>
    </Item>
  )
}

const PEOPLE = [
  { name: "Ana Souza", email: "ana@acme.com" },
  { name: "João Silva", email: "joao@acme.com" },
]

export function List() {
  return (
    <ItemGroup className="max-w-md">
      {PEOPLE.map((person, i) => (
        <React.Fragment key={person.email}>
          {i > 0 && <ItemSeparator />}
          <Item size="sm">
            <ItemMedia>
              <Avatar>
                <AvatarFallback>{initials(person.name)}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{person.name}</ItemTitle>
              <ItemDescription>{person.email}</ItemDescription>
            </ItemContent>
          </Item>
        </React.Fragment>
      ))}
    </ItemGroup>
  )
}

const WORST_PEOPLE = [
  {
    name: "Maria Eduarda dos Santos Albuquerque Cavalcanti",
    email: "maria.eduarda.cavalcanti@northwind-industries-holdings.example.com",
  },
  { name: "Jo", email: "jo@a.test" },
  { name: "王秀英", email: "wang.xiuying@example.com" },
]

/**
 * Worst case: long compound names, an unbreakable email, a two-letter name and
 * CJK, in a narrow column. Each truncates to one line; `TooltipOverflow` shows
 * the full text only on the rows that got cut.
 */
export function WorstCase() {
  return (
    <ItemGroup className="max-w-xs">
      {WORST_PEOPLE.map((person, i) => (
        <React.Fragment key={person.email}>
          {i > 0 && <ItemSeparator />}
          <Item size="sm">
            <ItemMedia>
              <Avatar>
                <AvatarFallback>{initials(person.name)}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="w-full">
                <TooltipOverflow>{person.name}</TooltipOverflow>
              </ItemTitle>
              <ItemDescription className="line-clamp-none">
                <TooltipOverflow>{person.email}</TooltipOverflow>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </ItemActions>
          </Item>
        </React.Fragment>
      ))}
    </ItemGroup>
  )
}
