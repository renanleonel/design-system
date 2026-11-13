"use client"

import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"
import { MailPlusIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Form,
  FormBanner,
  FormField,
  FormSubmit,
  useZodForm,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toastUndo } from "@/components/ui/sonner"
import { useIsMobile } from "@/hooks/use-media-query"
import { initials } from "@/lib/utils"

const ROLES = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Member", value: "member" },
  { label: "Viewer", value: "viewer" },
]

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** One settings section: what it is on the leading column, the controls on a card. */
function SettingsSection({
  title,
  description,
  children,
  tone,
}: {
  title: string
  description: string
  children: React.ReactNode
  tone?: "danger"
}) {
  const id = React.useId()
  return (
    <section
      aria-labelledby={id}
      className="grid grid-cols-[minmax(0,1fr)] gap-4 border-b pb-8 last:border-b-0 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-10"
    >
      <div className="flex flex-col gap-1 md:pt-4">
        <h2
          id={id}
          className={
            tone === "danger" ? "font-medium text-destructive" : "font-medium"
          }
        >
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div
        className={
          tone === "danger"
            ? "rounded-xl bg-destructive/5 p-4 shadow-[0_0_0_1px_color-mix(in_oklch,var(--destructive)_25%,transparent)]"
            : "rounded-xl bg-card p-4 shadow-border"
        }
      >
        {children}
      </div>
    </section>
  )
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters"),
  email: z.email("Enter an email like name@company.com"),
  handle: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9-]{3,30}$/,
      "Use 3–30 lowercase letters, numbers or dashes"
    ),
})

function ProfileForm() {
  const form = useZodForm(profileSchema, {
    defaultValues: {
      name: "Renan Leonel",
      email: "renan@acme.dev",
      handle: "renan",
    },
  })
  return (
    <Form
      form={form}
      onSubmit={async () => {
        await wait(800)
        toast.success("Profile saved")
      }}
    >
      <FormBanner />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2">
        <FormField
          name="name"
          label="Full name"
          render={(field) => <Input autoComplete="name" {...field} />}
        />
        <FormField
          name="email"
          label="Email"
          description="Used for sign-in and notifications."
          render={(field) => (
            <Input
              type="email"
              autoComplete="email"
              spellCheck={false}
              {...field}
            />
          )}
        />
      </div>
      <FormField
        name="handle"
        label="Username"
        description="Teammates mention you with @ and this name."
        render={(field) => (
          <Input spellCheck={false} autoComplete="username" {...field} />
        )}
      />
      <div className="flex justify-end">
        <FormSubmit>Save profile</FormSubmit>
      </div>
    </Form>
  )
}

export type Member = {
  id: string
  name: string
  email: string
  role: string
  pending?: boolean
}

const MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Renan Leonel",
    email: "renan@acme.dev",
    role: "owner",
  },
  {
    id: "m2",
    name: "Ana Souza",
    email: "ana@acme.dev",
    role: "admin",
  },
  {
    id: "m3",
    name: "João Silva",
    email: "joao@acme.dev",
    role: "member",
  },
  {
    id: "m4",
    name: "pedro.santos@partner.io",
    email: "pedro.santos@partner.io",
    role: "viewer",
    pending: true,
  },
]

const inviteSchema = z.object({
  email: z.email("Enter an email like name@company.com"),
  role: z.enum(["admin", "member", "viewer"]),
})

