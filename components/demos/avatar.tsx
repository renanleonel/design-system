"use client"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Default() {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function WithBadge() {
  return (
    <Avatar size="lg">
      <AvatarFallback>GH</AvatarFallback>
      <AvatarBadge className="bg-tone-green">
        <span className="sr-only">Online</span>
      </AvatarBadge>
    </Avatar>
  )
}

const TEAM = [
  { initials: "AL", name: "Ana Lima" },
  { initials: "GH", name: "Gabriel Henrique" },
  { initials: "MS", name: "Maria Eduarda dos Santos" },
]
const MORE = ["João Pedro", "Luiza Costa", "Rafael Souza", "Bia Nunes"]

/** Hover an avatar for the person's name; "+4" lists the rest. */
export function Group() {
  return (
    <AvatarGroup>
      {TEAM.map((person) => (
        <Tooltip key={person.initials}>
          <TooltipTrigger
            // Keep the avatar's slot: the group styles its children by it.
            data-slot="avatar"
            // Focusable, so keyboard users get the name too.
            render={
              <Avatar
                role="img"
                tabIndex={0}
                aria-label={person.name}
                className="focus-ring outline-none"
              />
            }
          >
            <AvatarFallback aria-hidden>{person.initials}</AvatarFallback>
          </TooltipTrigger>
          <TooltipContent>{person.name}</TooltipContent>
        </Tooltip>
      ))}
      <Tooltip>
        <TooltipTrigger
          data-slot="avatar-group-count"
          render={
            <AvatarGroupCount
              role="img"
              tabIndex={0}
              aria-label={`${MORE.length} more: ${MORE.join(", ")}`}
              className="focus-ring outline-none"
            />
          }
        >
          +{MORE.length}
        </TooltipTrigger>
        <TooltipContent>{MORE.join(", ")}</TooltipContent>
      </Tooltip>
    </AvatarGroup>
  )
}
