import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { parse } from "yaml";

export const PILLAR_KEYS = ["security", "osint", "ai", "building", "radio"] as const;

// Drafts (<slug>.draft.md / .draft.mdx, gitignored) load only in `astro dev`
// and in ES_SHOW_DRAFTS=1 review builds. See src/lib/drafts.mjs.
const showDrafts = import.meta.env.DEV || process.env.ES_SHOW_DRAFTS === "1";

// Articles. Slug = file name, so src/content/writing/foo.md is /writing/foo/.
// .md files are normal articles (editable in Sveltia). .mdx is only for
// `layout: feature` articles with interactive components.
// The id keeps a `.draft` suffix (foo.draft.md -> "foo.draft") so a draft and a
// published article with the same slug can coexist; src/lib/site.ts strips it
// for the URL and lets the draft replace the published one when drafts are shown.
// Files in subfolders are allowed, but the folder is not part of the URL, so
// file names must be unique across folders.
const writing = defineCollection({
  loader: glob({
    pattern: showDrafts ? ["**/[^_]*.{md,mdx}"] : ["**/[^_]*.{md,mdx}", "!**/*.draft.{md,mdx}"],
    base: "./src/content/writing",
    generateId: ({ entry }) => entry.replace(/^.*\//, "").replace(/\.mdx?$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    pillar: z.enum(PILLAR_KEYS),
    tags: z.array(z.string()).default([]),
    layout: z.enum(["standard", "feature"]).default("standard"),
    toc: z.boolean().default(false),
    // Prefer naming the file <slug>.draft.md: a .draft file is never committed.
    draft: z.boolean().default(false),
  }),
});

// About and Now.
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    updated: z.coerce.date(),
    description: z.string().optional(),
    // Now page only: the short list shown on the home page.
  }),
});

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// The YAML files are plain top-level lists so they stay easy to edit by hand and in Sveltia.
const work = defineCollection({
  loader: file("src/data/work.yaml", {
    parser: (text) => (parse(text) as { name: string }[]).map((x, order) => ({ id: slug(x.name), order, ...x })),
  }),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    kind: z.string(),
    role: z.string(),
    status: z.string().optional(),
    // One line for the home page. Falls back to `description`.
    summary: z.string().optional(),
    description: z.string(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  }),
});

const uses = defineCollection({
  loader: file("src/data/uses.yaml", {
    parser: (text) => (parse(text) as { group: string }[]).map((x, order) => ({ id: slug(x.group), order, ...x })),
  }),
  schema: z.object({
    order: z.number(),
    group: z.string(),
    items: z.array(z.object({ name: z.string(), href: z.url(), note: z.string() })),
  }),
});

export const collections = { writing, pages, work, uses };
