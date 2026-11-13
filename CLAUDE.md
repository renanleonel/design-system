@AGENTS.md

## Claude Code

- Load the `frontend-design` skill before building or reviewing UI, `animate` before adding motion, `dataviz` before touching charts, `break-ui` to stress-test a component or block (repo setup in `docs/WORKFLOWS.md`). Repo rules in `docs/` override a skill where they differ.
- Verify UI in the real app (`pnpm dev`, or the `run` skill) at 320px and 1280px, light and dark, before calling it done.
- Delegate the long `pnpm audit:ui` / build log reading to a subagent; keep edits in the main session.
