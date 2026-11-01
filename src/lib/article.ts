import { SITE, absolute, isoDate, postUrl, slugOf, type Post } from "./site";

export function articleJsonLd(post: Post) {
  const url = absolute(postUrl(post));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.data.title,
    description: post.data.description,
    datePublished: isoDate(post.data.date),
    dateModified: isoDate(post.data.updated ?? post.data.date),
    url,
    mainEntityOfPage: url,
    image: absolute(`/og/${slugOf(post)}.png`),
    keywords: post.data.tags.join(", ") || undefined,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Person", name: SITE.name, url: SITE.url },
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    jobTitle: "Technology and security professional",
    description: SITE.description,
    sameAs: [SITE.github],
  };
}
