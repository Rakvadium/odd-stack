### Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and the fix to subagents, stay in the lead.

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix. It does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more.

1. Reproduce it yourself on the matching surface via the repo's verify skill and the control skill (Non-negotiables), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with `how` over the affected subsystem and the **why** skill for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, have a child add instrumentation or logging, and read it as the code runs. Don't guess. Drive a long or stubborn hunt with Cursor's `/loop` command. Confirm the surviving *mechanism* with runtime evidence before step 4's architect pass.
3. A child writes the repro, a failing test or a repro script that drives the failure. It lands as its own commit before step 4 delegates the fix. The fix child never edits, amends, or squashes that commit. The **tdd** skill decides only unit test versus script. Its skip rule and its fix step do not apply here.
   This is the canonical **sequence-verifiable-units** principle skill, the failing repro first and the fix on top.
4. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent at any diff size (Subagents) using your configured bug-fix model (`bug-fix` in `../models.txt`, default `grok-4.7-high-fast`) with a specific scope.
5. Verify on the same surface via the repo's verify skill (Non-negotiables). The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
6. Run **Opening a PR**.

**Reply:** what was broken, root cause, fix, how you verified. Paste failing-then-passing repro output verbatim.
