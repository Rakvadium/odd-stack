---
name: setup-oddstack
description: Configure which models oddstack uses per role and at what reasoning budget. Detects models this harness can select and edits the odd-mode skill's models.txt, which every harness reads. Use for /setup-oddstack, "configure oddstack models", "oddstack budget", or changing oddstack's model choices.
---

# Setup oddstack

Edit the odd-mode skill's `models.txt`. That file is the model map every harness reads. Resolve it as `../odd-mode/models.txt` from this skill's directory, not from the project being configured. Its header gives the line format. The Models section of `../odd-mode/harness.md` says how each harness spawns an entry.

## Steps

### 1. Detect available models

Name the harness you are in: Cursor, Claude Code, or a T3 Code thread.

In a T3 Code thread, call `orchestrator_capabilities` (often `mcp__t3-code__orchestrator_capabilities`). It lists each provider id, its models, and each model's option ids and values. That is the source of truth for every entry, since entries use T3's ids. Elsewhere, list the models you can pass to a subagent here, and ask the user to paste any other provider's models they want. `inherit` is always valid.

Never invent a provider, model, or option id. The committed entries are already confirmed.

### 2. Load current state

Read `../odd-mode/models.txt`. The committed role lines are in step 5. A role line that is not in step 5, such as `how critics`, is from a retired role. Drop it.

On a re-run, a role that differs from the committed line by provider, model, list length, or `inherit` is a customization. Keep it. A role that differs only by its `effort` or `reasoning_effort` value is not. Rebuild it from step 5, then apply the budget.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Prefer AskQuestion over free text. Offer these four options with these exact labels, and name the current budget from the file's `# budget:` line.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** Set the `effort` or `reasoning_effort` value of every entry, panel entries included, to `max`, `xhigh`, `high`, or `medium`. When the model's option does not list that value, use its highest listed value below it. Grok on `cursor` tops out at `xhigh`, so `unlimited` gives it `xhigh`. `inherit` does not change. `medium` keeps the committed map.

**(c) Show the roles and confirm.** Show every role with its entries, and list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit`, which runs the role on the parent chat model. Prefer AskQuestion over free text. For panel roles (`arena runners`, `architect runners`, `interrogate reviewers`) the value is a list separated by ` | `, and one subagent runs per entry, so the list length sets the count. `arena cross-judge pool` is also a list, but arena picks one entry from it on a different provider from the parent's when it can. `swarm workers` is the model for every worker unless a race names a model per arm.

### 4. Validate

Every entry must be `inherit` or `<provider> <model> <option>=<value> ...`, with ids from step 1 or from step 5. If one fails, stop and ask again.

### 5. Write the map

Write `../odd-mode/models.txt`, resolved from this skill's directory. Keep the comment header above the `# budget:` line. Replace the `# budget:` line and the role lines, and keep the role labels exactly as below. Overwrite, so re-runs stay idempotent. If the file is missing, restore it with `git show HEAD:skills/odd-mode/models.txt`, then write. The committed lines are:

```
# budget: medium

feature, refactoring: claudeAgent claude-opus-5-5 effort=high
bug-fix: claudeAgent claude-opus-5-5 effort=high
perf-issue: claudeAgent claude-opus-5-5 effort=high
hillclimb: cursor grok-4.7 reasoning_effort=high fastMode=true
judgment and prose: claudeAgent claude-opus-5-5 effort=high
hardest tasks: claudeAgent claude-opus-5-5 effort=high
how explorer: cursor grok-4.7 reasoning_effort=high fastMode=true
how explainer: claudeAgent claude-opus-5-5 effort=high
why investigators: cursor grok-4.7 reasoning_effort=high fastMode=true
why synthesizer: claudeAgent claude-opus-5-5 effort=high
reflect tooling: cursor grok-4.7 reasoning_effort=high fastMode=true
reflect judgment, divergent, synthesizer: claudeAgent claude-opus-5-5 effort=high
arena runners: claudeAgent claude-opus-5-5 effort=high | cursor grok-4.7 reasoning_effort=high fastMode=true
arena cross-judge pool: claudeAgent claude-opus-5-5 effort=high | cursor grok-4.7 reasoning_effort=high fastMode=true
swarm workers: cursor grok-4.7 reasoning_effort=high fastMode=true
architect runners: claudeAgent claude-opus-5-5 effort=high | cursor grok-4.7 reasoning_effort=high fastMode=true
interrogate reviewers: claudeAgent claude-opus-5-5 effort=high | cursor grok-4.7 reasoning_effort=high fastMode=true
cross-provider reviewer: cursor grok-4.7 reasoning_effort=high fastMode=true
```

Run `node scripts/check-models.mjs` from the repo root when the repo is available. It fails on a role a skill reads that has no line.

### 6. Confirm

Tell the user the map was written at `skills/odd-mode/models.txt`, and that every harness reads it through the odd-mode skill on the next skill load.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill` (resolves wherever oddstack is installed: workspace, user, or plugin). On no, move on without pushing.
