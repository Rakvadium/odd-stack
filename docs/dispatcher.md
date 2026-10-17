# Dispatching odd-mode work into T3 Code

For a bot (such as Grok Bot) that starts T3 Code threads through the T3 MCP tools. A `/odd-mode` typed into a prompt sent over MCP is plain text, and nothing expands it. The first line of the prompt does that job instead.

## The lead

Launch every lead thread on `claudeAgent` with `claude-opus-5-5`. The lead plans, routes each role per `models.txt`, reviews, and never builds. A lead on `cursor` never reaches a terminal state in T3 Code (see odd-mode's Subagents section), so `t3_thread_wait` on it would never return.

Do not pick models for the lead's children. The lead reads `models.txt` from the repo it runs in.

## The prompt

Fill every field. Leave none out and add none.

```
Read `C:\Users\xenos\.agents\skills\odd-mode\SKILL.md` and follow it, starting with harness.md beside it.
Playbook: <one playbook name from odd-mode's Playbooks list, or "match it">
Goal: <one sentence, the outcome>
Done when: <checkable criteria, one per line>
Constraints: <what not to touch>. Do not merge or deploy.
Gate: write the plan to a file on the branch, then stop and wait for approval before building.
```

Use the absolute path on the first line. A repo-relative path such as `skills/odd-mode/SKILL.md` only resolves inside the odd-stack repo. Drop the Gate line only when the operator says to skip plan approval.

## Launching

1. Run `t3_thread_list` with `titleContains` set to the planned title. If a thread for this request already exists, send to it or report it. Never launch a second one. `t3_thread_launch` has no idempotency key, so a retried launch makes a duplicate thread.
2. Launch with `t3_thread_launch`, `workspaceStrategy` set to a new worktree, and the prompt in `message`.
3. Keep the returned `threadId`. Send approvals and answers only through `t3_thread_send` on that id.

## Monitoring

Wait with `t3_thread_wait` on the `threadId`. On a timeout, call it again. When it returns, read the last assistant message with `t3_thread_read` and report from it, with any PR link. Never relaunch a thread that is still running or waiting.
