import {
  CheckIcon,
  GitMergeIcon,
  RocketIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"

/** Icons in tone tiles; newest first. */
export function Default() {
  return (
    <Timeline className="max-w-md">
      <TimelineItem icon={<RocketIcon />} tone="green">
        <TimelineHeader>
          <TimelineTitle>Deployed to production</TimelineTitle>
          <TimelineTime dateTime="2026-11-13T14:32">14:32</TimelineTime>
        </TimelineHeader>
        <TimelineDescription>
          Renan Leonel promoted build #482.
        </TimelineDescription>
      </TimelineItem>
      <TimelineItem icon={<TriangleAlertIcon />} tone="amber">
        <TimelineHeader>
          <TimelineTitle>Checks passed with warnings</TimelineTitle>
          <TimelineTime dateTime="2026-11-13T14:20">14:20</TimelineTime>
        </TimelineHeader>
        <TimelineDescription>
          2 accessibility warnings in /settings.
        </TimelineDescription>
      </TimelineItem>
      <TimelineItem icon={<GitMergeIcon />} tone="purple">
        <TimelineHeader>
          <TimelineTitle>Merged “Virtualize tables”</TimelineTitle>
          <TimelineTime dateTime="2026-11-13T13:58">13:58</TimelineTime>
        </TimelineHeader>
        <TimelineDescription>
          Ana Souza approved; João Silva merged.
        </TimelineDescription>
      </TimelineItem>
      <TimelineItem icon={<CheckIcon />}>
        <TimelineHeader>
          <TimelineTitle>Opened pull request</TimelineTitle>
          <TimelineTime dateTime="2026-11-13T11:05">11:05</TimelineTime>
        </TimelineHeader>
      </TimelineItem>
    </Timeline>
  )
}

/** Dots for a quieter history, like order status. */
export function Dots() {
  return (
    <Timeline className="max-w-sm">
      <TimelineItem tone="blue">
        <TimelineHeader>
          <TimelineTitle>Out for delivery</TimelineTitle>
          <TimelineTime dateTime="2026-11-13">Nov 13</TimelineTime>
        </TimelineHeader>
      </TimelineItem>
      <TimelineItem>
        <TimelineHeader>
          <TimelineTitle>Shipped from São Paulo</TimelineTitle>
          <TimelineTime dateTime="2026-11-11">Nov 11</TimelineTime>
        </TimelineHeader>
      </TimelineItem>
      <TimelineItem>
        <TimelineHeader>
          <TimelineTitle>Order placed</TimelineTitle>
          <TimelineTime dateTime="2026-11-10">Nov 10</TimelineTime>
        </TimelineHeader>
      </TimelineItem>
    </Timeline>
  )
}
