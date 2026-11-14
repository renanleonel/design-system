import type {
  ChatAttachment,
  ChatMessage,
  ChatSuggestion,
} from "@/components/blocks/ai-chat/ai-chat"

import type { ReplyScript } from "./use-fake-chat"

// Demo-only data for /blocks/assistant and its `?data=` variants
// (docs/WORKFLOWS.md → Stress-test). Never shipped with the block.

export const SUGGESTIONS: ChatSuggestion[] = [
  {
    title: "Why did a deploy fail?",
    description: "Read the logs for billing-api",
    prompt: "Why did the last billing-api deploy to production fail?",
  },
  {
    title: "Summarize this week",
    description: "Deploys, incidents and reviews",
    prompt: "Summarize what happened in the workspace this week.",
  },
  {
    title: "Draft a release note",
    description: "From the PRs merged since v2.3",
    prompt: "Draft a release note from the PRs merged since v2.3.",
  },
  {
    title: "Who owns the invoices page?",
    description: "Find the people to ask",
    prompt: "Who owns the invoices page, and who reviewed it last?",
  },
]

const DEPLOY_ANSWER = `The deploy failed in the **migrate** step: \`0042_add_usage_meters\` timed out after 30s while holding a lock on \`invoices\`.

What happened, in order:

1. Build \`1f3a9c2\` passed and the image was pushed at 14:02.
2. The migration started and waited on a lock held by the nightly export job.
3. After 30s the deploy was rolled back automatically; production kept running \`9be41d0\`.

To fix it, run the migration outside the export window, or make it non-blocking:

\`\`\`sql
-- Build the index without locking writes
CREATE INDEX CONCURRENTLY idx_invoices_usage
  ON invoices (workspace_id, period_start);
\`\`\`

Logs: https://deploys.acme.dev/billing-api/1f3a9c2`

const FIX_ANSWER = `Here's a change that moves the export job out of the deploy window. Ana Souza owns the scheduler, so she should review it.

\`\`\`ts
export const exportSchedule = {
  cron: "0 3 * * *", // 03:00 UTC, after the deploy freeze ends
  timeoutMs: 15 * 60_000,
  skipWhen: (ctx: JobContext) => ctx.deploysInProgress > 0,
}
\`\`\`

- \`skipWhen\` waits for running deploys instead of competing for the lock.
- The timeout drops from 30 to 15 minutes; last month's longest run took 9.`

export const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Why did the last billing-api deploy to production fail?",
  },
  {
    id: "m2",
    role: "assistant",
    status: "done",
    toolCalls: [
      {
        id: "t1",
        name: "get_deploy",
        status: "done",
        duration: "0.4s",
        args: { service: "billing-api", environment: "production" },
        result: { id: "1f3a9c2", status: "rolled_back", step: "migrate" },
      },
      {
        id: "t2",
        name: "search_logs",
        status: "done",
        duration: "1.2s",
        args: { deploy: "1f3a9c2", query: "lock timeout", limit: 20 },
        result:
          '3 matches · "canceling statement due to lock timeout" on invoices',
      },
    ],
    content: DEPLOY_ANSWER,
  },
  { id: "m3", role: "user", content: "Can you draft a fix?" },
  {
    id: "m4",
    role: "assistant",
    status: "done",
    content: FIX_ANSWER,
    feedback: "up",
  },
]

export const SCRIPTS: ReplyScript[] = [
  {
    toolCalls: [
      {
        id: "s1",
        name: "list_activity",
        status: "done",
        duration: "0.6s",
        args: { range: "7d", types: ["deploy", "incident", "review"] },
        result: { deploys: 18, incidents: 1, reviews: 23 },
      },
    ],
    content: `This week in Acme:

- **18 deploys**, 17 green. The one failure was billing-api, rolled back on Tuesday.
- **1 incident**: checkout latency spiked for 12 minutes on Wednesday; João Silva wrote the postmortem.
- **23 reviews**; Maria Oliveira approved the most (7).

Want me to turn this into a post for #general?`,
  },
  {
    content: `Sure. Here's a first draft:

### v2.4

- Usage meters on the billing page, with alerts at 80% and 100%.
- Sortable conditions in the rule dialog.
- Faster invoice exports: the nightly job now skips while a deploy runs.

Shall I add contributors (Pedro Santos, Lucas Costa and Beatriz Lima)?`,
  },
  {
    // The third reply drops halfway, to show the error state and Retry.
    toolCalls: [
      {
        id: "s3",
        name: "search_people",
        status: "done",
        duration: "0.3s",
        args: { page: "/billing/invoices" },
        result: ["Ana Souza", "Pedro Santos"],
      },
    ],
    content: `Ana Souza owns the invoices page; Pedro Santos reviewed the last change (#407, sortable conditions). Ana is out until Monday, so Pedro is the best person to ask this week.`,
    failAt: 60,
    error: "The connection dropped. What arrived is kept above.",
  },
]

