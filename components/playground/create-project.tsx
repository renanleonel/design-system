"use client"

import { toast } from "sonner"
import { z } from "zod"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormBanner,
  FormField,
  FormSubmit,
  useZodForm,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const PLANS = [
  { label: "Hobby", value: "hobby" },
  { label: "Pro", value: "pro" },
  { label: "Enterprise", value: "enterprise" },
]

const TAGS = [
  "Analytics",
  "Billing",
  "Design",
  "Growth",
  "Infrastructure",
  "Marketing",
  "Mobile",
  "Onboarding",
  "Security",
].map((label) => ({ label, value: label.toLowerCase() }))

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name needs at least 2 characters")
    .max(60, "Keep the name under 60 characters"),
  email: z.email("Enter an email like name@company.com"),
  plan: z.enum(["hobby", "pro", "enterprise"]),
  tags: z.array(z.string()).max(3, "Pick up to 3 tags"),
  notes: z.string().max(280, "Keep notes under 280 characters"),
  updates: z.boolean(),
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function CreateProjectCard() {
  const form = useZodForm(schema, {
    defaultValues: {
      name: "",
      email: "",
      plan: "pro",
      tags: [],
      notes: "",
      updates: true,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>
          Validates on blur, then live. Name it &ldquo;error&rdquo; to see a
          server failure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={async (values) => {
            await wait(1200)
            if (values.name.toLowerCase() === "error") {
              throw new Error(
                "We couldn't reach the server. Try again in a moment."
              )
            }
            toast.success(`Created “${values.name}”`)
            form.reset()
          }}
        >
          <FormBanner />
          <FormField
            name="name"
            label="Name"
            required
            description="Shown to everyone on your team."
            render={(field) => (
              <Input
                placeholder="Acme dashboard"
                autoComplete="off"
                {...field}
              />
            )}
          />
          <FormField
            name="email"
            label="Owner email"
            required
            render={(field) => (
              <Input
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="name@company.com"
                {...field}
              />
            )}
          />
          <FormField
            name="plan"
            label="Plan"
            render={({ value, onChange, id, ...field }) => (
              <Select
                items={PLANS}
                value={value}
                onValueChange={onChange}
                id={id}
              >
                <SelectTrigger id={id} className="w-full" {...field}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormField
            name="tags"
            label="Tags"
            description="Up to 3. Type to filter."
            render={({ value, onChange, ...field }) => (
              <MultiSelect
                options={TAGS}
                value={value}
                onValueChange={onChange}
                placeholder="Add tags…"
                {...field}
              />
            )}
          />
          <FormField
            name="notes"
            label="Notes"
            render={(field) => (
              <Textarea
                placeholder="Anything the team should know"
                {...field}
              />
            )}
          />
          <FormField
            name="updates"
            label="Send me product updates"
            orientation="horizontal"
            render={({ value, onChange, ...field }) => (
              <Checkbox checked={value} onCheckedChange={onChange} {...field} />
            )}
          />
          <div className="flex justify-end">
            <FormSubmit hotkey="Mod+Enter" showHotkey>
              Create project
            </FormSubmit>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}
