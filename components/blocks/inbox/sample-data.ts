import type { MailLabel, MailPerson, MailThread } from "./inbox"

export const SAMPLE_ME: MailPerson = {
  name: "Renan Leonel",
  email: "renan@acme.dev",
}

export const SAMPLE_LABELS: MailLabel[] = [
  { id: "work", name: "Work", tone: "blue" },
  { id: "billing", name: "Billing", tone: "green" },
  { id: "design", name: "Design", tone: "purple" },
  { id: "urgent", name: "Urgent", tone: "red" },
]

const ANA = { name: "Ana Souza", email: "ana.souza@acme.dev" }
const JOAO = { name: "João Silva", email: "joao.silva@acme.dev" }
const PEDRO = { name: "Pedro Santos", email: "pedro@santos.example" }
const MARIA = {
  name: "Maria Oliveira",
  email: "maria.oliveira@northwind.example",
}
const LUCAS = { name: "Lucas Costa", email: "lucas.costa@acme.dev" }
const BEATRIZ = { name: "Beatriz Lima", email: "beatriz@limastudio.example" }

type Template = {
  from: MailPerson
  subject: string
  body: string
  labels?: string[]
  /** Minutes before `now` of the newest message. */
  ago: number
  replies?: { fromMe?: boolean; body: string; gap: number }[]
}

const TEMPLATES: Template[] = [
  {
    from: ANA,
    subject: "Q3 roadmap: billing numbers before Friday",
    body: "Oi Renan,\n\nCan you check the billing numbers in the roadmap doc before Friday? Finance wants to lock the forecast and the usage tier row still looks off.\n\nObrigada!\nAna",
    labels: ["work", "billing"],
    ago: 12,
    replies: [
      {
        fromMe: true,
        gap: 90,
        body: "Looking at it now. The tier row double counts the annual plans.",
      },
    ],
  },
  {
    from: JOAO,
    subject: "Review requested: usage meters on the billing page",
    body: "Opened #412 with the new usage meters. The progress bar needs a second pair of eyes for the over-limit state.\n\nhttps://example.com/acme/web/pull/412",
    labels: ["work"],
    ago: 55,
  },
  {
    from: MARIA,
    subject: "Invoice 2026-1184 is overdue",
    body: "Hello,\n\nOur records show invoice 2026-1184 (R$ 4.820,00) as unpaid since the 2nd. Could you confirm the payment date?\n\nBest regards,\nMaria Oliveira\nNorthwind Industries",
    labels: ["billing", "urgent"],
    ago: 190,
  },
  {
    from: BEATRIZ,
    subject: "New icon set: final round",
    body: "Segue o pacote final dos ícones (24px e 16px). Mantive o traço em 1.5 e ajustei os cantos conforme o feedback.\n\nSe estiver tudo certo, eu exporto o SVG sprite amanhã.",
    labels: ["design"],
    ago: 60 * 7,
    replies: [
      {
        fromMe: true,
        gap: 60,
        body: "Ficou ótimo! Só trocaria o ícone de upload, o resto pode seguir.",
      },
      { gap: 20, body: "Combinado, troco hoje e te aviso." },
    ],
  },
  {
    from: PEDRO,
    subject: "Joining the Growth team on Monday",
    body: "Oi! Confirming my start on Monday. Is there anything I should set up before then (accounts, VPN, repo access)?\n\nAbraço,\nPedro",
    ago: 60 * 26,
  },
  {
    from: LUCAS,
    subject: "Deploy window for billing-api",
    body: "We have a deploy window tonight at 22:00 for billing-api. Migration is backwards compatible, so no downtime expected.\n\nRollback plan is in the runbook.",
    labels: ["work"],
    ago: 60 * 30,
  },
  {
    from: ANA,
    subject: "Lunch on Thursday?",
    body: "Vamos almoçar na quinta? O pessoal do design topou aquele lugar novo perto do escritório.",
    ago: 60 * 24 * 3,
  },
  {
    from: JOAO,
    subject: "Re: sortable conditions in the rule dialog",
    body: "Merged. Thanks for the quick turnaround, the drag handles feel great on touch.",
    labels: ["work"],
    ago: 60 * 24 * 5,
  },
  {
    from: MARIA,
    subject: "Contract renewal terms",
    body: "Attached are the renewal terms for 2027. The main change is the seat tier, everything else is unchanged.\n\nLet me know if legal needs a redline.",
    labels: ["billing"],
    ago: 60 * 24 * 9,
  },
  {
    from: BEATRIZ,
    subject: "Brand colors, dark mode contrast",
    body: "A versão escura do azul passou no contraste AA, mas o texto sobre o fundo âmbar ainda está no limite. Posso mexer na luminosidade?",
    labels: ["design"],
    ago: 60 * 24 * 14,
  },
  {
    from: PEDRO,
    subject: "Weekly sync notes",
    body: "Notes from the weekly sync:\n- Onboarding checklist ships Tuesday\n- Pricing page copy is waiting on legal\n- Two bugs left on the editable table",
    ago: 60 * 24 * 21,
  },
  {
    from: LUCAS,
    subject: "Security review follow-up",
    body: "The pen test came back clean. Two low-severity findings about rate limits; tickets are linked in the report.",
    labels: ["work", "urgent"],
    ago: 60 * 24 * 40,
  },
]

const MS = 60_000

/**
 * Deterministic sample mail relative to `now`. `count` above the template
 * count repeats them with older timestamps, for large-list demos.
 */
export function buildSampleThreads(now: Date, count = TEMPLATES.length) {
  const threads: MailThread[] = []
  for (let i = 0; i < count; i++) {
    const t = TEMPLATES[i % TEMPLATES.length]
    // Repeats drift into the past so ordering stays stable.
    const newest =
      now.getTime() -
      (t.ago + Math.floor(i / TEMPLATES.length) * 97) * MS -
      i * 13 * MS
    const replies = t.replies ?? []
    let at = newest
    for (let r = replies.length - 1; r >= 0; r--) at -= replies[r].gap * MS
    const messages = [
      {
        id: `t${i}-m0`,
        from: t.from,
        at: new Date(at - (replies.length ? 30 * MS : 0)).toISOString(),
        body: t.body,
      },
    ]
    replies.forEach((reply, r) => {
      at += reply.gap * MS
      messages.push({
        id: `t${i}-m${r + 1}`,
        from: reply.fromMe ? SAMPLE_ME : t.from,
        at: new Date(at).toISOString(),
        body: reply.body,
      })
    })
    // Repeats get a number so subjects stay distinct.
    const subject = i < TEMPLATES.length ? t.subject : `${t.subject} (#${i})`
    threads.push({
      id: `thread-${i}`,
      folder: i % 11 === 7 ? "archive" : i % 13 === 5 ? "sent" : "inbox",
      subject,
      participant: t.from,
      labels: t.labels ?? [],
      unread: i % 3 === 0,
      messages,
    })
  }
  return threads
}
