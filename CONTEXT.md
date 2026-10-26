# Portable skill stacks

A format and tooling for authoring, installing, observing and verifying agent skill stacks across harnesses. oddstack is the stack used to prove the format; the format does not depend on it.

## Language

### People

**Author**:
A person who writes and publishes a stack.

**Adopter**:
A person who installs someone else's stack, learns it, tweaks it, and runs it in their own harnesses. The primary user.
_Avoid_: User, consumer

### Stacks

**Stack**:
A published set of skills, with the vocabulary and rules that bind them, meant to be installed and run as a whole.
_Avoid_: Skill pack, plugin

**Skill**:
One named unit of agent instructions within a stack.

**Stack vocabulary**:
The terms a particular stack defines for itself (such as oddstack's "playbook" or "principle"), loaded in every session the stack runs in.
_Avoid_: Glossary, domain vocabulary

### Trust

**Trust ladder**:
The ordered rungs an adopter climbs before relying on a stack: Read, Watch, Check, Change, Delegate.

**Read** (rung 1):
The adopter can see the whole stack's shape and what each part is for.

**Watch** (rung 2):
The adopter can see, for a real request, what the stack did and why.

**Check** (rung 3):
The adopter can run repeatable tests asserting the stack behaves as claimed in a given harness.

**Change** (rung 4):
The adopter can alter a skill and see what that did to behaviour.

**Delegate** (rung 5):
The adopter lets the stack run unattended because the lower rungs hold.

### Where work runs

**Harness**:
The program an agent runs inside, such as Claude Code, Cursor, Codex, or the Grok CLI.
_Avoid_: Environment, env

**Model assignment**:
Which provider and model fills a given role.
