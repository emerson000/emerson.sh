import { getCollection, type CollectionEntry } from "astro:content";

export const SITE = {
  name: "Emerson Stewart",
  url: "https://emerson.sh",
  description:
    "Technology and security professional. I run business systems by day, and build security and intelligence tools through Covert Signals, my independent project.",
  // Placeholder until Emerson confirms the address.
  email: "hello@emerson.sh",
  securityEmail: "security@emerson.sh",
  github: "https://github.com/emerson000",
};

export const PILLARS: Record<CollectionEntry<"writing">["data"]["pillar"], string> = {
  security: "Security & Privacy",
  osint: "OSINT & Intelligence",
  ai: "AI Agents & Engineering",
  building: "Building Companies",
  radio: "Radio",
};

export type Post = CollectionEntry<"writing">;

/**
 * Drafts show in `astro dev` and are left out of production builds.
 * `ES_SHOW_DRAFTS=1 npm run build` makes a local review build that includes them
 * (still noindex, and never in the RSS feed or sitemap). CI never sets it.
 */
export const showDrafts = import.meta.env.DEV || process.env.ES_SHOW_DRAFTS === "1";

/** URL slug: the file name without `.draft` and the extension. */
export const slugOf = (p: Post) => p.id.replace(/\.draft$/, "");

/** A `.draft` file is always a draft, whatever its front matter says. */
export const isDraft = (p: Post) => p.data.draft || p.id.endsWith(".draft");

/** The date an article sorts and lists by: its last substantial update, else first publication. */
export const listDate = (p: Post) => p.data.updated ?? p.data.date;

/**
 * Published writing (plus drafts in dev and review builds), newest first by `listDate`.
 * When drafts are shown, a draft with the same slug as a published article
 * replaces it, as a preview of the update. Each slug appears once.
 */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection("writing", (p) => showDrafts || !isDraft(p));
  const bySlug = new Map<string, Post>();
  for (const p of all) {
    const cur = bySlug.get(slugOf(p));
    if (!cur || (isDraft(p) && !isDraft(cur))) bySlug.set(slugOf(p), p);
  }
  return [...bySlug.values()].sort((a, b) => listDate(b).valueOf() - listDate(a).valueOf() || slugOf(a).localeCompare(slugOf(b)));
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Jan 24, 2026. Dates from YAML are midnight UTC, so read them in UTC. */
export const fmtDate = (d: Date) => `${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Minutes to read, at 230 words a minute, ignoring code fences and markup. */
export function readingMinutes(body = ""): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`|\-[\]()!]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export const postUrl = (p: Post) => `/writing/${slugOf(p)}/`;
export const absolute = (path: string) => new URL(path, SITE.url).toString();
