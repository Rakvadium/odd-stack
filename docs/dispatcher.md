# Dispatching odd-mode work into T3 Code

For a bot (such as Grok Bot) that starts T3 Code threads through the T3 MCP tools. A `/odd-mode` typed into a prompt sent over MCP is plain text, and nothing expands it. The first line of the prompt does that job instead.

## The lead

Launch every lead thread with `modelSelection: {"instanceId":"claudeAgent","model":"claude-opus-5-5","options":{"effort":"high"}}`, the `judgment and prose` line of `models.txt`. Without it, a launch from outside T3 gets the project's default model. The lead plans, routes each role per `models.txt`, reviews, and never builds. Never launch a lead on `cursor`. A `cursor` thread never reaches a terminal state in T3 Code (see odd-mode's Subagents section), so you would never see it finish.

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
2. Launch with `t3_thread_launch`. Pass `projectId` from `t3_project_list`, which a caller outside T3 must send, and the `modelSelection` above. Set `workspaceStrategy` to `{"type":"worktree","baseRef":"<branch the work starts from>","branch":"<new branch>","startFromOrigin":false}`, and put the prompt in `message`. Omitting `workspaceStrategy` runs the thread in the project's main checkout. Keep the project name plus the branch name under 46 characters. Cursor children in a longer worktree path hit a Windows path limit and replay their turns. This assumes T3's worktree location is set to `C:\wt`.
3. Keep the returned `threadId`. Send approvals and answers only through `t3_thread_send` on that id.

## Monitoring

Wait with `t3_thread_wait` on the `threadId`. On a timeout, call it again. When it returns, read the last assistant message with `t3_thread_read` and report from it, with any PR link. Never relaunch a thread that is still running or waiting.
