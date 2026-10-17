# oddstack outside Cursor

oddstack skills use Cursor names. In Claude Code or a T3 Code thread, read this file once per session, then map each Cursor name with the tables below. `<skills>` means the folder that holds `odd-mode/`, which is this file's grandparent. If a Cursor field has no row, drop it and say so. Never pass a field or value the tool schema rejects. The Models section applies in every harness, Cursor included.

## Skills

| Cursor | Here |
| --- | --- |
| Run another oddstack skill (`/name` or "the **name** skill") | `Read` `<skills>/<name>/SKILL.md` and follow it. The `Skill` tool refuses most oddstack skills. |
| A skill that is not in `<skills>` (`create-skill`, `cursor-team-kit`'s `deslop`, `control-ui`, `control-cli`) | Use an installed skill with the same name if the session lists one. Otherwise say it is missing, do that step by hand, and continue. |

## Tools

| Cursor | Here |
| --- | --- |
| `Task` | `Agent` in Claude Code. `delegate_task` in a T3 Code thread, for every role, per Models below. A `cursor` child also needs the done marker in odd-mode's Subagents section. |
| `AskQuestion` | `AskUserQuestion`. In `-p` mode it is absent, so ask in plain text. |
| Open a todolist | `TodoWrite` if the session offers it. Otherwise `.odd-todo.md`, per odd-mode's Playbooks section. |
| `Grep`, `Glob` | `Bash` with `rg` when the session has neither. |

## Subagent fields

| Cursor | Here |
| --- | --- |
| `subagent_type: generalPurpose` | `subagent_type: "general-purpose"` |
| `odium-agent`, `comment-sicko` | The same names in Claude Code, when `~/.claude/agents/<name>.md` exists. For `delegate_task`, or when that file is missing, start the brief with "Read `~/.claude/agents/<name>.md` and follow it." If it is missing, use `general-purpose` and say so. |
| `readonly: false` | Omit. Keep the `subagent_type` from the other rows. Agent mode is the default, and it keeps the session's MCP servers. |
| `readonly: true` | `subagent_type: "Explore"`. It keeps `Bash`, so the brief also says "do not edit files", and you check `git status` afterward. |
| `environment: "cloud"` | `isolation: "worktree"`. Name the branch or commit the worker checks out. |
| `cloud_base_branch: <b>` | Tell the worker to check out `<b>` first. |
| `environment: "local"` | Omit. |
| `run_in_background: true` | Omit for `Agent`. It runs in the background by default and notifies you. For `delegate_task`, use `mode: "async"` and keep the `taskId`. |
| `resume` | Spawn a fresh agent and paste the earlier result into its brief. |
| Stop a child | `TaskStop` for `Agent`. `task_cancel` with the `taskId` for `delegate_task`. |

## Models

Every skill picks models the same way. Read the role's line in `models.txt` beside this file, then spawn each entry with this table.

| Entry | T3 Code thread | Claude Code | Cursor |
| --- | --- | --- | --- |
| `claudeAgent <model> effort=<e>` | `delegate_task` with `target: {providerInstanceId: "claudeAgent", model: "<model>", options: {effort: "<e>"}}` | `Agent` with `model` set to the family word in `<model>` (`opus`, `sonnet`, `haiku`, or `fable`) and `effort: "<e>"` | `Task` with `model: "<model>-<e>"` if Cursor accepts it, else rule 2 |
| `cursor <model> reasoning_effort=<e> fastMode=true` | `delegate_task` with `target: {providerInstanceId: "cursor", model: "<model>", options: {reasoning_effort: "<e>", fastMode: true}}`, after the path check and with the done marker in odd-mode's Subagents section | Rule 3 | `Task` with `model: "<model>-<e>-fast"`, such as `grok-4.7-high-fast`. Drop `-fast` when the entry has no `fastMode=true`. |
| `inherit` | Omit `target` | Omit `model` | Omit `model` |

1. In T3 Code, spawn every entry through `delegate_task` on its own provider, even when this thread could run the model natively. Never send a `cursor` entry to T3's `grok` provider. If the route cannot start, stop and report. Do not fall back to another provider unless the operator says so.
2. A `claudeAgent` entry with no route here stays unspawned. Say it belongs in Claude Code or a T3 Code thread. Never run it on Grok, or on a session model that is not Claude Opus. A panel still spawns the entries it can.
3. A `cursor` entry with no route here runs on the session model. Omit `model` and say so in one line. The cross-provider review seat is the exception: odd-mode's "Review runs on the other provider" rule decides it.
4. If the tool rejects the exact model or option, use the closest valid one from the same provider and family, and say so. A rejection never moves an entry to the other provider.
5. If the role has no line in `models.txt`, stop and report it. Do not guess a model.
6. Leave any option the entry does not name at its default. Give each `delegate_task` a `title` naming the role, and a distinct `clientRequestId` per spawn.

## Paths

| Cursor | Here |
| --- | --- |
| `~/.cursor/skills/` | `~/.claude/skills/` or `~/.agents/skills/` |
| `.cursor/rules/*.mdc` | `CLAUDE.md`, or `AGENTS.md` when no `CLAUDE.md` exists. Claude Code never reads `.mdc` files. |
| Transcripts in `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.claude/projects/<slug>/<session>.jsonl`. In T3 Code, read another thread with `t3_thread_read`. |

## Cursor-only features

Automations, Bugbot, Cursor cloud agents, the Cursor dashboard, and Cursor's pull request tool have no equivalent here. Say so, skip that step, and continue.
