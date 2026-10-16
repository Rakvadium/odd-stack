---
name: create-verification-skill
description: "Generate a project-local verification skill that drives your app the way a user does — any language, framework, or platform. Use for /create-verification-skill, \"make a control skill for this repo\", or when a project has no scripted way to prove UI/CLI/service behavior."
disable-model-invocation: true
---

# Create a verification skill

Every serious project needs a scripted way to drive the real app and prove behavior: launch it, exercise a feature the way a user would, and capture evidence. This skill generates that as a project-local skill (`.agents/skills/verify-<app>/`) tailored to the repo. You write the generator's output for the next agent, not for a human: it will be read cold, mid-task, by an agent that has never seen the app.

## 0. Look for an existing verify skill

Look for a `verify-*/` skill under `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` before generating. Never generate a duplicate.

- If `.agents/skills/verify-<app>` exists, create whichever harness link from step 2 is missing.
- If a real copy exists only under `.cursor/skills/` or `.claude/skills/`, run `mkdir -p .agents/skills`, then `git mv` it to `.agents/skills/verify-<app>` in its own commit. Create both harness links from step 2.
- If both `.cursor/skills/` and `.claude/skills/` hold real copies, compare them with `diff -r`. If they match, move one as above, `git rm -r` the other, and create both links. If they differ, stop and report the difference.

## 1. Interview the repo, not the user

Answer these from the codebase and only ask the user what you cannot observe:

- **Surface:** what does a user actually touch? A web UI, a CLI/TUI, a desktop app, an API, a mobile app, a library? A repo can have several; pick the primary one and note the rest.
- **Run:** how does the app start locally? Prefer the repo's own documented dev command (package scripts, Makefile, README quickstart). Note ports, env vars, seed data, auth.
- **Drive:** how can an agent interact with it programmatically? Existing harnesses first — Playwright/Cypress specs, expect scripts, PTY helpers, curl-able endpoints, a debug port. Only then pick a generic recipe: browser/CDP for web and Electron, a tmux/PTY harness for CLI/TUI, plain HTTP for services.
- **Observe:** what evidence can be captured? Screenshots, terminal transcripts, response bodies, logs, exit codes, DB state.
- **Isolate:** can two instances run side by side (ports, data dirs, profiles)? If not, say so in the generated skill: refusing to double-drive a shared instance beats corrupting the user's session.

If the checkout doesn't build or start as-is, fix that first (or report it precisely) before generating; a skill written against a broken base teaches wrong steps. When an irrelevant missing asset blocks startup (a static dir the API never serves, a sample config), the generated skill may create it, clearly marked as verification scaffolding, and remove it in cleanup.

## 2. Generate the skill

Write `.agents/skills/verify-<app>/SKILL.md` with YAML frontmatter (`name: verify-<app>` and a `description` that names the app, the surface, and when to reach for it). Without frontmatter the skill never registers. Give it these sections, each grounded in what the interview actually found (no placeholders left):

- **Launch:** the exact command that starts the app for verification, and how to tell it's ready (a log line, a port answering, a prompt). Include teardown. For a short-lived CLI or TUI there is no server to keep alive: launch means build the binary (or install deps) once, then start each drive in its own isolated PTY or tmux session.
- **Doctor:** one read-only check that answers "is this instance worth driving?" — process up, right version/build, port owned by us, auth valid. An agent runs this first whenever anything looks off.
- **Drive:** the harness recipe with real selectors/commands from this repo, not examples. Prefer stable handles (ARIA labels, data attributes, prompt strings, route paths) over coordinates and tab order.
- **Evidence:** what to capture for a proof and where it goes. State the proof standards: exercise the real user path, not internal setters or test-only endpoints; capture the action and the resulting state, not just the final screen; verify side effects (files written, rows inserted, messages sent) alongside what's visible; mocks only where a production boundary already isolates the external system. When the safe path is a dry-run or test mode, verify what it actually skips by observing (files, network, git refs) rather than trusting its name: some dry-runs still touch the network or open a browser.
- **Cleanup:** how to tear down instances the run created. Never kill by process name; kill what you started. Cleanup removes instances and scratch state, never the evidence: proof artifacts survive the teardown, in a location the skill names.
- **Helpers:** any script the skill ships is executable and its invocation is shown in the skill body. A helper the reader has to reverse-engineer is not a helper.

Link the skill into both harnesses so the slash command registers in Claude Code and Cursor. Commit two relative symlinks:

```sh
mkdir -p .claude/skills .cursor/skills
ln -s ../../.agents/skills/verify-<app> .claude/skills/verify-<app>
ln -s ../../.agents/skills/verify-<app> .cursor/skills/verify-<app>
```

On Windows Git Bash, prefix each `ln` with `MSYS=winsymlinks:nativestrict` (needs Developer Mode or admin). Without it, `ln -s` copies the directory. With `core.symlinks=false`, git stores the link as a regular file. After `git add`, and before committing, `git ls-files -s .claude/skills/verify-<app> .cursor/skills/verify-<app>` must show mode `120000` for both.

If a real symlink still can't be made, delete and unstage whatever `ln` left at both paths. Stage each link directly, then write the worktree from the index:

```sh
blob=$(printf '%s' ../../.agents/skills/verify-<app> | git hash-object -w --stdin)
git update-index --add --cacheinfo 120000,$blob,.claude/skills/verify-<app>
git update-index --add --cacheinfo 120000,$blob,.cursor/skills/verify-<app>
git checkout-index -f -- .claude/skills/verify-<app> .cursor/skills/verify-<app>
```

Before any `git add` or `commit -a`, `git status --short .claude/skills/verify-<app> .cursor/skills/verify-<app>` must print nothing, and `git ls-files -s` on both paths must show mode `120000`.

## 3. Seed the feature map

Create `.agents/skills/verify-<app>/features/README.md` plus one file per user-facing feature you can identify (aim for the top 3-5 to start, from routes, commands, menus, or docs). Follow the shape in [`references/feature-map-example/`](references/feature-map-example/), with a README index and one file per feature. Each file answers, from the user's point of view: what the feature is, how to reach it, how to drive it with the harness, and what observable end state proves it works. The four H2s are `Sub-features`, `How to get to it (user POV)`, `Driving it with <harness>`, and `Gotchas`. The map is the repo's maintained verification source; a proof that drives one convenient entry point is incomplete when the map lists others.

## 4. Prove the generated skill before handing it over

Run its own instructions end to end once: launch, doctor, drive ONE mapped feature (one is enough; the map exists so later runs can cover the rest), capture evidence, clean up. After cleanup, confirm the evidence still exists at the named location. A cleanup that eats the proof fails this step. Confirm both harness links. `git status --short` on both link paths prints nothing, and `git ls-files -s` shows mode `120000` for both. Where the OS has real symlinks, `ls .claude/skills/verify-<app>/SKILL.md .cursor/skills/verify-<app>/SKILL.md` also succeeds. Fix what fails, and run the generated cleanup after every failed iteration too, so broken attempts don't strand processes and ports. A generated skill that was never executed is a draft, not a deliverable.

## 5. Offer the maintenance loop

Point the user at `/maintain-verification-skill` for keeping the map honest as the app changes. Suggest a cadence only if they ask.
