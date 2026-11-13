import { DemoShell } from "@/components/playground/demo-shell"

export default function AppBlocksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DemoShell>{children}</DemoShell>
}
