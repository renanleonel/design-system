"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleAlertIcon,
  FileTextIcon,
  PaperclipIcon,
  RotateCcwIcon,
  SparklesIcon,
  SquareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { ErrorState } from "@/components/ui/error-state"
import { IconTile } from "@/components/ui/icon-tile"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Markdown } from "./markdown"
import { ToolCallList, type ToolCall } from "./tool-call"

export type { ToolCall, ToolCallStatus } from "./tool-call"

export type ChatAttachment = {
  id: string
  name: string
  /** Already formatted: "2.4 MB". */
  size?: string
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  /** Plain text for the user; a Markdown subset for the assistant. */
  content: string
  attachments?: ChatAttachment[]
  toolCalls?: ToolCall[]
  status?: "streaming" | "done" | "stopped" | "error"
  error?: string
  feedback?: "up" | "down" | null
}

export type ChatSuggestion = {
  title: string
  description?: string
  /** Text put in the composer (not sent): the user can edit it first. */
  prompt: string
}

export type AiChatProps = {
  messages: ChatMessage[]
  streaming?: boolean
  onSend: (text: string, attachments: ChatAttachment[]) => void
  onStop?: () => void
  onRetry?: (messageId: string) => void
  onFeedback?: (messageId: string, value: "up" | "down" | null) => void
  /** Maps picked files to chips. Omit to hide the attach button. */
  onAttach?: (files: File[]) => ChatAttachment[]
  suggestions?: ChatSuggestion[]
  loadError?: string
  onReload?: () => void
  disabledReason?: string
  placeholder?: string
  defaultDraft?: string
  defaultAttachments?: ChatAttachment[]
  className?: string
}

// How close to the bottom still counts as "following" the stream.
const STICK_THRESHOLD = 48

function useStickToBottom(active: boolean) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const stuck = React.useRef(true)
  const [atBottom, setAtBottom] = React.useState(true)

  React.useEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    let lastTop = viewport.scrollTop
    // Only a move *up* lets go: content growing below (or a sub-pixel scroll
    // event racing it) never unpins, and a smooth jump down never does either.
    const onScroll = () => {
      const top = viewport.scrollTop
      const distance = viewport.scrollHeight - top - viewport.clientHeight
      if (distance <= STICK_THRESHOLD) stuck.current = true
      else if (top < lastTop - 1) stuck.current = false
      lastTop = top
      setAtBottom(stuck.current)
    }
    const follow = () => {
      if (stuck.current) viewport.scrollTop = viewport.scrollHeight
      lastTop = viewport.scrollTop
    }
    const observer = new ResizeObserver(follow)
    observer.observe(content)
    observer.observe(viewport)
    viewport.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      observer.disconnect()
      viewport.removeEventListener("scroll", onScroll)
    }
  }, [active])

  const scrollToBottom = React.useCallback((smooth = false) => {
    const viewport = viewportRef.current
    if (!viewport) return
    stuck.current = true
    setAtBottom(true)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: smooth && !reduce ? "smooth" : "instant",
    })
  }, [])

  return { viewportRef, contentRef, atBottom, scrollToBottom }
}

