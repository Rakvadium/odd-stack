#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SKILL_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const STEP = /^(\d+)\. (.*)$/;
const ITEM = /^\s*- \[([ x])\] (?:\d+\. )?(.*)$/;
// The check runs inside Opening a PR, so any step that runs it is still open.
const EXEMPT = "Run **Opening a PR**";

const git = (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" });

let file = process.argv[2];
if (!file) {
	const top = git(["rev-parse", "--show-toplevel"], process.cwd());
	if (top.status !== 0) {
		console.error("check-todo: not in a git repository and no file given");
		process.exit(1);
	}
	file = path.join(top.stdout.trim(), ".odd-todo.md");
}
const display = path.relative(process.cwd(), path.resolve(file)) || file;

if (!fs.existsSync(file)) {
	console.error(`${display}: missing`);
	process.exit(1);
}

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const problems = [];

const fileDir = path.dirname(path.resolve(file));
if (git(["ls-files", "--error-unmatch", "--", path.basename(file)], fileDir).status === 0) {
	problems.push(`${display}: tracked by git, untrack it and add it to info/exclude`);
}

const playbooks = lines.map((line) => /^Playbook:\s*(\S.*?)\s*$/.exec(line)?.[1]).filter(Boolean);
if (playbooks.length === 0) problems.push(`${display}: no "Playbook:" line`);

const items = lines.map((line) => ITEM.exec(line)).filter(Boolean).map((m) => ({ done: m[1] === "x", text: m[2] }));
const short = (text) => (text.length > 30 ? `${text.slice(0, 30).trimEnd()}...` : text);

let checked = 0;
for (const playbook of playbooks) {
	const playbookPath = path.resolve(SKILL_DIR, playbook);
	if (!fs.existsSync(playbookPath)) {
		problems.push(`${display}: ${playbook} does not exist in ${SKILL_DIR}`);
		continue;
	}
	const steps = fs
		.readFileSync(playbookPath, "utf8")
		.split(/\r?\n/)
		.map((line) => STEP.exec(line))
		.filter(Boolean)
		.map((m) => ({ n: m[1], text: m[2].trim() }))
		.filter((step) => !step.text.includes(EXEMPT));
	for (const step of steps) {
		checked++;
		const matches = items.filter((item) => item.text.startsWith(step.text));
		const where = `${display}: ${playbook} step ${step.n}`;
		if (matches.length === 0) {
			problems.push(`${where} has no checklist item: "${short(step.text)}"`);
		} else if (!matches.some((item) => item.done || /skip:\s*\S/.test(item.text.slice(step.text.length)))) {
			problems.push(`${where} not done or skipped: "${short(step.text)}"`);
		}
	}
}

for (const p of problems) console.error(p);
if (problems.length) process.exit(1);

console.log(`${display}: ${checked} playbook steps done or skipped`);
