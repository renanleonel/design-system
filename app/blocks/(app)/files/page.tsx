"use client"

import * as React from "react"

import {
  AppShellContent,
  AppShellHeader,
} from "@/components/blocks/app-shell/app-shell"
import {
  FileManager,
  type FileEntry,
} from "@/components/blocks/file-manager/file-manager"
import { useSearchParams } from "@/hooks/use-url-state"

// Demo-only fixtures for `?data=worst|empty|one|many` (docs/WORKFLOWS.md → Stress-test).
const GB = 1024 ** 3
const MB = 1024 ** 2

/** Deterministic, so the server and the browser build the same list. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const day = (n: number) =>
  new Date(Date.UTC(2026, 0, 1) + n * 86_400_000).toISOString()

const f = (
  id: string,
  name: string,
  parentId: string | null,
  size: number,
  modified: number
): FileEntry => ({
  id,
  name,
  parentId,
  type: "file",
  size,
  modified: day(modified),
})
const d = (
  id: string,
  name: string,
  parentId: string | null,
  modified: number
): FileEntry => ({
  id,
  name,
  parentId,
  type: "folder",
  modified: day(modified),
})

const DEFAULT: FileEntry[] = [
  d("docs", "Documents", null, 300),
  d("contracts", "Contracts", "docs", 280),
  d("photos", "Photos", null, 310),
  d("trip", "Trip to Florianópolis", "photos", 305),
  d("projects", "Projects", null, 320),
  d("brand", "Brand assets", "projects", 318),
  d("empty", "Empty folder", null, 100),
  f(
    "c1",
    "Contrato de prestação de serviços - Acme.pdf",
    "contracts",
    2.4 * MB,
    280
  ),
  f("c2", "Aditivo 02 - reajuste anual.docx", "contracts", 86 * 1024, 270),
  f("d1", "Q3 report.xlsx", "docs", 1.2 * MB, 290),
  f("d2", "Roadmap 2027.pptx", "docs", 18 * MB, 295),
  f("d3", "Meeting notes.md", "docs", 4 * 1024, 301),
  f("p1", "IMG_2041.heic", "trip", 3.8 * MB, 304),
  f("p2", "IMG_2042.heic", "trip", 4.1 * MB, 304),
  f("p3", "Sunset over Lagoa.mp4", "trip", 412 * MB, 306),
  f("b1", "logo.svg", "brand", 12 * 1024, 317),
  f("b2", "Brand guidelines v3.pdf", "brand", 22 * MB, 318),
  f("r1", "backup-2026-10.zip", null, 1.6 * GB, 325),
  f("r2", "Podcast ep. 14.mp3", null, 58 * MB, 322),
  f("r3", "api-client.ts", null, 9 * 1024, 326),
  f("r4", "Notes.txt", null, 800, 327),
]

const NAMES = [
  "Relatório de desempenho trimestral",
  "Fatura Maria Eduarda dos Santos Albuquerque Cavalcanti",
  "Superdesenvolvimentocomplicadíssimo_relatório_trimestral_final_v2_revisado_definitivo",
  "照片_2026年春节聚会_全家福",
  "تقرير_المبيعات_السنوي_٢٠٢٦",
  "IMG_8841",
  "Planilha de custos",
  "proposta-comercial-joao-pedro-de-oliveira-neto",
  "a",
  "Apresentação 🚀 lançamento",
]
const EXTS = [
  "pdf",
  "docx",
  "xlsx",
  "png",
  "mp4",
  "zip",
  "ts",
  "mp3",
  "pptx",
  "txt",
]

function manyFiles(count: number, parentId: string | null, long: boolean) {
  const next = rng(7)
  return Array.from({ length: count }, (_, i) => {
    const base = long ? NAMES[i % NAMES.length] : `File ${i + 1}`
    return f(
      `m${parentId ?? "root"}-${i}`,
      `${base}${long ? ` (${i + 1})` : ""}.${EXTS[Math.floor(next() * EXTS.length)]}`,
      parentId,
      Math.floor(next() * 800 * MB),
      Math.floor(next() * 330)
    )
  })
}

/** 15 folders deep with long names, and 5,000 files in the last one. */
function worst() {
  const out: FileEntry[] = []
  let parent: string | null = null
  for (let level = 1; level <= 15; level++) {
    const id = `deep${level}`
    out.push(
      d(
        id,
        level % 4 === 0
          ? `Nível ${level} - Departamento de Operações e Planejamento Estratégico`
          : level % 5 === 0
            ? `项目文件夹_第${level}层`
            : `Nível ${level}`,
        parent,
        200 + level
      )
    )
    parent = id
  }
  out.push(...manyFiles(5000, "deep15", true))
  out.push(d("empty", "Pasta vazia", null, 100))
  out.push(
    f(
      "r1",
      "Superdesenvolvimentocomplicadíssimo_relatório_trimestral_final_v2_revisado_definitivo.pdf",
      null,
      3 * MB,
      200
    )
  )
  return out
}

export default function Page() {
  const data = useSearchParams().get("data")
  const { files, total, other, initial } = React.useMemo(() => {
    if (data === "worst")
      return {
        files: worst(),
        total: 15 * GB,
        other: 14.6 * GB,
        initial: "deep15",
      }
    if (data === "empty")
      return {
        files: [] as FileEntry[],
        total: 15 * GB,
        other: 0,
        initial: undefined,
      }
    if (data === "one")
      return {
        files: [f("o", "Only file.pdf", null, 1.1 * MB, 330)],
        total: 15 * GB,
        other: 0,
        initial: undefined,
      }
    if (data === "many")
      return {
        files: manyFiles(5000, null, false),
        total: 15 * GB,
        other: 2 * GB,
        initial: undefined,
      }
    return {
      files: DEFAULT,
      total: 15 * GB,
      other: 3.1 * GB,
      initial: undefined,
    }
  }, [data])

  return (
    <>
      <AppShellHeader
        title="Files"
        description="Browse, select, rename, move and upload"
      />
      <AppShellContent fill>
        <FileManager
          key={data}
          defaultFiles={files}
          storageTotal={total}
          storageOther={other}
          initialFolder={initial}
          className="min-h-0 flex-1 rounded-xl shadow-border"
        />
      </AppShellContent>
    </>
  )
}