function IconAction({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string
  onClick: () => void
  pressed?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
            className="text-muted-foreground aria-pressed:text-foreground"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: ChatAttachment
  onRemove?: () => void
}) {
  return (
    <span
      data-slot="chat-attachment"
      title={attachment.name}
      className={cn(
        "inline-flex h-8 max-w-60 min-w-0 items-center gap-2 rounded-lg bg-muted ps-2 text-xs",
        onRemove ? "pe-0.5" : "pe-2.5"
      )}
    >
      <FileTextIcon
        aria-hidden
        className="size-3.5 shrink-0 text-muted-foreground"
      />
      <span className="min-w-0 truncate font-medium">{attachment.name}</span>
      {attachment.size && (
        <span className="shrink-0 text-muted-foreground tabular-nums">
          {attachment.size}
        </span>
      )}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Remove ${attachment.name}`}
          onClick={onRemove}
          className="text-muted-foreground"
        >
          <XIcon />
        </Button>
      )}
    </span>
  )
}

function Caret() {
  return (
    <span
      aria-hidden
      data-slot="chat-caret"
      className="ms-0.5 inline-block h-[1.1em] w-1.5 translate-y-[0.15em] rounded-xs bg-foreground"
    />
  )
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <article
      aria-label="You"
      data-slot="chat-message"
      data-role="user"
      className="group/message flex flex-col items-end gap-1.5"
    >
      {message.attachments?.length ? (
        <div className="flex max-w-full flex-wrap justify-end gap-1.5">
          {message.attachments.map((a) => (
            <AttachmentChip key={a.id} attachment={a} />
          ))}
        </div>
      ) : null}
      {message.content && (
        // Copy sits beside the bubble (revealed on hover/focus, always on
        // touch), so it adds no height between turns.
        <div className="flex w-full items-start justify-end gap-1">
          <div className="mt-1 flex opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100 pointer-coarse:opacity-100">
            <CopyButton
              value={message.content}
              label="Copy message"
              size="icon-xs"
            />
          </div>
          <div
            dir="auto"
            className="max-w-[85%] min-w-0 rounded-2xl bg-muted px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap"
          >
            {message.content}
          </div>
        </div>
      )}
    </article>
  )
}

function AssistantError({
  message,
  onRetry,
}: {
  message: ChatMessage
  onRetry?: (id: string) => void
}) {
  return (
    <Alert tone="red">
      <CircleAlertIcon />
      <AlertTitle>The response stopped</AlertTitle>
      <AlertDescription>
        {message.error ?? "Something went wrong. What arrived is kept above."}
      </AlertDescription>
      {onRetry && (
        <AlertAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRetry(message.id)}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Retry
          </Button>
        </AlertAction>
      )}
    </Alert>
  )
}

function FeedbackActions({
  message,
  onFeedback,
}: {
  message: ChatMessage
  onFeedback: (id: string, value: "up" | "down" | null) => void
}) {
  const { id, feedback } = message
  return (
    <>
      <IconAction
        label="Good response"
        pressed={feedback === "up"}
        onClick={() => onFeedback(id, feedback === "up" ? null : "up")}
      >
        <ThumbsUpIcon className={cn(feedback === "up" && "fill-current")} />
      </IconAction>
      <IconAction
        label="Bad response"
        pressed={feedback === "down"}
        onClick={() => onFeedback(id, feedback === "down" ? null : "down")}
      >
        <ThumbsDownIcon className={cn(feedback === "down" && "fill-current")} />
      </IconAction>
    </>
  )
}

function AssistantActions({
  message,
  last,
  onRetry,
  onFeedback,
}: {
  message: ChatMessage
  last: boolean
  onRetry?: (id: string) => void
  onFeedback?: (id: string, value: "up" | "down" | null) => void
}) {
  return (
    <div
      className={cn(
        "-ms-1 flex items-center gap-0.5",
        !last &&
          "opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100 pointer-coarse:opacity-100"
      )}
    >
      {message.content && (
        <CopyButton
          value={message.content}
          label="Copy response"
          size="icon-xs"
        />
      )}
      {last && onRetry && (
        <IconAction label="Regenerate" onClick={() => onRetry(message.id)}>
          <RotateCcwIcon />
        </IconAction>
      )}
      {onFeedback && message.status === "done" && (
        <FeedbackActions message={message} onFeedback={onFeedback} />
      )}
    </div>
  )
}

function AssistantMessage({
  message,
  last,
  onRetry,
  onFeedback,
}: {
  message: ChatMessage
  last: boolean
  onRetry?: (id: string) => void
  onFeedback?: (id: string, value: "up" | "down" | null) => void
}) {
  const status = message.status ?? "done"
  const streaming = status === "streaming"
  const calls = message.toolCalls ?? []
  const thinking =
    streaming && !message.content && !calls.some((c) => c.status === "running")
  return (
    <article
      aria-label="Assistant"
      aria-busy={streaming || undefined}
      data-slot="chat-message"
      data-role="assistant"
      data-status={status}
      className="group/message flex flex-col gap-3"
    >
      {calls.length > 0 && <ToolCallList calls={calls} />}
      {thinking && (
        <p className="flex h-6 items-center gap-2 text-sm text-muted-foreground">
          <Spinner
            role={undefined}
            aria-label={undefined}
            className="size-3.5"
          />
          Thinking
        </p>
      )}
      {message.content && (
        <div
          data-streaming={streaming || undefined}
          className="min-w-0 text-sm leading-relaxed"
        >
          <Markdown
            content={message.content}
            caret={streaming ? <Caret /> : null}
          />
        </div>
      )}
      {status === "error" && (
        <AssistantError message={message} onRetry={onRetry} />
      )}
      {status === "stopped" && (
        <p className="text-xs text-muted-foreground">Stopped</p>
      )}
      {!streaming && status !== "error" && (
        <AssistantActions
          message={message}
          last={last}
          onRetry={onRetry}
          onFeedback={onFeedback}
        />
      )}
    </article>
  )
}

function Suggestions({
  suggestions,
  onPick,
}: {
  suggestions: ChatSuggestion[]
  onPick: (prompt: string) => void
}) {
  return (
    <ul className="grid w-full grid-cols-[minmax(0,1fr)] gap-2 @xl/chat:grid-cols-2">
      {suggestions.map((s) => (
        <li key={s.title} className="flex">
          <button
            type="button"
            onClick={() => onPick(s.prompt)}
            className="flex w-full motion-press flex-col items-start gap-0.5 rounded-xl bg-card px-3.5 py-3 text-start shadow-border focus-ring outline-none hover:shadow-border-hover"
          >
            <span className="text-sm font-medium">{s.title}</span>
            {s.description && (
              <span className="text-sm text-muted-foreground">
                {s.description}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}

function EmptyState({
  suggestions,
  onPick,
}: {
  suggestions: ChatSuggestion[]
  onPick: (prompt: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-8 text-center">
        <IconTile size="lg">
          <SparklesIcon />
        </IconTile>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium tracking-tight">
            What can I help with?
          </h2>
          <p className="text-sm text-muted-foreground">
            Ask about your workspace, or start from one of these.
          </p>
        </div>
        {suggestions.length > 0 && (
          <Suggestions suggestions={suggestions} onPick={onPick} />
        )}
      </div>
    </div>
  )
}

function MessageList({
  messages,
  streaming,
  onRetry,
  onFeedback,
  stick: { viewportRef, contentRef, atBottom, scrollToBottom },
}: Pick<AiChatProps, "messages" | "onRetry" | "onFeedback"> & {
  streaming: boolean
  stick: ReturnType<typeof useStickToBottom>
}) {
  const lastId = messages.at(-1)?.id

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <ScrollArea
        className="min-h-0 flex-1"
        viewportProps={{
          ref: viewportRef,
          "aria-label": "Conversation",
          className: "overscroll-contain",
        }}
      >
        <div
          ref={contentRef}
          className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pt-6 pb-4 md:px-6"
        >
          {messages.map((m) =>
            m.role === "user" ? (
              <UserMessage key={m.id} message={m} />
            ) : (
              <AssistantMessage
                key={m.id}
                message={m}
                last={m.id === lastId}
                onRetry={streaming ? undefined : onRetry}
                onFeedback={onFeedback}
              />
            )
          )}
        </div>
      </ScrollArea>
      {/* Out of the tab order and the a11y tree while you're at the bottom. */}
      <div
        inert={atBottom}
        className={cn(
          "absolute inset-x-0 bottom-3 flex justify-center transition-[opacity,translate] duration-(--ds-duration-popover) ease-out motion-reduce:translate-y-0",
          atBottom
            ? "pointer-events-none translate-y-1 opacity-0"
            : "opacity-100"
        )}
      >
        <Button
          variant="surface"
          size="sm"
          className="rounded-full"
          onClick={() => scrollToBottom(true)}
        >
          <ArrowDownIcon data-icon="inline-start" />
          Jump to latest
        </Button>
      </div>
    </div>
  )
}

function ComposerActions({
  onAttachClick,
  disabled,
  canSend,
  streaming,
  onStop,
}: {
  onAttachClick?: () => void
  disabled: boolean
  canSend: boolean
  streaming: boolean
  onStop?: () => void
}) {
  return (
    <InputGroupAddon align="block-end" className="gap-2 px-2 pb-2">
      {onAttachClick && (
        <Tooltip>
          <TooltipTrigger
            render={
              <InputGroupButton
                size="icon-sm"
                aria-label="Attach files"
                disabled={disabled}
                onClick={onAttachClick}
              />
            }
          >
            <PaperclipIcon />
          </TooltipTrigger>
          <TooltipContent>Attach files</TooltipContent>
        </Tooltip>
      )}
      <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted-foreground @max-lg/chat:invisible pointer-coarse:invisible">
        {disabled ? "" : "Enter to send · Shift+Enter for a new line"}
      </span>
      {streaming ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <InputGroupButton
                variant="default"
                size="icon-sm"
                aria-label="Stop generating"
                onClick={onStop}
                className="rounded-full"
              />
            }
          >
            <SquareIcon className="size-3! fill-current" />
          </TooltipTrigger>
          <TooltipContent>Stop generating</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger
            render={
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                aria-label="Send message"
                // aria-disabled, not disabled: a disabled control dims
                // the whole InputGroup (`has-disabled:opacity-50`).
                aria-disabled={!canSend || undefined}
                className="rounded-full aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-primary"
              />
            }
          >
            <ArrowUpIcon />
          </TooltipTrigger>
          <TooltipContent>Send message</TooltipContent>
        </Tooltip>
      )}
    </InputGroupAddon>
  )
}

function Composer({
  draft,
  onDraftChange,
  attachments,
  onAttachmentsChange,
  textareaRef,
  canSend,
  streaming,
  disabledReason,
  placeholder,
  onSend,
  onStop,
  onAttach,
}: {
  draft: string
  onDraftChange: (value: string) => void
  attachments: ChatAttachment[]
  onAttachmentsChange: React.Dispatch<React.SetStateAction<ChatAttachment[]>>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  canSend: boolean
  streaming: boolean
  disabledReason?: string
  placeholder: string
  onSend: () => void
  onStop?: () => void
  onAttach?: (files: File[]) => ChatAttachment[]
}) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const disabled = Boolean(disabledReason)

  return (
    <form
      className="mx-auto w-full max-w-3xl px-4 pb-4 md:px-6"
      onSubmit={(e) => {
        e.preventDefault()
        onSend()
      }}
    >
      {onAttach && (
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length)
              onAttachmentsChange((list) => [...list, ...onAttach(files)])
            e.target.value = ""
          }}
        />
      )}
      <InputGroup className="rounded-xl bg-card has-disabled:bg-muted/50">
        {attachments.length > 0 && (
          <InputGroupAddon
            align="block-start"
            className="flex-wrap gap-1.5 pt-2.5"
          >
            {attachments.map((a) => (
              <AttachmentChip
                key={a.id}
                attachment={a}
                onRemove={() =>
                  onAttachmentsChange((list) =>
                    list.filter((x) => x.id !== a.id)
                  )
                }
              />
            ))}
          </InputGroupAddon>
        )}
        <InputGroupTextarea
          ref={textareaRef}
          rows={1}
          aria-label="Message"
          value={draft}
          disabled={disabled}
          placeholder={disabledReason ?? placeholder}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault()
              onSend()
            }
          }}
          className="max-h-32 min-h-11 px-3 pt-3 pb-1 @lg/chat:max-h-48"
        />
        <ComposerActions
          onAttachClick={onAttach ? () => fileRef.current?.click() : undefined}
          disabled={disabled}
          canSend={canSend}
          streaming={streaming}
          onStop={onStop}
        />
      </InputGroup>
    </form>
  )
}

export function AiChat({
  messages,
  streaming = false,
  onSend,
  onStop,
  onRetry,
  onFeedback,
  onAttach,
  suggestions = [],
  loadError,
  onReload,
  disabledReason,
  placeholder = "Ask anything",
  defaultDraft = "",
  defaultAttachments = [],
  className,
}: AiChatProps) {
  const [draft, setDraft] = React.useState(defaultDraft)
  const [attachments, setAttachments] = React.useState(defaultAttachments)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const stick = useStickToBottom(messages.length > 0 && !loadError)

  const canSend =
    !disabledReason &&
    !streaming &&
    (draft.trim().length > 0 || attachments.length > 0)
  const lastAssistant = messages.findLast((m) => m.role === "assistant")

  const send = () => {
    if (!canSend) return
    onSend(draft.trim(), attachments)
    setDraft("")
    setAttachments([])
    stick.scrollToBottom()
  }

  const live = streaming
    ? "Assistant is responding"
    : lastAssistant?.status === "error"
      ? "The response stopped"
      : ""

  return (
    <div
      data-slot="ai-chat"
      className={cn(
        "@container/chat relative flex min-h-0 flex-1 flex-col",
        className
      )}
    >
      <span role="status" className="sr-only">
        {live}
      </span>
      {loadError ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <ErrorState
            title="Couldn't load this conversation"
            description={loadError}
            onRetry={onReload}
          />
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          suggestions={suggestions}
          onPick={(prompt) => {
            setDraft(prompt)
            textareaRef.current?.focus()
          }}
        />
      ) : (
        <MessageList
          messages={messages}
          streaming={streaming}
          onRetry={onRetry}
          onFeedback={onFeedback}
          stick={stick}
        />
      )}

      <Composer
        draft={draft}
        onDraftChange={setDraft}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        textareaRef={textareaRef}
        canSend={canSend}
        streaming={streaming}
        disabledReason={disabledReason}
        placeholder={placeholder}
        onSend={send}
        onStop={onStop}
        onAttach={onAttach}
      />
    </div>
  )
}
