---
name: karpathy-autoresearch-loop
description: Use this skill when the user wants Karpathy-style AutoResearch, autonomous repository improvement, repeated A/B experiments, benchmark-driven optimization, self-improving coding-agent workflows, or "keep improving until I explicitly stop" work. Applies to code, prompts, skills, tests, performance, UX, and repo maintenance where progress can be measured by a fixed evaluator.
---

# Karpathy AutoResearch Loop

Run a constrained self-improvement loop inspired by `karpathy/autoresearch`: define a small editable surface, freeze the evaluator, create a candidate change, measure baseline vs candidate, keep the change only if the evidence improves, then commit and push when requested and permitted.

## Start Here

1. Translate the user's goal into one scalar proxy metric and non-negotiable gates. Label synthetic product metrics as proxies, not observed retention.
2. Create or select a versioned evaluator manifest whose fixed clock, timezone, seed, fixtures, command, direction, epsilon, and gates are explicit.
3. Identify the smallest editable surface for the next experiment.
4. Record a baseline before editing.
5. Make one candidate change.
6. Run the exact same manifest, fixtures, command, repeat count, and metric parser against the candidate.
7. Adopt only if the candidate passes all gates and improves the target metric by more than epsilon.
8. Commit and push adopted work when the user asked for that behavior and the environment permits it.
9. Continue until a stop condition is reached.

Use [references/github-projects.md](references/github-projects.md) when you need the current map of related AutoResearch/self-improvement projects and search terms to refresh it.

## Loop Contract

Keep the loop honest:

- **Editable surface**: one feature, file cluster, prompt, skill section, or benchmark target per iteration.
- **Frozen evaluator**: do not change tests, scoring code, fixtures, or benchmark data in the same iteration unless the experiment is specifically about improving the evaluator.
- **Frozen identity**: use a schema-v4 manifest for command, metric parser, direction, epsilon, repeat, timeout, CWD, environment, and gates. The runner hashes the manifest, fixtures, and itself, then rejects runtime or environment drift before executing a candidate.
- **Single primary metric**: choose one direction, such as fewer failing tests, lower latency, smaller bundle, higher eval score, fewer lint errors, better screenshot diff, or lower validation loss.
- **Metric completeness**: treat a missing or non-numeric primary metric as evaluator failure, never as a successful run.
- **Guardrail gates**: include correctness tests, type checks, lint, security checks, visual verification, or manual inspection when they are relevant.
- **Revert rule**: if a candidate fails a gate or does not improve the metric, revert only that candidate's changes and keep the experiment log.
- **Adoption rule**: if the candidate improves the primary metric and preserves gates, keep it, document the evidence, then commit/push if requested.

Never bypass tool permission prompts, repository policies, branch protections, or user-owned uncommitted changes to satisfy the loop. If push is blocked by credentials, network, or branch policy, leave the commit locally and report the exact blocker.

## Experiment Log

Maintain `.autoresearch/experiments.jsonl` or `.autoresearch/notes.md` in the repo unless the user specifies another location. Each accepted or rejected iteration should capture:

- hypothesis
- editable surface
- baseline command and result
- candidate command and result
- metric direction and delta
- adopted/rejected decision
- commit hash if adopted

Use a repo-contained schema-v4 manifest. Pass only experiment metadata and repo-contained editable paths on the CLI:

```bash
python .codex/skills/karpathy-autoresearch-loop/scripts/eval_variant.py \
  --experiment-id first-record-cta-v1 \
  --label baseline \
  --hypothesis "An explicit CTA improves the deterministic flow score" \
  --surface components/AvatarCard.tsx \
  --surface 'app/(tabs)/index.tsx' \
  --manifest HARNESS/evaluator-v4.json

python .codex/skills/karpathy-autoresearch-loop/scripts/eval_variant.py \
  --experiment-id first-record-cta-v1 \
  --label candidate \
  --hypothesis "An explicit CTA improves the deterministic flow score" \
  --surface components/AvatarCard.tsx \
  --surface 'app/(tabs)/index.tsx' \
  --manifest HARNESS/evaluator-v4.json
```

Keep the manifest and output under the repository; output must be a direct `.autoresearch/*.jsonl` file. The runner requires exactly one finite metric match, runs every manifest gate, kills the process group on timeout, locks the append-only log, and records evaluator, runtime, environment, worktree, and surface hashes. A candidate is adopted only when its command and gates pass and its improvement is greater than epsilon.

Treat `HARNESS/evaluator.json`, `evaluator-v2.json`, and `evaluator-v3.json` plus their historical log entries as legacy non-reproducible evidence. Do not pair new candidates with them. Use `HARNESS/evaluator-v4.json` or create a later schema-v4 manifest.

## A/B Testing Patterns

Use the evaluator that matches the work:

- **Code correctness**: test suite, type check, lint, reproducer, issue-specific regression test.
- **Performance**: repeated timing with warmups, fixed input, same machine, median or mean of successful runs.
- **Frontend UX**: Playwright screenshots across desktop/mobile, interaction checks, visual diff, accessibility scan.
- **Prompt/skill quality**: fixed task set, independent reviewer or subagent when available, rubric score, failure-mode count.
- **Research/ML**: fixed data split, fixed budget, fixed seed set if possible, validation metric, run log.

When variance is high, repeat both baseline and candidate. Prefer a candidate only when the improvement is larger than noise and no guardrail regresses.

## Git Workflow

Before editing, inspect `git status --short --branch`. Work with any user changes; do not revert unrelated dirty files.

For adopted candidates:

1. Stage only files changed by the accepted candidate.
2. Commit with a message naming the metric, for example `Improve skill eval loop logging`.
3. Push the current branch if the user requested push behavior.
4. If push fails due to sandboxed network, rerun the same push with approval.

For rejected candidates, restore only files touched by that candidate. Do not use broad destructive commands such as `git reset --hard`.

## Stop Conditions

The user's explicit stop command takes priority. Before a campaign, choose explicit limits; defaults are:

- target metric or all required assertions reached
- three consecutive rejected candidates
- six iterations
- 90 minutes of wall-clock work
- a product-policy decision is required before an expected result can be frozen

If an evaluator is missing, make evaluator creation its own iteration, validate it against one known-pass and one known-fail fixture, then freeze it before changing the candidate surface.
