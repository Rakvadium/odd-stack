#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const files = execFileSync("git", ["ls-files", "-z", "--", "*SKILL.md"], {
	encoding: "utf8",
})
	.split("\0")
	.filter(Boolean);

const frontmatterName = (raw) => {
	const lines = raw.split(/\r?\n/);
	if (lines[0] !== "---") return undefined;
	const end = lines.indexOf("---", 1);
	if (end === -1) return undefined;
	for (const line of lines.slice(1, end)) {
		const match = /^name:\s*(.*)$/.exec(line);
		if (!match) continue;
		const trimmed = match[1].trim();
		if (
			trimmed.length >= 2 &&
			((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
				(trimmed.startsWith("'") && trimmed.endsWith("'")))
		) {
			return trimmed.slice(1, -1).trim();
		}
		return trimmed;
	}
	return undefined;
};

const records = files.map((file) => ({
	path: file,
	folder: path.basename(path.dirname(file)),
	name: frontmatterName(fs.readFileSync(file, "utf8")),
}));

const mismatches = records.filter((record) => record.name !== record.folder);
for (const record of mismatches) {
	if (record.name === undefined) {
		console.error(`${record.path}: missing frontmatter name`);
	} else {
		console.error(
			`${record.path}: name "${record.name}" does not match folder "${record.folder}"`,
		);
	}
}
if (mismatches.length) process.exit(1);

console.log(`${records.length} skill names match their folders`);
