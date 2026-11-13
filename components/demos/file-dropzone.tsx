"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { FileDropzone } from "@/components/ui/file-dropzone"

/** Drop a file bigger than 2 MB or one that isn't an image or PDF to see the rejection. */
export function Default() {
  return (
    <Field className="max-w-md">
      <FieldLabel htmlFor="dropzone">Attachments</FieldLabel>
      <FileDropzone
        id="dropzone"
        accept="image/*,.pdf"
        maxSize={2 * 1024 * 1024}
        maxFiles={3}
        hint="Images or PDF, up to 2 MB each, 3 files max"
      />
    </Field>
  )
}

export function Single() {
  return (
    <FileDropzone
      multiple={false}
      accept=".csv"
      hint="One CSV file"
      className="max-w-md"
    />
  )
}
