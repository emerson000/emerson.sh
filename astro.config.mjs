import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import { calloutsPlugin, checklistsPlugin, layoutFrontmatterPlugin } from "./src/lib/markdown-plugins.mjs";
import { draftPaths } from "./src/lib/drafts.mjs";

const site = "https://emerson.sh";
const drafts = draftPaths();

export default defineConfig({
  site,
  trailingSlash: "always",
  build: {
    format: "directory",
    // Keep CSS in files so the Content-Security-Policy can stay `style-src 'self'`.
    inlineStylesheets: "never",
  },
  integrations: [
    mdx(),
    sitemap({
      // Drafts are not built in production; this also keeps them out of review builds' sitemaps.
      filter: (page) => !drafts.some((p) => page.endsWith(p)),
    }),
  ],
  markdown: {
    // Sätteri (Astro 7's default processor) runs its own hast plugins, not rehype plugins.
    processor: satteri({
      mdastPlugins: [layoutFrontmatterPlugin],
      hastPlugins: [calloutsPlugin, checklistsPlugin],
      features: { definitionList: true },
    }),
    shikiConfig: {
      themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
      defaultColor: false,
      wrap: false,
    },
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
