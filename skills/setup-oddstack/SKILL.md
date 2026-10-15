---
name: setup-oddstack
description: Configure which models oddstack uses per role and at what reasoning budget. Detects models this harness can select and edits the odd-mode skill's models.txt, which every harness reads. Use for /setup-oddstack, "configure oddstack models", "oddstack budget", or changing oddstack's model choices.
---

# Setup oddstack

Edit the odd-mode skill's `models.txt`. That file is the model map every harness reads. Resolve it as `../odd-mode/models.txt` from this skill's directory, not from the project being configured. The relative path follows the per-skill symlink or junction.

## Steps

### 1. Detect available models

Name the harness you are in. Cursor, Claude Code, Codex, T3 Code (and that thread's provider), or Grok Bot.

Enumerate the model slugs you can pass to a subagent in this session. That is the dependable source for this harness. If the harness exposes a models API or CLI that lists entitled models, prefer it for completeness. If you cannot detect any, ask the user to paste the slugs this harness can select. The aliases `inherit-parent` and `auto` are always valid even though they are not detected slugs.

A slug whose provider is the other harness is still a valid map entry. `grok-*` lives on Cursor (and a T3 Code thread on the Cursor provider, and Grok Bot). `claude-*` lives on Claude Code (and a T3 Code thread on the Claude provider). This fork's Cursor plan cannot select `claude-*`. Claude Code and Codex cannot select `grok-*`. Keep those slugs when the user confirms the other harness has them. The committed map's slugs are already confirmed for their providers. Never invent a slug for the harness you are in.

### 2. Load current state

The committed role lines are the baseline. They live in `../odd-mode/models.txt` and are repeated in step 5. Read that file. If `~/.cursor/rules/oddstack-models.mdc` exists, its `# budget` line and its role lines are the current choices on top of the file. Otherwise the file is the current choices. A line whose role is not in step 5, such as `how critics`, is from a retired role. Drop it.

On a re-run, a role whose current value differs from the committed baseline by family, by list length, or by the alias `inherit-parent` or `auto` is a customization. Keep that customization. A role that differs only by effort token is not a customization. Rebuild it from the baseline, then apply the budget.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Prefer AskQuestion over free text. Offer these four options with these exact labels, and name the current budget when the file or the override records one. With no budget line, say that `medium` matches the committed map.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** `unlimited`, `large`, `medium`, and `small` set the effort token of every real slug, panel entries included, to `max`, `xhigh`, `high`, or `medium`. The effort token is the last token, or the one before a trailing `fast`, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. `inherit-parent` and `auto` do not change. If the retargeted slug is not one this harness can select, keep it when its family belongs to the other provider and mark the role `runs on cursor` or `runs on claude`. When the family belongs to this harness and the retargeted slug is not detected, use the same family's detected slug with the highest effort at or below the target, else mark the role as needing a choice. So `unlimited` turns `claude-opus-5-5-high` into `claude-opus-5-5-max`. Grok slugs top out at `xhigh`, so `grok-4.7-high-fast` becomes `grok-4.7-xhigh-fast`. `large` turns the committed pair into `claude-opus-5-5-xhigh` and `grok-4.7-xhigh-fast`. `medium` keeps both committed defaults. `small` turns them into `claude-opus-5-5-medium` and `grok-4.7-medium-fast`.

**(c) Show the roles and confirm.** Show every role with its model and its provider. Mark a slug this harness cannot select as `runs on cursor` or `runs on claude`, not as needing a choice. Mark a slug for this harness that is not in the detected set as needing a choice. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` and `auto` (both mean: this role runs on the parent chat model, which is how Auto users stay on Auto) and the other provider's slugs the user confirms. Prefer AskQuestion over free text. For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

A real slug this harness will select must be in the detected set. A real slug for the other provider must be one the user confirmed that harness has, or one of the committed defaults for that provider. `inherit-parent` and `auto` always pass. If a chosen slug fails that, stop and ask again.

### 5. Write the map

Write `../odd-mode/models.txt`, resolved from this skill's directory. Keep every comment above the `# budget:` line, including the provider and harness sections. Replace the `# budget:` line and the role lines. Overwrite so re-runs stay idempotent. Use the same role labels odd-mode uses. Do not write `~/.cursor/rules/oddstack-models.mdc`.

If the file is missing, restore the comment header from `git show HEAD:skills/odd-mode/models.txt` and then write the new budget and role lines. The committed role lines, before a budget is applied, are:

```
# budget: medium (high)
feature, refactoring: grok-4.7-high-fast
bug-fix: grok-4.7-high-fast
perf-issue: grok-4.7-high-fast
hillclimb: grok-4.7-high-fast
judgment and prose: claude-opus-5-5-high
hardest tasks: claude-opus-5-5-high
how explorer: grok-4.7-high-fast
how explainer: claude-opus-5-5-high
why investigators: grok-4.7-high-fast
why synthesizer: claude-opus-5-5-high
reflect tooling: grok-4.7-high-fast
reflect judgment, divergent, synthesizer: claude-opus-5-5-high
arena runners: claude-opus-5-5-high, grok-4.7-high-fast
arena cross-judge pool: claude-opus-5-5-high, grok-4.7-high-fast
swarm workers: grok-4.7-high-fast
architect runners: claude-opus-5-5-high, grok-4.7-high-fast
interrogate reviewers: claude-opus-5-5-high, grok-4.7-high-fast
```

### 6. Confirm

Tell the user the map was written at `skills/odd-mode/models.txt` inside the odd-mode skill, and that Cursor, Claude Code, Codex, T3 Code, and Grok Bot read it through that skill. The next time a skill is read, it sees the edit.

If `~/.cursor/rules/oddstack-models.mdc` exists, say that it still overrides the map on this machine. Ask whether to delete it. On yes, delete it. On no, leave it and say the file you just wrote will not win here until the override is gone.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill` (resolves wherever oddstack is installed: workspace, user, or plugin). On no, move on without pushing.
