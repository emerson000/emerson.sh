// Draft handling shared by astro.config.mjs, src/content.config.ts and src/lib/site.ts.
//
// The GitHub repo is public, so unreviewed articles must never be committed.
// They are named <slug>.draft.md (or .draft.mdx), which .gitignore excludes.
// A .draft file is always a draft, whatever its front matter says. Drafts are
// only loaded by `astro dev` and by review builds (ES_SHOW_DRAFTS=1).
// scripts/check-no-drafts.mjs is the safety net for anything that slips through.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DRAFT_FILE = /\.draft\.mdx?$/;

/** Front matter `draft: true` (tolerates CRLF and trailing comments). */
export function hasDraftFlag(text) {
  const fm = text.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---/);
  return !!fm && /^draft:\s*true\s*(#.*)?$/m.test(fm[1]);
}

/** URL paths of drafts that have no published version, for the sitemap filter. */
export function draftPaths(dir = "src/content/writing") {
  let files = [];
  try {
    files = readdirSync(dir, { recursive: true }).filter((f) => /\.mdx?$/.test(f));
  } catch {
    return [];
  }
  const slug = (f) => f.split("/").pop().replace(/(\.draft)?\.mdx?$/, "");
  const isDraft = (f) => DRAFT_FILE.test(f) || hasDraftFlag(readFileSync(join(dir, f), "utf8"));
  const published = new Set(files.filter((f) => !isDraft(f)).map(slug));
  return [...new Set(files.filter(isDraft).map(slug))].filter((s) => !published.has(s)).map((s) => `/writing/${s}/`);
}