export const ONE_MESSAGES: ChatMessage[] = [
  { id: "o1", role: "user", content: "Hi!" },
  {
    id: "o2",
    role: "assistant",
    status: "done",
    content: "Hi Renan. What do you want to look at?",
  },
]

const TOPICS = [
  "billing-api",
  "checkout",
  "the invoices page",
  "the nightly export",
  "acme-web",
]

export const MANY_MESSAGES: ChatMessage[] = Array.from(
  { length: 40 },
  (_, i): ChatMessage => {
    const topic = TOPICS[Math.floor(i / 2) % TOPICS.length]
    return i % 2 === 0
      ? {
          id: `n${i}`,
          role: "user",
          content: `What changed in ${topic} (question ${i / 2 + 1})?`,
        }
      : {
          id: `n${i}`,
          role: "assistant",
          status: "done",
          content: `In ${topic}, ${(i % 7) + 2} PRs merged and ${i % 3} deploys rolled back. The largest change was \`${topic.replace(/\W+/g, "-")}-${i}\`, reviewed by ${["Ana Souza", "João Silva", "Pedro Santos", "Maria Oliveira"][i % 4]}.`,
        }
  }
)

const LONG_URL =
  "https://deploys.acme.dev/billing-api/1f3a9c2/logs?query=canceling%20statement%20due%20to%20lock%20timeout&from=2026-11-13T14%3A02%3A00Z&to=2026-11-13T14%3A05%3A00Z&step=migrate&verbose=true"
const LONG_TOKEN =
  "demo-access-51NzQb2KxYvT8mWqP0aRcDeFgHiJkLmNoPqRsTuVwXyZ0123456789abcdefABCDEF"

const HUGE_CODE = Array.from(
  { length: 160 },
  (_, i) =>
    `  { id: ${i + 1}, workspace: "acme-${String(i).padStart(3, "0")}", owner: "maria.eduarda.cavalcanti@northwind-industries-holdings.example.com", periodStart: "2026-11-01T00:00:00Z", amountCents: ${(i * 7919) % 100000} },`
).join("\n")

const LONG_NAME_FILE: ChatAttachment = {
  id: "a1",
  name: "Relatorio_Financeiro_Consolidado_Maria_Eduarda_dos_Santos_Albuquerque_Cavalcanti_2026_Q3_versao_final_revisada.pdf",
  size: "12.4 MB",
}

