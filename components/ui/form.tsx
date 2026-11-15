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
  required?: boolean
  orientation?: React.ComponentProps<typeof Field>["orientation"]
  layout?: "row"
  badge?: React.ReactNode
  className?: string
  /** Skip the error line when something else already shows the problem; point to it with `describedBy`. */
  hideError?: boolean
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
              <span aria-hidden className="-ms-1.5 text-destructive">
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
                    <span aria-hidden className="ms-0.5 text-destructive">
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

/** Never disabled while the form is invalid: users couldn't tell why. */
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
