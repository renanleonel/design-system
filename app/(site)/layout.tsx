import { DocsFooter } from "@/components/docs/docs-footer"
import { SiteHeader } from "@/components/docs/site-header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getNav, GITHUB_URL } from "@/lib/docs"

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <SiteHeader nav={getNav()} githubUrl={GITHUB_URL} />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <DocsFooter githubUrl={GITHUB_URL} />
      </div>
    </TooltipProvider>
  )
}
