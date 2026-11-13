"use client"

import { toast } from "sonner"
import { z } from "zod"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormBanner,
  FormField,
  FormSubmit,
  useZodForm,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters"),
  email: z.email("Enter an email like name@company.com"),
  updates: z.boolean(),
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Validates on blur, then live. Name it "error" to see a server failure. */
export function Default() {
  const form = useZodForm(schema, {
    defaultValues: { name: "", email: "", updates: true },
  })
  return (
    <Form
      form={form}
      className="w-full max-w-sm"
      onSubmit={async (values) => {
        await wait(1000)
        if (values.name.toLowerCase() === "error")
          throw new Error("We couldn't reach the server. Try again in a moment.")
        toast.success(`Invited ${values.name}`)
        form.reset()
      }}
    >
      <FormBanner />
      <FormField
        name="name"
        label="Name"
        required
        render={(field) => <Input placeholder="Ada Lovelace" {...field} />}
      />
      <FormField
        name="email"
        label="Email"
        required
        render={(field) => (
          <Input
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            {...field}
          />
        )}
      />
      <FormField
        name="updates"
        label="Send product updates"
        orientation="horizontal"
        render={({ value, onChange, ...field }) => (
          <Checkbox checked={value} onCheckedChange={onChange} {...field} />
        )}
      />
      <FormSubmit hotkey="Mod+Enter" showHotkey className="self-end">
        Send invite
      </FormSubmit>
    </Form>
  )
}
