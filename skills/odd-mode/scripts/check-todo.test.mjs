import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, "check-todo.mjs");
const readSteps = (playbook) =>
	fs
		.readFileSync(path.join(here, "..", "playbooks", playbook), "utf8")
		.split(/\r?\n/)
		.filter((line) => /^\d+\. /.test(line));
const steps = readSteps("authoring-a-skill.md");
const opening = steps.findIndex((step) => step.includes("Run **Opening a PR**"));
const summary = (checked) => `.odd-todo.md: ${checked} playbook steps done or skipped`;

const dirs = [];
after(() => {
	for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
});

const run = (lines, { commit = false } = {}) => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-todo-"));
	dirs.push(dir);
	execFileSync("git", ["init", "-q"], { cwd: dir });
	if (lines) fs.writeFileSync(path.join(dir, ".odd-todo.md"), lines.join("\r\n"));
	if (commit) {
		execFileSync("git", ["add", ".odd-todo.md"], { cwd: dir });
		execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "todo"], { cwd: dir });
	}
	const result = spawnSync(process.execPath, [script], { cwd: dir, encoding: "utf8" });
	return { code: result.status, out: result.stdout + result.stderr };
};

const todo = (mark, playbook = "authoring-a-skill.md", list = steps) => [
	`Playbook: playbooks/${playbook}`,
	"",
	...list.map((step, i) => mark(step, i)),
];
const allDone = todo((step) => `- [x] ${step}`);

test("missing file fails", () => {
	const { code, out } = run(null);
	assert.equal(code, 1);
	assert.match(out, /\.odd-todo\.md: missing/);
});

test("unaccounted step fails and names it", () => {
	const { code, out } = run(todo((step, i) => (i === 1 ? "- [x] something else" : `- [x] ${step}`)));
	assert.equal(code, 1);
	assert.ok(out.includes("playbooks/authoring-a-skill.md step 2 has no checklist item"), out);
});

test("skip with a reason passes", () => {
	const { code, out } = run(todo((step, i) => (i === 0 ? `- [ ] ${step} skip: not installed` : `- [x] ${step}`)));
	assert.equal(code, 0, out);
	assert.ok(out.includes(summary(steps.length - 1)), out);
});

test("skip with an empty reason fails", () => {
	const { code, out } = run(todo((step, i) => (i === 0 ? `- [ ] ${step} skip: ` : `- [x] ${step}`)));
	assert.equal(code, 1);
	assert.ok(out.includes("step 1 not done or skipped"), out);
});

test("all done passes", () => {
	const { code, out } = run(allDone);
	assert.equal(code, 0, out);
	assert.ok(out.includes(summary(steps.length - 1)), out);
});

test("tracked file fails", () => {
	const { code, out } = run(allDone, { commit: true });
	assert.equal(code, 1);
	assert.ok(out.includes("tracked by git"), out);
});

test("unchecked Opening a PR step passes", () => {
	assert.notEqual(opening, -1);
	const { code, out } = run(todo((step, i) => `- [${i === opening ? " " : "x"}] ${step}`));
	assert.equal(code, 0, out);
	assert.ok(out.includes(summary(steps.length - 1)), out);
});

test("unchecked step that runs Opening a PR mid-step passes", () => {
	const refactoring = readSteps("refactoring.md");
	const last = refactoring.length - 1;
	assert.ok(refactoring[last].startsWith("8. ") && refactoring[last].includes("Run **Opening a PR**"));
	const { code, out } = run(
		todo((step, i) => `- [${i === last ? " " : "x"}] ${step}`, "refactoring.md", refactoring),
	);
	assert.equal(code, 0, out);
	assert.ok(out.includes(summary(refactoring.length - 1)), out);
});
