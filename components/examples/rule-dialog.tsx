"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BellRingIcon,
  ChartLineIcon,
  CheckIcon,
  GitForkIcon,
  GripVerticalIcon,
  InfoIcon,
  ListOrderedIcon,
  PlusIcon,
  RepeatIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconTile } from "@/components/ui/icon-tile"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Option = { label: string; value: string }

const FIELDS: Option[] = [
  { label: "Priority", value: "priority" },
  { label: "Waiting time", value: "waiting" },
  { label: "Customer plan", value: "plan" },
]
const OPERATORS: Option[] = [
  { label: "equals", value: "eq" },
  { label: "is more than", value: "gt" },
  { label: "is less than", value: "lt" },
]
const VALUES: Record<string, Option[]> = {
  priority: ["Urgent", "High", "Normal"].map((l) => ({ label: l, value: l })),
  waiting: ["1 hour", "2 hours", "4 hours"].map((l) => ({
    label: l,
    value: l,
  })),
  plan: ["Enterprise", "Pro", "Free"].map((l) => ({ label: l, value: l })),
}
const ACTIONS = [
  { label: "Notify on-call", value: "notify", icon: <BellRingIcon /> },
  { label: "Add to queue", value: "queue", icon: <ListOrderedIcon /> },
]

function Picker({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: Option[]
  value: string
  onChange: (value: string) => void
  label: string
  className?: string
}) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(v) => v && onChange(v)}
      aria-label={label}
    >
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type Condition = { id: number; field: string; op: string; value: string }

function ConditionRow({
  condition,
  onChange,
  onRemove,
  canRemove,
}: {
  condition: Condition
  onChange: (c: Condition) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <GripVerticalIcon
        aria-hidden
        className="hidden size-4 shrink-0 text-muted-foreground/60 sm:block"
      />
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[1.2fr_1fr_1fr]">
        <Picker
          label="Field"
          items={FIELDS}
          value={condition.field}
          className="w-full bg-background"
          onChange={(field) =>
            onChange({ ...condition, field, value: VALUES[field][0].value })
          }
        />
        <Picker
          label="Operator"
          items={OPERATORS}
          value={condition.op}
          className="w-full bg-background"
          onChange={(op) => onChange({ ...condition, op })}
        />
        <Picker
          label="Value"
          items={VALUES[condition.field]}
          value={condition.value}
          className="w-full bg-background"
          onChange={(value) => onChange({ ...condition, value })}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Remove condition"
        disabled={!canRemove}
        onClick={onRemove}
      >
        <Trash2Icon />
      </Button>
    </div>
  )
}

function ActionRow({
  label,
  tone,
  value,
  onChange,
}: {
  label: string
  tone: "green" | "gray"
  value: string
  onChange: (v: string) => void
}) {
  const action = ACTIONS.find((a) => a.value === value)
  return (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3">
      <Badge tone={tone} size="md" className="justify-self-start">
        {label}
      </Badge>
      <Select
        items={ACTIONS}
        value={value}
        onValueChange={(v) => v && onChange(v)}
        aria-label={`${label} action`}
      >
        <SelectTrigger
          aria-label={`${label} action`}
          className="h-control-lg w-full bg-muted/50 ps-2"
        >
          <IconTile size="sm" tone="inverse">
            {action?.icon}
          </IconTile>
          <SelectValue className="font-medium" />
        </SelectTrigger>
        <SelectContent>
          {ACTIONS.map((a) => (
            <SelectItem key={a.value} value={a.value}>
              {a.icon}
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function RuleDialog() {
  const [open, setOpen] = React.useState(false)
  const [matchAll, setMatchAll] = React.useState(true)
  const [then, setThen] = React.useState("notify")
  const [otherwise, setOtherwise] = React.useState("queue")
  const [conditions, setConditions] = React.useState<Condition[]>([
    { id: 1, field: "priority", op: "eq", value: "Urgent" },
    { id: 2, field: "waiting", op: "gt", value: "2 hours" },
  ])
  const join = matchAll ? "AND" : "OR"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        Edit rule
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl" showCloseButton={false}>
        {/* Close sits in the header row, centered with the title block. */}
        <DialogHeader className="flex-row items-center gap-3 border-b p-4">
          <IconTile tone="amber" size="lg">
            <GitForkIcon />
          </IconTile>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle>Edit rule</DialogTitle>
            <DialogDescription>
              Escalate urgent tickets · step 3 of 8
            </DialogDescription>
          </div>
          <DialogClose
            render={<Button variant="outline" size="icon" aria-label="Close" />}
          >
            <XIcon />
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-4">
          <section
            aria-label="Conditions"
            className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3"
          >
            <div className="flex items-center gap-2">
              <Badge className="bg-foreground text-background">IF</Badge>
              <p className="flex-1 text-sm text-muted-foreground">
                {matchAll
                  ? "All of these must be true"
                  : "Any of these can be true"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="bg-background"
                onClick={() => setMatchAll((v) => !v)}
              >
                <RepeatIcon data-icon="inline-start" />
                {matchAll ? "Match any instead" : "Match all instead"}
              </Button>
            </div>

            {conditions.map((c, index) => (
              <React.Fragment key={c.id}>
                {index > 0 && (
                  <div className="flex items-center gap-2 sm:ps-6">
                    <Badge variant="outline" className="bg-background">
                      {join}
                    </Badge>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <ConditionRow
                  condition={c}
                  canRemove={conditions.length > 1}
                  onChange={(next) =>
                    setConditions((list) =>
                      list.map((x) => (x.id === c.id ? next : x))
                    )
                  }
                  onRemove={() =>
                    setConditions((list) => list.filter((x) => x.id !== c.id))
                  }
                />
              </React.Fragment>
            ))}

            <div className="flex items-center gap-2 sm:ps-6">
              <Button
                variant="outline"
                size="sm"
                className="bg-background"
                onClick={() =>
                  setConditions((list) => [
                    ...list,
                    {
                      id: Date.now(),
                      field: "plan",
                      op: "eq",
                      value: "Enterprise",
                    },
                  ])
                }
              >
                <PlusIcon data-icon="inline-start" />
                Add condition
              </Button>
            </div>
          </section>

          <div className="flex flex-col gap-2">
            <ActionRow
              label="Then"
              tone="green"
              value={then}
              onChange={setThen}
            />
            <ActionRow
              label="Else"
              tone="gray"
              value={otherwise}
              onChange={setOtherwise}
            />
          </div>

          <Alert tone="green">
            <ChartLineIcon />
            <AlertDescription className="tabular-nums">
              Tested on the last 200 tickets: 31 would escalate, 169 would
              queue.
            </AlertDescription>
            <AlertAction>
              <Button variant="ghost" size="xs" className="text-tone-green">
                Run again
              </Button>
            </AlertAction>
          </Alert>
        </div>

        <DialogFooter className="m-0 items-center rounded-b-xl sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <InfoIcon className="size-4 shrink-0" />
            Changes apply to the draft until you publish.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              hotkey="Mod+Enter"
              onClick={() => {
                setOpen(false)
                toast.success("Rule saved to draft")
              }}
            >
              <CheckIcon data-icon="inline-start" />
              Save rule
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
