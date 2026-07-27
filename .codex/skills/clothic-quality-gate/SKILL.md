---
name: clothic-quality-gate
description: Audit Clothic release readiness across PRD scope, user flows, account data isolation, Supabase integration, Expo/TypeScript health, UX and accessibility, avatar assets, documentation drift, and bundle cost. Use for overall project feedback, pre-PR or pre-release reviews, regression checks, architecture health reports, or when prioritizing the next safe improvements.
---

# Clothic Quality Gate

Produce an evidence-backed release audit before proposing changes. Keep findings inside the current MVP and separate safe fixes from product or schema decisions.

## Establish scope

Read in priority order:

1. `CLAUDE.md` and `HARNESS/*.md`
2. `docs/PRD.md`
3. `docs/ADR.md`
4. `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/DESIGN_SYSTEM.md`
5. The source files touched by the audit
6. `references/release-checklist.md` from this skill

If documentation and code conflict, report the conflict. Correct demonstrably stale facts only when the user asked for changes; do not silently choose a new product policy.

## Run the gate

1. Confirm branch and worktree state. Preserve unrelated user changes.
2. Run independent code, UX/product, and avatar/asset passes in parallel when subagents are available. Give them read-only scopes and require file/line evidence.
3. Run the baseline:

```bash
npm run check
```

This deterministic gate includes typecheck, lint, format, avatar integrity, core logic tests, and the v4 source-contract guardrail. For measured experiments, read `HARNESS/evaluator-v4.json` and only schema-v4 matching pairs in `.autoresearch/experiments.jsonl`; call the score a retention proxy, never observed retention. Treat v1-v3 evaluators and historical records as legacy non-reproducible evidence.

4. Run `npm run verify:environment` separately after dependency or Expo changes. Treat network-dependent failures separately from deterministic failures.
5. When build readiness is in scope, export Web to a unique directory under `/private/tmp`; never write generated export files into the repository.
6. Inspect the built asset total and largest files. Treat a successful build and a reasonable payload as separate checks.
7. Apply the checklist. Reproduce a user-visible issue in the app when a browser or device session is available. If it is unavailable, state that limitation and use build/source evidence without calling visual behavior verified.
8. Rank findings:
   - P0: privacy, data loss, authentication isolation, or an MVP success path that does not work
   - P1: release-blocking correctness, recovery, accessibility, performance, or misleading product contract
   - P2: maintainability, consistency, or polish

## Decide what to change

For implementation requests:

- Fix the smallest high-confidence P0/P1 set.
- Keep product-policy choices, destructive migrations, bulk image replacement, and architecture changes as explicit follow-ups.
- Prefer reusable app components for runtime UI repetition. Create a skill only for a repeatable agent workflow or specialized project knowledge.
- Use `$clothic-avatar-pipeline` for avatar generation or registration.
- Update `TODO.md` and `LOG.md`, then rerun the full baseline.
- If the change targets a measured flow, use `$karpathy-autoresearch-loop`; freeze a new evaluator version before changing the candidate surface.

For review-only requests, do not modify files or external systems.

## Report

Lead with the outcome. Include:

- completed improvements or review-only status
- P0/P1/P2 findings with file/line evidence
- changed files and why
- validation commands and exact outcomes
- visual testing coverage or limitation
- product/schema decisions still requiring the user
- failed external coordination such as GitHub authentication

Do not call a project release-ready solely because typecheck and lint pass.
