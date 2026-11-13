"use client"

import * as React from "react"
import { ChevronRightIcon, FileTextIcon, ShieldCheckIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { IconTile } from "@/components/ui/icon-tile"
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
  { name: "Ada Lovelace", email: "ada@acme.com" },
  { name: "Grace Hopper", email: "grace@acme.com" },
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
                <AvatarFallback>
                  {person.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
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
