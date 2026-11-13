import { DemoFooter } from "@/components/playground/demo-footer"
import { Toaster } from "@/components/ui/sonner"

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main className="flex flex-1 items-center justify-center px-6 py-24 text-center">
        <p className="max-w-sm text-muted-foreground">
          Page content. The footer below reflows with its container: try the
          tablet and phone widths.
        </p>
      </main>
      <DemoFooter />
      <Toaster />
    </div>
  )
}