export const WORST_MESSAGES: ChatMessage[] = [
  {
    id: "w1",
    role: "user",
    attachments: [LONG_NAME_FILE, { id: "a2", name: "a.csv", size: "1 KB" }],
    content: `Maria Eduarda dos Santos Albuquerque Cavalcanti and João Pedro de Oliveira Neto both lost access after the migration. Their key was ${LONG_TOKEN} and the log is at ${LONG_URL}`,
  },
  {
    id: "w2",
    role: "assistant",
    status: "done",
    toolCalls: [
      {
        id: "wt1",
        name: "find_user",
        status: "done",
        duration: "0.2s",
        args: { name: "Maria Eduarda dos Santos Albuquerque Cavalcanti" },
        result: { id: "usr_8c1f", role: "admin" },
      },
      {
        id: "wt2",
        name: "find_user",
        status: "done",
        duration: "0.2s",
        args: { name: "João Pedro de Oliveira Neto" },
        result: { id: "usr_2b9e", role: "member" },
      },
      {
        id: "wt3",
        name: "get_audit_log",
        status: "done",
        duration: "2.8s",
        args: {
          users: ["usr_8c1f", "usr_2b9e"],
          since: "2026-11-13T00:00:00Z",
          include: ["sessions", "tokens", "role_changes", "sso_events"],
        },
        result: HUGE_CODE.slice(0, 1200),
      },
      {
        id: "wt4",
        name: "fetch_url",
        status: "error",
        args: { url: LONG_URL },
        error: `GET ${LONG_URL} → 403 Forbidden: the token ${LONG_TOKEN} was revoked on 2026-11-13T14:03:12Z by the migration 0042_add_usage_meters`,
      },
      {
        id: "wt5",
        name: "check_sso",
        status: "done",
        duration: "0.9s",
        args: { domain: "northwind-industries-holdings.example.com" },
        result: "SAML ok",
      },
      {
        id: "wt6",
        name: "list_sessions",
        status: "done",
        duration: "0.4s",
        args: { user: "usr_8c1f" },
        result: [],
      },
      {
        id: "wt7",
        name: "list_sessions",
        status: "done",
        duration: "0.4s",
        args: { user: "usr_2b9e" },
        result: [],
      },
      { id: "wt8", name: "a", status: "done", duration: "0.1s" },
    ],
    content: `Both lost access when migration \`0042_add_usage_meters\` revoked every token created before \`2026-11-13\`, including \`${LONG_TOKEN}\`.

The fetch of ${LONG_URL} failed with a 403 for the same reason.

The affected rows:

\`\`\`ts
const affected = [
${HUGE_CODE}
]
\`\`\`

- Maria Eduarda dos Santos Albuquerque Cavalcanti: admin, last seen 13/11 14:02
- João Pedro de Oliveira Neto: member, last seen 13/11 13:58
- Jo: no sessions`,
  },
  {
    id: "w3",
    role: "user",
    content:
      "王秀英さんとファーティマ・アル＝ザフラにも同じことを伝えてください。\nأرسل نفس الرسالة إلى فاطمة الزهراء أيضاً.",
  },
  {
    id: "w4",
    role: "assistant",
    status: "done",
    content: "已通知王秀英。\n\nتم إرسال الرسالة إلى فاطمة الزهراء.",
  },
  { id: "w5", role: "user", content: "x" },
  { id: "w6", role: "assistant", status: "stopped", content: "Starting with" },
]

export const WORST_DRAFT = `Também avise Maria Eduarda dos Santos Albuquerque Cavalcanti: ${LONG_URL}`
export const WORST_ATTACHMENTS: ChatAttachment[] = [
  { ...LONG_NAME_FILE, id: "d1" },
  { id: "d2", name: "screenshot.png", size: "320 KB" },
]

// Frozen mid-stream: a finished tool call, a running one, and half an answer.
export const STREAMING_MESSAGES: ChatMessage[] = [
  DEFAULT_MESSAGES[0],
  {
    id: "st",
    role: "assistant",
    status: "streaming",
    toolCalls: [
      DEFAULT_MESSAGES[1].toolCalls![0],
      {
        ...DEFAULT_MESSAGES[1].toolCalls![1],
        status: "running",
        result: undefined,
        duration: undefined,
      },
    ],
    content:
      "The deploy failed in the **migrate** step: `0042_add_usage_meters` timed out after 30s while holding a lock on",
  },
]
export const STREAMING_SCRIPTS: Record<string, ReplyScript> = {
  st: { toolCalls: DEFAULT_MESSAGES[1].toolCalls, content: DEPLOY_ANSWER },
}

export const ERROR_MESSAGES: ChatMessage[] = [
  DEFAULT_MESSAGES[0],
  {
    id: "er",
    role: "assistant",
    status: "error",
    toolCalls: DEFAULT_MESSAGES[1].toolCalls,
    content:
      "The deploy failed in the **migrate** step: `0042_add_usage_meters` timed out after 30s",
    error: "The connection dropped. What arrived is kept above.",
  },
]
export const ERROR_SCRIPTS: Record<string, ReplyScript> = {
  er: { toolCalls: DEFAULT_MESSAGES[1].toolCalls, content: DEPLOY_ANSWER },
}
