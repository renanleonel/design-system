import type { Metadata } from "next"

import { BlockFrame } from "@/components/docs/block-frame"
import { CodeBlock } from "@/components/docs/code-block"
import { InstallCommand } from "@/components/docs/install-command"
import {
  getBlocks,
  installCommand,
  readSource,
  registryItem,
} from "@/lib/docs"

export const metadata: Metadata = { title: "Blocks" }

export default function BlocksPage() {
  const blocks = getBlocks()
  // Variants of one registry item (the auth screens) show its source once.
  const firstOf = new Map<string, string>()
  for (const b of blocks) if (!firstOf.has(b.registry)) firstOf.set(b.registry, b.id)
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-16 px-4 py-10 md:px-6">
      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Blocks
        </h1>
        <p className="text-muted-foreground">
          Full screens built only from renanleonel/ui components. They are
          router-agnostic and keep shareable state in the URL. Install one and
          wire your data in.
        </p>
      </header>
      {blocks.map((block) => {
        const owner = firstOf.get(block.registry)
        const files =
          owner === block.id
            ? (registryItem(block.registry)?.files ?? []).map((f) => ({
                path: f.path,
                code: <CodeBlock code={readSource(f.path)} title={f.path} />,
              }))
            : [
                {
                  path: "",
                  code: (
                    <p className="rounded-xl px-4 py-6 text-sm text-muted-foreground shadow-border">
                      Same source as{" "}
                      <a href={`#${owner}`} className="font-medium text-foreground underline underline-offset-4">
                        {blocks.find((b) => b.id === owner)?.title}
                      </a>
                      .
                    </p>
                  ),
                },
              ]
        return (
          <section
            key={block.id}
            id={block.id}
            className="flex scroll-mt-20 flex-col gap-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {block.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {block.description}
                </p>
              </div>
              <div className="w-full lg:max-w-xl">
                <InstallCommand command={installCommand(block.registry)} />
              </div>
            </div>
            <BlockFrame
              title={block.title}
              src={block.src}
              variants={"variants" in block ? block.variants : undefined}
              files={files}
            />
          </section>
        )
      })}
    </div>
  )
}
