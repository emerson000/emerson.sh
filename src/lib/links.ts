import { getPosts, isDraft, slugOf } from "./site";

/** Drops links to /writing/<slug>/ articles that are not published. */
export async function liveLinks<T extends { href: string }>(links: T[]): Promise<T[]> {
  const ids = new Set((await getPosts()).filter((p) => !isDraft(p)).map(slugOf));
  return links.filter((l) => {
    const m = l.href.match(/^\/writing\/([^/]+)\/?$/);
    return !m || ids.has(m[1]);
  });
}
