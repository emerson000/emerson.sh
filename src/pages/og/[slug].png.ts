import type { APIContext } from "astro";
import { PILLARS, getPosts, slugOf, type Post } from "../../lib/site";
import { ogImage } from "../../lib/og";

export async function getStaticPaths() {
  const posts = await getPosts();
  return [
    { params: { slug: "_default" }, props: { title: "Technology and security professional. Writing on security, intelligence and building with AI agents.", kicker: "emerson.sh" } },
    ...posts.map((p: Post) => ({
      params: { slug: slugOf(p) },
      props: { title: p.data.title, kicker: `${p.data.layout === "feature" ? "Feature · " : ""}${PILLARS[p.data.pillar]}` },
    })),
  ];
}

export async function GET({ props }: APIContext) {
  const png = await ogImage(props as { title: string; kicker: string });
  return new Response(png as BodyInit, { headers: { "Content-Type": "image/png" } });
}
