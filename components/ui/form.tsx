"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "cn"
import { CircleAlertIcon } from "lucide-react"
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form"
import type { z } from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { SettingsRow } from "@/components/ui/settings-list"

/**
 * `useForm` with a zod schema and the validation timing from interaction.md:
 * nothing on the first keystroke, a field validates when the user leaves it
 * (or on submit), then live while it's invalid so the error clears as they fix it.
 */
function useZodForm<Schema extends z.ZodType<FieldValues, FieldValues>>(
  schema: Schema,
  options?: Omit<
    UseFormProps<z.input<Schema>, unknown, z.output<Schema>>,
    "resolver"
  >
) {
  return useForm<z.input<Schema>, unknown, z.output<Schema>>({
    // zodResolver can't infer input/output through the generic schema.
    resolver: zodResolver(schema) as unknown as Resolver<
      z.input<Schema>,
      unknown,
      z.output<Schema>
    >,
    mode: "onTouched",
    ...options,
  })
}

/**
 * A real `<form>` (autofill and password managers keep working) that:
 * - ignores a second submit while one is in flight (Enter + click);
 * - focuses the first invalid field on a failed submit (react-hook-form);
 * - turns a thrown error into a form-level banner (`FormBanner`), keeping input.
 */
function Form<TValues extends FieldValues, TOutput = TValues>({
  form,
  onSubmit,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  form: UseFormReturn<TValues, unknown, TOutput>
  onSubmit: (values: TOutput) => unknown
}) {
  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error && error.message
            ? error.message
            : "Something went wrong. Your changes are still here, try again.",
      })
    }
  })

  return (
    <FormProvider {...form}>
      <form
        noValidate
        data-slot="form"
        className={cn("grid grid-cols-[minmax(0,1fr)] gap-6", className)}
        onSubmit={(event) => {
          if (form.formState.isSubmitting) {
            event.preventDefault()
            return
          }
          void submit(event)
        }}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  )
}

type FieldControlProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = ControllerRenderProps<TValues, TName> & {
  id: string
  "aria-invalid"?: true
  "aria-describedby"?: string
  required?: boolean
}

/**
 * One field: visible label, the control, helper text and the error, wired
 * for screen readers (`id`, `aria-invalid`, `aria-describedby`). `render`
 * receives everything to spread on the control.
 *
 *   <FormField name="email" label="Email" render={(field) => (
 *     <Input type="email" autoComplete="email" {...field} />
 *   )} />
 */
function FormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({
  name,
  label,
  description,
  required,
  orientation,
  layout,
  badge,
  className,
  hideError = false,
  describedBy: extraDescribedBy,
  render,
}: {
  name: TName
  label?: React.ReactNode
  description?: React.ReactNode
  /** Adds the visible required marker; pair with the schema rule. */
  required?: boolean
  orientation?: React.ComponentProps<typeof Field>["orientation"]
  /** `row`: a `SettingsRow` (title and description beside the control). */
  layout?: "row"
  /** Beside the title in `layout="row"`. */
  badge?: React.ReactNode
  className?: string
  /**
   * Skip the error line when something else already shows the problem (e.g. a
   * password requirements list that turns red); point to it with `describedBy`.
   */
  hideError?: boolean
  /** Extra id(s) for aria-describedby, such as a requirements list. */
  describedBy?: string
  render: (field: FieldControlProps<TValues, TName>) => React.ReactNode
}) {
  const { control } = useFormContext<TValues>()
  const id = React.useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const descriptionId = `${id}-description`
        const errorId = `${id}-error`
        const describedBy =
          [
            description && descriptionId,
            extraDescribedBy,
            fieldState.error && !hideError && errorId,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        const labelNode = label && (
          <FieldLabel htmlFor={id}>
            {label}
            {required && (
              <span aria-hidden className="text-destructive">
                *
              </span>
            )}
          </FieldLabel>
        )
        const controlNode = render({
          ...field,
          id,
          required,
          "aria-invalid": fieldState.invalid || undefined,
          "aria-describedby": describedBy,
        })
        const descriptionNode = description && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )
        const errorNode = !hideError && (
          <FieldError id={errorId} errors={[fieldState.error]} />
        )

        if (layout === "row") {
          return (
            <SettingsRow
              label={
                <>
                  {label}
                  {required && (
                    <span aria-hidden className="ms-1 text-destructive">
                      *
                    </span>
                  )}
                </>
              }
              badge={badge}
              description={description}
              htmlFor={id}
              descriptionId={descriptionId}
              className={className}
            >
              <div
                data-invalid={fieldState.invalid || undefined}
                className="grid w-full gap-2"
              >
                {controlNode}
                {errorNode}
              </div>
            </SettingsRow>
          )
        }

        // Horizontal (checkbox, switch): control first, then label, description
        // and error stacked beside it, so the error sits under its label.
        if (orientation === "horizontal") {
          return (
            <Field
              data-invalid={fieldState.invalid || undefined}
              orientation="horizontal"
              className={className}
            >
              {controlNode}
              <FieldContent>
                {labelNode}
                {descriptionNode}
                {errorNode}
              </FieldContent>
            </Field>
          )
        }

        return (
          <Field
            data-invalid={fieldState.invalid || undefined}
            orientation={orientation}
            className={className}
          >
            {labelNode}
            {controlNode}
            {descriptionNode}
            {errorNode}
          </Field>
        )
      }}
    />
  )
}

/** Form-level failure (network, server): a banner at the top, never a toast. */
function FormBanner({ className }: { className?: string }) {
  const { formState } = useFormContext()
  const message = formState.errors.root?.message
  if (!message) return null
  return (
    <Alert variant="destructive" role="alert" className={className}>
      <CircleAlertIcon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

/**
 * Submit button: never disabled while the form is invalid (users couldn't tell
 * why); busy with a spinner once the request starts.
 */
function FormSubmit({
  children = "Save",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { formState } = useFormContext()
  return (
    <Button type="submit" loading={formState.isSubmitting} {...props}>
      {children}
    </Button>
  )
}

export { Form, FormBanner, FormField, FormSubmit, useZodForm }
