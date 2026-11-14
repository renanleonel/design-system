"use client"

import * as React from "react"

import type {
  ChatAttachment,
  ChatMessage,
  ToolCall,
} from "@/components/blocks/ai-chat/ai-chat"

// Demo only: a deterministic, timer-driven stand-in for a model API. Each
// reply is a script played frame by frame: tool calls run one after another,
// then the text arrives a few words per tick.

export type ReplyScript = {
  toolCalls?: ToolCall[]
  content: string
  /** Fails after this many characters (the first time only; Retry succeeds). */
  failAt?: number
  error?: string
}

type Frame = Pick<ChatMessage, "toolCalls" | "content" | "status" | "error">

const TICK_MS = 40
const TOOL_TICKS = 14

function framesFor(
  script: ReplyScript,
  fail: boolean,
  reduce: boolean
): Frame[] {
  const frames: Frame[] = [{ content: "", toolCalls: [], status: "streaming" }]
  const calls = script.toolCalls ?? []
  for (let i = 0; i < calls.length; i++) {
    const running = [
      ...calls.slice(0, i),
      {
        ...calls[i],
        status: "running" as const,
        result: undefined,
        error: undefined,
      },
    ]
    for (let t = 0; t < TOOL_TICKS; t++)
      frames.push({ content: "", toolCalls: running, status: "streaming" })
  }
  // Reduced motion: whole lines instead of word by word, so text doesn't flicker.
  const tokens = reduce
    ? script.content.split(/(?<=\n)/)
    : script.content.split(/(?<=\s)/)
  const limit = fail ? (script.failAt ?? Infinity) : Infinity
  let content = ""
  for (let i = 0; i < tokens.length; i += reduce ? 1 : 3) {
    const next = content + tokens.slice(i, i + (reduce ? 1 : 3)).join("")
    if (next.length > limit) {
      frames.push({
        content,
        toolCalls: calls,
        status: "error",
        error:
          script.error ?? "The connection dropped. What arrived is kept above.",
      })
      return frames
    }
    content = next
    frames.push({ content, toolCalls: calls, status: "streaming" })
  }
  frames.push({ content, toolCalls: calls, status: "done" })
  return frames
}

export function useFakeChat({
  initial,
  scripts,
  initialStreaming = false,
  initialScripts = {},
}: {
  initial: ChatMessage[]
  scripts: ReplyScript[]
  initialStreaming?: boolean
  /** Scripts for messages already in `initial` (what Retry replays). */
  initialScripts?: Record<string, ReplyScript>
}) {
  const [messages, setMessages] = React.useState(initial)
  const [streaming, setStreaming] = React.useState(initialStreaming)
  const timer = React.useRef<number | undefined>(undefined)
  const sent = React.useRef(0)
  const [scriptOf] = React.useState(
    () => new Map<string, ReplyScript>(Object.entries(initialScripts))
  )
  const failed = React.useRef(new Set<string>())

  React.useEffect(() => () => window.clearInterval(timer.current), [])

  const update = (id: string, patch: Partial<ChatMessage>) =>
    setMessages((list) =>
      list.map((m) => (m.id === id ? { ...m, ...patch } : m))
    )

  const play = (id: string, script: ReplyScript) => {
    window.clearInterval(timer.current)
    const fail = script.failAt !== undefined && !failed.current.has(id)
    if (fail) failed.current.add(id)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const frames = framesFor(script, fail, reduce)
    let i = 0
    setStreaming(true)
    timer.current = window.setInterval(() => {
      const frame = frames[i++]
      update(id, frame)
      if (i >= frames.length) {
        window.clearInterval(timer.current)
        setStreaming(false)
      }
    }, TICK_MS)
  }

  const send = (text: string, attachments: ChatAttachment[]) => {
    const n = sent.current++
    const script = scripts[n % scripts.length]
    const id = `reply-${n}`
    scriptOf.set(id, script)
    setMessages((list) => [
      ...list,
      { id: `sent-${n}`, role: "user", content: text, attachments },
      { id, role: "assistant", content: "", status: "streaming" },
    ])
    play(id, script)
  }

  const stop = () => {
    window.clearInterval(timer.current)
    setStreaming(false)
    setMessages((list) =>
      list.map((m) =>
        m.status === "streaming"
          ? {
              ...m,
              status: "stopped",
              toolCalls: m.toolCalls?.map((c) =>
                c.status === "running"
                  ? {
                      ...c,
                      status: "error",
                      error: "Stopped before it finished.",
                    }
                  : c
              ),
            }
          : m
      )
    )
  }

  const retry = (id: string) => {
    const message = messages.find((m) => m.id === id)
    if (!message) return
    // Initial messages have no script: replay their own content.
    const script = scriptOf.get(id) ?? {
      content: message.content,
      toolCalls: message.toolCalls?.map((c) =>
        c.status === "running" ? { ...c, status: "done" as const } : c
      ),
    }
    scriptOf.set(id, script)
    failed.current.add(id)
    update(id, {
      content: "",
      toolCalls: [],
      status: "streaming",
      error: undefined,
      feedback: null,
    })
    play(id, script)
  }

  const feedback = (id: string, value: "up" | "down" | null) =>
    update(id, { feedback: value })

  const reset = () => {
    window.clearInterval(timer.current)
    setStreaming(false)
    setMessages([])
  }

  return { messages, streaming, send, stop, retry, feedback, reset }
}
