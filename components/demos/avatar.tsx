"use client"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"

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
      <AvatarBadge className="bg-tone-green" aria-label="Online" />
    </Avatar>
  )
}

export function Group() {
  return (
    <AvatarGroup>
      {["AL", "GH", "KJ"].map((initials) => (
        <Avatar key={initials}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  )
}
