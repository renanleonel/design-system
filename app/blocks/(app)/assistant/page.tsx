"use client"

import * as React from "react"
import { SquarePenIcon } from "lucide-react"

import {
  AiChat,
  type ChatAttachment,
  type ChatMessage,
} from "@/components/blocks/ai-chat/ai-chat"
import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "@/hooks/use-url-state"

import {
  DEFAULT_MESSAGES,
  ERROR_MESSAGES,
  ERROR_SCRIPTS,
  MANY_MESSAGES,
  ONE_MESSAGES,
  SCRIPTS,
  STREAMING_MESSAGES,
  STREAMING_SCRIPTS,
  SUGGESTIONS,
  WORST_ATTACHMENTS,
  WORST_DRAFT,
  WORST_MESSAGES,
} from "./fixtures"
import { useFakeChat, type ReplyScript } from "./use-fake-chat"

// `?data=` picks the fixture (docs/WORKFLOWS.md → Stress-test). Full-height
// page, so the demo control is hidden and the URL is the switch.
type Fixture = {
  messages: ChatMessage[]
  streaming?: boolean
  scripts?: Record<string, ReplyScript>
  draft?: string
  attachments?: ChatAttachment[]
  loadError?: string
}

const FIXTURES: Record<string, Fixture> = {
  default: { messages: DEFAULT_MESSAGES },
  empty: { messages: [] },
  one: { messages: ONE_MESSAGES },
  many: { messages: MANY_MESSAGES },
  worst: {
    messages: WORST_MESSAGES,
    draft: WORST_DRAFT,
    attachments: WORST_ATTACHMENTS,
  },
  streaming: {
    messages: STREAMING_MESSAGES,
    streaming: true,
    scripts: STREAMING_SCRIPTS,
  },
  error: { messages: ERROR_MESSAGES, scripts: ERROR_SCRIPTS },
  "load-error": {
    messages: [],
    loadError: "The server didn't answer. Your messages are safe.",
  },
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

function Assistant({ fixture }: { fixture: Fixture }) {
  const chat = useFakeChat({
    initial: fixture.messages,
    scripts: SCRIPTS,
    initialStreaming: fixture.streaming,
    initialScripts: fixture.scripts,
  })
  const [loadError, setLoadError] = React.useState(fixture.loadError)
  const picked = React.useRef(0)
  return (
    <>
      <AppShellHeader
        title="Assistant"
        description="Ask about deploys, billing and your team"
        actions={
          <Button
            variant="outline"
            disabled={!chat.messages.length && !loadError}
            onClick={() => {
              chat.reset()
              setLoadError(undefined)
            }}
          >
            <SquarePenIcon data-icon="inline-start" />
            New chat
          </Button>
        }
      />
      <AppShellContent fill className="gap-0 p-0 md:p-0">
        <AiChat
          messages={chat.messages}
          streaming={chat.streaming}
          onSend={chat.send}
          onStop={chat.stop}
          onRetry={chat.retry}
          onFeedback={chat.feedback}
          onAttach={(files) =>
            files.map((file) => ({
              id: `file-${picked.current++}`,
              name: file.name,
              size: formatSize(file.size),
            }))
          }
          suggestions={SUGGESTIONS}
          loadError={loadError}
          onReload={() => setLoadError(undefined)}
          defaultDraft={fixture.draft}
          defaultAttachments={fixture.attachments}
        />
      </AppShellContent>
    </>
  )
}

export default function Page() {
  const data = useSearchParams().get("data") ?? "default"
  return <Assistant key={data} fixture={FIXTURES[data] ?? FIXTURES.default} />
}
