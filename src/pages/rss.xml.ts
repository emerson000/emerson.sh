import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { PILLARS, SITE, isDraft, postUrl } from "../lib/site";

// The feed never includes drafts, even in dev or review builds.
export async function GET(context: APIContext) {
  const posts = (await getCollection("writing", (p) => !isDraft(p))).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: `${SITE.name}: writing`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: true,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: [PILLARS[p.data.pillar], ...p.data.tags],
    })),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<language>en-us</language><atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml"/>`,
  });
}
