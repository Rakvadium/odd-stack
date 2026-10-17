#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";

const mapPath = "skills/odd-mode/models.txt";
const entryPattern = /^(inherit|\S+ \S+( [A-Za-z_]+=\S+)*)$/;
const errors = [];

const roles = new Map();
for (const [index, raw] of fs.readFileSync(mapPath, "utf8").split(/\r?\n/).entries()) {
	const line = raw.trim();
	if (!line || line.startsWith("#")) continue;
	const where = `${mapPath}:${index + 1}`;
	const colon = line.indexOf(":");
	if (colon === -1) {
		errors.push(`${where}: no "<role>:"`);
		continue;
	}
	const role = line.slice(0, colon).trim();
	if (roles.has(role)) errors.push(`${where}: duplicate role "${role}"`);
	roles.set(role, where);
	for (const entry of line.slice(colon + 1).split("|").map((e) => e.trim())) {
		if (!entryPattern.test(entry)) errors.push(`${where}: bad entry "${entry}"`);
	}
}

const docs = execFileSync("git", ["ls-files", "-z", "--", "skills/*.md"], { encoding: "utf8" })
	.split("\0")
	.filter(Boolean);
const referencePatterns = [/`([^`]+)` line\b/g, /\(`([^`]+)` in `\.\.\/models\.txt`/g, /\| `([^`]+)` \| `references\//g];
let referenceCount = 0;
for (const doc of docs) {
	const text = fs.readFileSync(doc, "utf8");
	for (const pattern of referencePatterns) {
		for (const match of text.matchAll(pattern)) {
			if (match[1].includes(":")) continue;
			referenceCount++;
			if (!roles.has(match[1])) errors.push(`${doc}: reads role "${match[1]}", which ${mapPath} has no line for`);
		}
	}
}

for (const error of errors) console.error(error);
if (errors.length) process.exit(1);
console.log(`${roles.size} roles parse, and ${referenceCount} role reads in skills all resolve`);