function InviteDialog({
  onInvite,
}: {
  onInvite: (email: string, role: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const form = useZodForm(inviteSchema, {
    defaultValues: { email: "", role: "member" },
  })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <MailPlusIcon data-icon="inline-start" />
        Invite
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            They get an email with a link that expires in 7 days.
          </DialogDescription>
        </DialogHeader>
        <Form
          form={form}
          className="gap-4"
          onSubmit={async (values) => {
            await wait(700)
            onInvite(values.email, values.role)
            form.reset()
            setOpen(false)
            toast.success(`Invitation sent to ${values.email}`)
          }}
        >
          <FormField
            name="email"
            label="Email"
            render={(field) => (
              <Input
                type="email"
                autoComplete="off"
                spellCheck={false}
                placeholder="name@company.com"
                {...field}
              />
            )}
          />
          <FormField
            name="role"
            label="Role"
            render={({ value, onChange, id, ...field }) => (
              <Select
                items={ROLES.slice(1)}
                value={value}
                onValueChange={onChange}
                id={id}
              >
                <SelectTrigger id={id} className="w-full" {...field}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.slice(1).map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <FormSubmit>Send invite</FormSubmit>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function Members({ initial }: { initial: Member[] }) {
  const [members, setMembers] = React.useState(initial)
  // Phones hide the role select; the row's menu carries the role instead.
  const mobile = useIsMobile()
  const changeRole = (member: Member, role: string) => {
    setMembers((list) =>
      list.map((x) => (x.id === member.id ? { ...x, role } : x))
    )
    toast.success(
      `${member.name} is now ${ROLES.find((r) => r.value === role)?.label.toLowerCase()}`
    )
  }
  const remove = (member: Member) => {
    const before = members
    setMembers((list) => list.filter((m) => m.id !== member.id))
    toastUndo(`Removed ${member.name}`, { onUndo: () => setMembers(before) })
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground tabular-nums">
          {members.length} of 10 seats used
        </p>
        <InviteDialog
          onInvite={(email, role) =>
            setMembers((list) => [
              ...list,
              {
                id: email,
                name: email,
                email,
                role,
                pending: true,
              },
            ])
          }
        />
      </div>
      <ul className="-mx-4 divide-y border-t">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar>
              <AvatarFallback className="bg-tone-blue-soft text-xs font-medium text-tone-blue">
                {initials(m.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-medium">
                <span className="truncate" title={m.name}>
                  {m.name}
                </span>
                {m.pending && <Badge tone="amber">Invited</Badge>}
              </p>
              {/* Phones show the role here (the select is hidden); an invite
                  without a name already shows its email above. */}
              {(mobile || m.name !== m.email) && (
                <p
                  className="truncate text-sm text-muted-foreground"
                  title={m.email}
                >
                  {mobile && (
                    <span className="text-foreground">
                      {ROLES.find((r) => r.value === m.role)?.label}
                      {m.name !== m.email && " · "}
                    </span>
                  )}
                  {m.name !== m.email && m.email}
                </p>
              )}
            </div>
            <Select
              items={ROLES}
              value={m.role}
              disabled={m.role === "owner"}
              onValueChange={(role) => role && changeRole(m, role)}
              aria-label={`Role for ${m.name}`}
            >
              <SelectTrigger
                aria-label={`Role for ${m.name}`}
                className="hidden w-28 sm:flex"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem
                    key={r.value}
                    value={r.value}
                    disabled={r.value === "owner"}
                  >
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`More for ${m.name}`}
                    disabled={m.role === "owner"}
                  />
                }
              >
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {mobile && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Role</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={m.role}
                        onValueChange={(role) => changeRole(m, role)}
                      >
                        {ROLES.slice(1).map((r) => (
                          <DropdownMenuRadioItem key={r.value} value={r.value}>
                            {r.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}
                {m.pending && (
                  <DropdownMenuItem>Resend invite</DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => remove(m)}
                >
                  <Trash2Icon />
                  {m.pending ? "Revoke invite" : "Remove from workspace"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DeleteWorkspace({ workspace }: { workspace: string }) {
  const [typed, setTyped] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)
  const matches = typed.trim() === workspace
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <p className="font-medium">Delete this workspace</p>
        <p className="text-sm text-muted-foreground">
          Removes {workspace}, its projects and members. This can&apos;t be
          undone.
        </p>
      </div>
      <Dialog onOpenChange={() => setTyped("")}>
        <DialogTrigger render={<Button variant="destructive" />}>
          Delete workspace
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{workspace}”?</DialogTitle>
            <DialogDescription>
              All 24 projects, 4 members and every invoice record are deleted
              immediately. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="confirm-workspace">
              Type{" "}
              <span className="font-semibold text-foreground">{workspace}</span>{" "}
              to confirm
            </FieldLabel>
            <Input
              id="confirm-workspace"
              autoComplete="off"
              spellCheck={false}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
            <FieldDescription>
              The delete button unlocks once the name matches.
            </FieldDescription>
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              disabled={!matches}
              loading={deleting}
              onClick={async () => {
                setDeleting(true)
                await wait(900)
                setDeleting(false)
                toast.error(`${workspace} deleted (demo)`)
              }}
            >
              Delete workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function SettingsPage({
  workspace = "Acme",
  members = MEMBERS,
}: {
  workspace?: string
  members?: Member[]
}) {
  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Profile"
        description="How you appear to your team."
      >
        <ProfileForm />
      </SettingsSection>
      <SettingsSection
        title="Members"
        description="Who can access this workspace and what they can change."
      >
        <Members initial={members} />
      </SettingsSection>
      <SettingsSection
        title="Danger zone"
        description="Irreversible actions."
        tone="danger"
      >
        <DeleteWorkspace workspace={workspace} />
      </SettingsSection>
    </div>
  )
}
