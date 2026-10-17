# oddstack outside Cursor

oddstack skills use Cursor names. In Claude Code, a T3 Code thread, or Grok Bot, read this file once per session, then map each Cursor name with the tables below. `<skills>` means the folder that holds `odd-mode/`, which is this file's grandparent. If a Cursor field has no row, drop it and say so. Never pass a field or value the tool schema rejects.

## Skills

| Cursor | Here |
| --- | --- |
| Run another oddstack skill (`/name` or "the **name** skill") | `Read` `<skills>/<name>/SKILL.md` and follow it. The `Skill` tool refuses most oddstack skills. |
| A skill that is not in `<skills>` (`create-skill`, `cursor-team-kit`'s `deslop`, `control-ui`, `control-cli`) | Use an installed skill with the same name if the session lists one. Otherwise say it is missing, do that step by hand, and continue. |

## Tools

| Cursor | Here |
| --- | --- |
| `Task` | `Agent` in Claude Code. In a T3 Code thread, `delegate_task` for every role `models.txt` routes through T3, and `Agent` only for a same-provider helper. |
| `AskQuestion` | `AskUserQuestion`. When it is absent (`-p` mode, a thread started by Grok Bot), ask in plain text. |
| Open a todolist | `TodoWrite` if the session offers it. Otherwise `.odd-todo.md`, per odd-mode's Playbooks section. |
| `Grep`, `Glob` | `Bash` with `rg` when the session has neither. |

## Subagent fields

| Cursor | Here |
| --- | --- |
| `subagent_type: generalPurpose` | `subagent_type: "general-purpose"` |
| `odium-agent`, `comment-sicko` | The same names, when `~/.claude/agents/` links them. Otherwise `general-purpose`, with a brief that starts "Read `<absolute path>/agents/<name>.md` and follow it." For `delegate_task`, put that line at the top of the task text. |
| `readonly: true` | `subagent_type: "Explore"`. It keeps `Bash`, so the brief also says "do not edit files", and you check `git status` afterward. |
| `environment: "cloud"` | `isolation: "worktree"`. Name the branch or commit the worker checks out. |
| `environment: "local"` | Omit. |
| `run_in_background: true` | Omit for `Agent`. It runs in the background by default and notifies you. For `delegate_task`, use `mode: "async"` and keep the `taskId`. |
| `resume` | Spawn a fresh agent and paste the earlier result into its brief. |
| Stop a child | `TaskStop` for `Agent`. `task_cancel` with the `taskId` for `delegate_task`. |

## Models

Read the role's slug from `models.txt`, then route it.

| Slug | Claude Code | T3 Code thread |
| --- | --- | --- |
| `claude-<family>-<version>-<effort>`, such as `claude-opus-5-5-high` | `Agent` with `model: "opus"` and `effort: "high"`. `model` takes only `opus`, `sonnet`, `haiku`, `fable`. | `delegate_task` per the `# harness` section of `models.txt`. |
| `grok-*` | No route. Follow the `# harness` section of `models.txt`. | `delegate_task` per the `# harness` section of `models.txt`. |
| `auto`, `inherit-parent` | Omit `model`. | Omit `model`. |

## Paths

| Cursor | Here |
| --- | --- |
| `~/.cursor/skills/` | `~/.claude/skills/` or `~/.agents/skills/` |
| `.cursor/rules/*.mdc` | `CLAUDE.md`, or `AGENTS.md` when no `CLAUDE.md` exists. Claude Code never reads `.mdc` files. |
| Transcripts in `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.claude/projects/<slug>/<session>.jsonl`. In T3 Code, read another thread with `t3_thread_read`. |

## Cursor-only features

Automations, Bugbot, Cursor cloud agents, the Cursor dashboard, and Cursor's pull request tool have no equivalent here. Say so, skip that step, and continue.
