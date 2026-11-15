import type { ActivityEvent, ActivityType } from "./activity-feed"

const ACTORS = [
  "Ana Souza",
  "João Silva",
  "Pedro Santos",
  "Maria Oliveira",
  "Lucas Costa",
  "Beatriz Lima",
  "Renan Leonel",
]
const TARGETS = [
  "Q3 roadmap",
  "Billing usage meters",
  "Rule dialog sortable conditions",
  "Pricing page copy",
  "Onboarding checklist",
  "Editable table rollback",
  "Security review",
]
const COMMENTS = [
  "Can you check the billing numbers before Friday? The usage tier row still looks off.",
  "Looks good to me. One nit on the empty state copy.",
  "Ficou ótimo! Só trocaria o ícone de upload.",
  "Blocked on legal for the pricing copy, I'll ping them today.",
  "Merged. Thanks for the quick turnaround.",
]
const STATES = ["Backlog", "Todo", "In progress", "In review", "Done"]
const FILES = [
  ["roadmap-q3.pdf", "2.4 MB"],
  ["usage-meters.fig", "8.1 MB"],
  ["contrato-renovacao-2027.docx", "184 KB"],
  ["screenshot-2026-11-12.png", "612 KB"],
]

function lcg(seed: number) {
  let s = seed
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296
}

export function buildSampleActivity(now: Date, count = 120): ActivityEvent[] {
  const rand = lcg(7)
  const events: ActivityEvent[] = []
  let t = now.getTime() - 3 * 60_000
  for (let i = 0; i < count; i++) {
    const burst = i % 23 >= 8 && i % 23 <= 13
    const type: ActivityType = burst
      ? "status"
      : (
          [
            "comment",
            "mention",
            "assignment",
            "upload",
            "comment",
            "status",
          ] as const
        )[Math.floor(rand() * 6)]
    const actor = burst
      ? ACTORS[(Math.floor(i / 23) + 1) % ACTORS.length]
      : ACTORS[Math.floor(rand() * ACTORS.length)]
    const target = burst
      ? TARGETS[Math.floor(i / 23) % TARGETS.length]
      : TARGETS[Math.floor(rand() * TARGETS.length)]
    const from = Math.floor(rand() * 4)
    const file = FILES[Math.floor(rand() * FILES.length)]
    events.push({
      id: `evt-${i}`,
      type,
      actor: { name: actor },
      at: new Date(t).toISOString(),
      target,
      body:
        type === "comment" || type === "mention"
          ? COMMENTS[Math.floor(rand() * COMMENTS.length)]
          : undefined,
      from: type === "status" ? STATES[from] : undefined,
      to: type === "status" ? STATES[from + 1] : undefined,
      assignee:
        type === "assignment"
          ? ACTORS[Math.floor(rand() * ACTORS.length)]
          : undefined,
      file: type === "upload" ? { name: file[0], size: file[1] } : undefined,
    })
    t -= (burst ? 4 : 25 + Math.floor(rand() * 180)) * 60_000
  }
  return events
}
