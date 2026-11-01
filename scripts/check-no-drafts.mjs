#!/usr/bin/env node
// Safety net for a public repo: fails if any file under src/content that git
// tracks, or that is staged for commit, is a draft or carries review notes.
//
//   - a `.draft.` file name (drafts are <slug>.draft.md and are gitignored)
//   - `draft: true` in the front matter
//   - a `reviewNotes:` key in the front matter
//
// Runs before `npm run build` (skipped when ES_SHOW_DRAFTS=1), so CI refuses to
// deploy a commit that contains a draft. Pass --untracked to also check files
// git doesn't know about yet (what `git add -A` would add).
// Optional pre-commit hook: see README.md, "Drafts and the public repo".
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

if (process.env.ES_SHOW_DRAFTS === "1") {
  console.log("check-no-drafts: skipped (ES_SHOW_DRAFTS=1 review build)");
  process.exit(0);
}

const git = (...args) => {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean);
  } catch {
    return null;
  }
};

const tracked = git("ls-files", "--", "src/content");
if (tracked === null) {
  console.log("check-no-drafts: skipped (not a git checkout)");
  process.exit(0);
}
const staged = git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "--", "src/content") ?? [];
const untracked = process.argv.includes("--untracked") ? git("ls-files", "--others", "--exclude-standard", "--", "src/content") ?? [] : [];

const files = [...new Set([...tracked, ...staged, ...untracked])].filter((f) => /\.(md|mdx|ya?ml|json)$/.test(f));
const problems = [];
for (const f of files) {
  if (/\.draft\./.test(f)) problems.push(`${f}: draft file name (.draft.) must not be committed`);
  if (!existsSync(f)) continue;
  // Staged content is what will be committed; fall back to the working copy.
  let text = staged.includes(f) ? (git("show", `:${f}`) ?? []).join("\n") : readFileSync(f, "utf8");
  text = text.replace(/\r\n/g, "\n");
  const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  if (/^draft:\s*true\s*(#.*)?$/m.test(fm)) problems.push(`${f}: draft: true`);
  if (/^reviewNotes\s*:/m.test(fm)) problems.push(`${f}: reviewNotes in front matter (keep review notes out of the public repo)`);
}

if (problems.length) {
  console.error("check-no-drafts: these files must not be committed to the public repo:");
  for (const p of problems) console.error(`  - ${p}`);
  console.error("Rename unreviewed articles to <slug>.draft.md (gitignored), set draft: false when approved, and move review notes to the private handoff folder.");
  process.exit(1);
}
console.log(`check-no-drafts: ok (${files.length} files checked)`);
