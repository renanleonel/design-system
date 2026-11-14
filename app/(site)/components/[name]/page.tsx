import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { CodeBlock } from "@/components/docs/code-block"
import { InstallCommand } from "@/components/docs/install-command"
import { PreviewTabs } from "@/components/docs/preview-tabs"
import { DemoStory } from "@/components/demos"
import {
  getComponents,
  getStories,
  importLine,
  installCommand,
  registryItem,
  type Story,
} from "@/lib/docs"

export function generateStaticParams() {
  return getComponents().map((c) => ({ name: c.name }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: PageProps<"/components/[name]">): Promise<Metadata> {
  const { name } = await params
  const entry = getComponents().find((c) => c.name === name)
  return { title: entry?.title ?? name, description: entry?.description }
}

/** `code` spans in catalog notes. */
function Inline({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith("`") ? (
      <code
        // Segments of a static string; they never reorder.
        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
        key={i}
        className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8125rem]"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    )
  )
}

function StoryView({ name, story }: { name: string; story: Story }) {
  return (
    <PreviewTabs
      preview={<DemoStory name={name} story={story.id} />}
      code={<CodeBlock code={story.code} />}
    />
  )
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-20 font-heading text-xl font-semibold tracking-tight"
    >
      {children}
    </h2>
  )
}

export default async function ComponentPage({
  params,
}: PageProps<"/components/[name]">) {
  const { name } = await params
  const components = getComponents()
  const index = components.findIndex((c) => c.name === name)
  if (index === -1) notFound()
  const entry = components[index]
  const [main, ...examples] = getStories(name)
  const deps = (registryItem(name)?.registryDependencies ?? [])
    .map((url) => url.split("/").pop()!.replace(/\.json$/, ""))
    .map((dep) => components.find((c) => c.name === dep))
    .filter((c) => c !== undefined)
  const prev = components[index - 1]
  const next = components[index + 1]

  const toc = [
    { id: "installation", title: "Installation" },
    { id: "usage", title: "Usage" },
    ...(examples.length ? [{ id: "examples", title: "Examples" }] : []),
    ...examples.map((s) => ({ id: s.id, title: s.title, nested: true })),
    ...(entry.notes.length ? [{ id: "notes", title: "Notes" }] : []),
  ]

  return (
    <div className="flex gap-12">
      <article className="flex min-w-0 max-w-3xl flex-1 flex-col gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/components" className="hover:text-foreground">
              Components
            </Link>{" "}
            / {entry.group}
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {entry.title}
          </h1>
          <p className="text-lg text-muted-foreground">{entry.description}</p>
        </header>

        {main && <StoryView name={name} story={main} />}

        <section className="flex flex-col gap-4">
          <SectionHeading id="installation">Installation</SectionHeading>
          <InstallCommand command={installCommand(name)} />
          {deps.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Also installs{" "}
              {deps.map((dep, i) => (
                <span key={dep.name}>
                  {i > 0 && ", "}
                  <Link
                    href={dep.href}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {dep.title}
                  </Link>
                </span>
              ))}
              .
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading id="usage">Usage</SectionHeading>
          <CodeBlock code={importLine(name)} />
        </section>

        {examples.length > 0 && (
          <section className="flex flex-col gap-8">
            <SectionHeading id="examples">Examples</SectionHeading>
            {examples.map((story) => (
              <div key={story.id} className="flex flex-col gap-3">
                <h3
                  id={story.id}
                  className="scroll-mt-20 font-heading text-base font-medium"
                >
                  {story.title}
                </h3>
                {story.description && (
                  <p className="-mt-1 text-sm text-muted-foreground">
                    {story.description}
                  </p>
                )}
                <StoryView name={name} story={story} />
              </div>
            ))}
          </section>
        )}

        {entry.notes.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionHeading id="notes">Notes</SectionHeading>
            <ul className="flex list-disc flex-col gap-2 ps-5 text-sm leading-relaxed text-muted-foreground marker:text-border">
              {entry.notes.map((note) => (
                <li key={note}>
                  <Inline text={note} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav
          aria-label="Pagination"
          className="mt-4 flex items-center justify-between gap-4 border-t pt-6"
        >
          {prev ? (
            <Link
              href={prev.href}
              className="flex items-center gap-2 rounded-md text-sm text-muted-foreground focus-ring hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" /> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={next.href}
              className="flex items-center gap-2 rounded-md text-sm text-muted-foreground focus-ring hover:text-foreground"
            >
              {next.title} <ArrowRightIcon className="size-4" />
            </Link>
          )}
        </nav>
      </article>

      <aside className="sticky top-22 hidden h-fit w-48 shrink-0 xl:block">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          On this page
        </p>
        <ul className="flex flex-col gap-1.5 text-sm">
          {toc.map((item) => (
            <li key={item.id} className={"nested" in item ? "ps-3" : undefined}>
              <a
                href={`#${item.id}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
