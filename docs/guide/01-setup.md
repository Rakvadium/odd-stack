# Set up oddstack

In this page you install the plugin, pick which models oddstack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

In a Cursor chat, run:

```text
/add-plugin oddstack
```

Cursor confirms the plugin is installed.

## Pick your models

Run:

```text
/setup-oddstack
```

[`/setup-oddstack`](../../skills/setup-oddstack/SKILL.md) detects the models this harness can select, asks for a reasoning budget, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It edits [`skills/odd-mode/models.txt`](../../skills/odd-mode/models.txt), the map every oddstack skill reads. Cursor, Claude Code, Codex, T3 Code, and Grok Bot all read that file, because it lives inside the odd-mode skill and the other skills point at it as a sibling.

The committed map runs at `high` reasoning, the same as the `medium` budget. `large` raises each model to `xhigh`. `unlimited` lifts each model to its highest tier, up to `max`. Opus goes to `max`. Grok tops out at `xhigh`, so it stays there. `small` lowers the reasoning and spends fewer tokens.

Every role needs a line in the map. A skill that finds no line for its role stops and says so, rather than guessing a model. To restore the committed choices, check out `skills/odd-mode/models.txt` from git. A rerun of `/setup-oddstack` keeps any role whose model differs from the committed map by provider, model, list, or `inherit`.

You might be wondering what happens if you use Auto. Set a role to `inherit` and oddstack omits the subagent `model` field, so the subagent inherits your parent chat model. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `/swarm` worker unless a race names a model for each arm.

## Accept the verification offer, or don't

At the end of setup, `/setup-oddstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.agents/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. Symlinks under `.claude/skills/` and `.cursor/skills/` register `/verify-<app>` in both harnesses. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to oddstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

The map applies the next time a skill is read. A Cursor override file, if you kept one, still applies to new Cursor chats.

## Keep the cost in check

oddstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Rerun `/setup-oddstack` and pick a smaller reasoning budget or cheaper models. A strong model in the main chat with cheaper, faster models in the code roles is a good split.
- Set a role to `inherit` so it runs on the chat's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `/odd-mode` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/odd-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/odd-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. To keep `/odd-mode` on for the whole chat, pick it from the `/` menu with Option+Enter (Mac) or Alt+Enter (Windows) instead of Enter. That makes it a [Custom Mode](https://cursor.com/docs/skills), which stays in context on every turn until you exit it. Custom Modes are available in the Agents Window and the CLI. Plain Enter attaches the skill to one message, and it fades as the chat moves on.

Next: [Route work through `/odd-mode`](./02-odd-mode.md).
