import { DocsNav } from "@/components/docs/docs-nav"
import { getNav } from "@/lib/docs"

export default function ComponentsLayout({
  children,
}: LayoutProps<"/components">) {
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-1 px-4 md:px-6">
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto overscroll-contain [scrollbar-width:thin] py-8 pe-4 md:block">
        <DocsNav groups={getNav()} />
      </aside>
      <div className="min-w-0 flex-1 py-8 md:ps-8 lg:ps-12">{children}</div>
    </div>
  )
}
