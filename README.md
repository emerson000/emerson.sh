# emerson.sh

The personal site of Emerson Stewart. It is a static site built with [Astro 7](https://astro.build), edited in [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin`, and deployed to Cloudflare Pages by GitHub Actions.

## Run it

You need Node 22.23.4 or later (the CI uses Node 24).

```bash
npm ci
npm run dev        # http://localhost:4321, with drafts shown
npm run build      # static site in dist/, drafts left out
npm run preview    # serves dist/ at http://localhost:4321
npm run check      # astro check: types and content front matter
npm run check:drafts   # no drafts or review notes in files git would commit
```

`npm run preview` does not apply `public/_redirects` or `public/_headers`. To test those, use Cloudflare's local server (no login needed):

```bash
npx wrangler pages dev dist --port 8788
```

## Where things are

| Path | What it holds |
|---|---|
| `src/content/writing/` | Articles. One file per article. The file name is the URL: `foo.md` is `/writing/foo/`. |
| `src/content/pages/` | `about.md` |
| `src/data/work.yaml` | Work page entries (and the Work list on the home page) |
| `src/data/uses.yaml` | Uses page, grouped |
| `src/content.config.ts` | The front matter schema. A build fails if a file does not match it. |
| `src/layouts/` | `Base` (head, header, footer), `Article` (standard), `Feature`, `Page` |
| `src/components/` | Site components. `src/components/feature/` holds the interactive pieces for feature articles. |
| `src/lib/markdown-plugins.mjs` | Build-time Markdown plugins: callouts and checklists |
| `src/scripts/` | Browser scripts: checklists, table-of-contents highlight, cryptonym generator |
| `scripts/check-no-drafts.mjs` | Refuses to build or commit drafts and review notes (see "Drafts and the public repo") |
| `src/styles/global.css` | All site CSS. Tokens at the top. |
| `public/` | Copied as is: `_redirects`, `_headers`, `.well-known/security.txt`, `admin/`, `tools/cryptonyms/nouns.json`, `theme.js` |

## Content model

Every article starts with YAML front matter:

```yaml
---
title: "Ransomware-proof backups, tested"
description: "One sentence, at most 160 characters. Shown under the title and used as the search description."
date: 2026-09-27          # first published
updated: 2026-10-02       # optional; set it for a substantial revision
pillar: security          # security | osint | ai | building | radio
tags: [backups, kopia]    # optional, lowercase
layout: standard          # standard (default) or feature
toc: true                 # optional; lists the H2 sections beside the article
draft: false              # optional; prefer a .draft.md file name (below)
---
```

### Drafts and the public repo

The GitHub repo is public, so anything committed is public, including old commits. Unreviewed writing must never be committed.

- **Name an unreviewed article `<slug>.draft.md`** (or `.draft.mdx`). `.gitignore` excludes these files, so they stay on your machine. The URL is unchanged: `foo.draft.md` previews at `/writing/foo/`.
- **A `.draft` file is always a draft**, whatever its front matter says. Drafts show in `npm run dev` with a "Draft" badge, and in a local review build (`ES_SHOW_DRAFTS=1 npm run build`). Production builds never load them, so they are not in any page, the RSS feed, the sitemap or the share images.
- **Updating a published article:** copy `foo.md` to `foo.draft.md` and edit the copy. When drafts are shown, the draft replaces the published version (one entry, same URL). To publish, move the draft over the original: `mv foo.draft.md foo.md`.
- **To publish a new article:** rename `foo.draft.md` to `foo.md`, make sure it has no `draft: true`, and commit.
- **Review notes** (sources, redactions, fact-check questions) go in the private planning folder, never in front matter. The draft check (below) rejects a committed `reviewNotes` key.
- **Safety net:** `scripts/check-no-drafts.mjs` fails if any tracked or staged file under `src/content` has a `.draft.` name, `draft: true` or `reviewNotes`. It runs at the start of `npm run build`, so CI refuses to deploy such a commit; it is skipped in `ES_SHOW_DRAFTS=1` builds. `npm run check:drafts` also checks untracked files (what `git add -A` would add). To check before every commit, add it as a git hook:

  ```bash
  printf '#!/bin/sh\nexec node scripts/check-no-drafts.mjs\n' > .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  ```

### Other publishing rules

- **Order.** Index pages list articles by `updated`, or by `date` when there is no update. The RSS feed uses `date`, so backdated articles keep their place in feed readers.
- **Share images** are made at build time for each article (`/og/<slug>.png`) and for the site (`/og/_default.png`).

### Writing Markdown

Normal articles are plain Markdown (`.md`). Besides the usual Markdown and GitHub tables, footnotes and strikethrough, three things are special:

**Section numbers.** Each `##` heading gets a number (01, 02, …) from CSS. Do not type the numbers.

**Callouts.** Use GitHub's alert syntax. Text after the marker on the first line becomes a bold title; inline markup (bold, code, links) in it is kept.

```markdown
> [!WARNING] Error and crash during read
> The CPS may crash with the error **GetOptionFromCommData_Error**.
```

The types are `NOTE`, `TIP`, `IMPORTANT`, `WARNING` and `CAUTION`. Warnings and cautions are tinted amber.

**Checklists.** A task list becomes an interactive checklist with a progress count ("2 of 5 done") and a Reset button. Checked items are saved in the reader's browser. The first line of an item is the setting. Put the reason on the next line, indented, and it shows in gray below:

```markdown
- [ ] Automatic Updates: `On`
  Most iPhone compromises use flaws Apple has already patched.
- [ ] Stolen Device Protection: `On`
```

`- [x]` items render checked even without JavaScript. Checked states are stored per list, under the heading above the list, and per item, under the text of the setting. If you rename a heading or a setting, readers lose the ticks for it. Without JavaScript the boxes still work; they are not saved.

**Code.** Fenced code blocks with a language name are highlighted at build time with Shiki, in a light and a dark theme.

#### How this works under Sätteri

Astro 7 renders Markdown with Sätteri, a Rust Markdown processor. Sätteri does not run remark or rehype plugins, and setting `markdown.remarkPlugins` or `markdown.rehypePlugins` breaks the build. Sätteri has its own plugin API instead. `astro.config.mjs` passes two Sätteri hast plugins from `src/lib/markdown-plugins.mjs` to `satteri({ hastPlugins })`:

- `calloutsPlugin` turns a blockquote that starts with `[!TYPE]` into `<aside class="callout">`.
- `checklistsPlugin` turns a GFM task list into the checklist markup. `src/scripts/checklists.ts` adds the saving, the count and Reset.

Both plugins run for `.md` and `.mdx`. The table of contents is built from the `headings` that `render()` returns, with no browser script. A small script highlights the current section.

### Writing a feature article

Feature articles are the occasional deep dives with scroll-driven graphics. They are `.mdx` files, so they can import components. Sveltia does not show them, so edit them in code.

1. Create `src/content/writing/<slug>.mdx` with `layout: feature` in the front matter.
2. Put the components in `src/components/feature/` and import them at the top of the file:

   ```mdx
   import BlastRadius from "../../components/feature/BlastRadius.astro";

   <p class="dropcap">The advisory arrived on a Tuesday afternoon.</p>

   <BlastRadius />
   ```

3. The feature layout places every top-level element in the 68-character reading column. Give an element `class="wide"` to span the page width (1120px), or `class="full-bleed"` to span the whole window.
4. Callouts, checklists, section numbers and code highlighting work the same as in `.md`.
5. Respect reduced motion: animate only inside `@media (prefers-reduced-motion: no-preference)`, and make sure the content reads without the animation. Use only `'self'` scripts; the Content-Security-Policy blocks inline scripts and other origins.

## Editing in Sveltia CMS

The editor is at `https://emerson.sh/admin/`. It loads the newest Sveltia release from unpkg. If a release breaks the editor, pin a version in `public/admin/index.html`, for example `https://unpkg.com/@sveltia/cms@0.256.1/dist/sveltia-cms.js`.

The editor shows three groups: **Writing** (the published `.md` articles; `.mdx` features are left out), **Pages** (About) and **Data** (Work, Uses). Each save is a commit to `main` of the public repo, which deploys the site within minutes. There is no draft state in the editor: anything saved there is public. Write and review drafts locally as `<slug>.draft.md` (see "Drafts and the public repo") and bring them into the editor only when approved. The article body opens in raw Markdown mode, because the rich text editor may rewrite task lists and callouts. Dates are saved as `YYYY-MM-DD` in UTC (`picker_utc`), so they never shift with your time zone.

### Sign in with a GitHub token

1. On GitHub, open **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Set **Repository access** to **Only select repositories** and pick `emerson000/emerson.sh`.
3. Under **Repository permissions**, set **Contents** to **Read and write**. Metadata becomes read-only by itself.
4. Pick an expiry date and generate the token.
5. Open `/admin/`, choose **Sign In with Token**, and paste the token. Sveltia keeps it in this browser's local storage. Rotate it before it expires.

To edit without a token, run `npm run dev`, open `http://localhost:4321/admin/index.html` in Chrome or Edge, and choose **Work with Local Repository**. Changes are written to your clone; commit them yourself.

### Put Cloudflare Access in front of /admin (manual)

Sveltia loads the newest release from unpkg on every visit (the owner's choice: no pinned version, no SRI). The risk: a bad or compromised Sveltia release, or an unpkg incident, would run on the admin page, where it can read the GitHub token in local storage and push to `main`, which deploys. Access does not remove that risk, but it means only you ever load the admin page, and scanners never see it. Keep the token fine-grained (this repo, Contents only) and short-lived, and protect `main` against force-pushes so history can be repaired.

Every hostname that serves `/admin/` must be covered:

| Hostname | What serves it |
|---|---|
| `emerson.sh` | production |
| `develop.emerson.sh` | the `develop` branch alias |
| `*.emerson-sh.pages.dev` | every Pages deployment, including `emerson-sh.pages.dev`, branch aliases and per-commit URLs of `main` |

CI also deletes `dist/admin` from every non-`main` build, so preview deployments have no CMS at all; per-commit URLs of `main` deployments still do, hence the wildcard.

1. In the Cloudflare dashboard, open **Zero Trust → Access → Applications → Add an application → Self-hosted**.
2. Name it "emerson.sh admin". Add three public hostnames, each with the path `admin`: `emerson.sh`, `develop.emerson.sh`, and `*.emerson-sh.pages.dev` (subdomain `*`, domain `emerson-sh.pages.dev`). Add a fourth for `emerson-sh.pages.dev` itself if the dashboard does not treat the wildcard as covering the bare domain.
3. Add a policy: **Action** Allow, **Include** Emails, and your own address. Under **Authentication**, allow one-time PIN, or a passkey through your identity provider.
4. Save. In a private window, check that Access asks you to sign in at `https://emerson.sh/admin/`, `https://develop.emerson.sh/admin/` and a per-commit URL such as `https://<hash>.emerson-sh.pages.dev/admin/`. Also check that `https://emerson.sh/admin/config.yml` is blocked.

`/admin/*` has its own, looser Content-Security-Policy in `public/_headers` (it needs unpkg, jsDelivr for Sveltia's fonts, and the GitHub API) and is `noindex`.

## Deploy

`.github/workflows/deploy.yml` runs on every push to `main` (production) and `develop` (preview). It installs with `npm ci`, runs `astro check`, builds, and deploys `dist/` to the Cloudflare Pages project `emerson-sh` with `wrangler pages deploy`. `npm run build` starts with `scripts/check-no-drafts.mjs`, so a commit that contains a draft or review notes fails before anything deploys. Preview builds (any branch except `main`) get an `X-Robots-Tag: noindex` header and no `/admin/`. Wrangler is pinned in the workflow (`wranglerVersion`).

Repository settings it needs:

| Name | Kind | What |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Secret | API token with **Cloudflare Pages: Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | The Cloudflare account ID |
| `PUBLIC_CF_BEACON_TOKEN` | Variable (optional) | Cloudflare Web Analytics site token. Used only for `main` builds. When it is not set, no analytics script is added. |

### Redirects, headers and security.txt

- `public/_redirects` sends the old URLs to the new ones with 301s: `/blog/*` to `/writing/*`, `/lists/*` to `/uses/`, and `/blog/cryptonyms` (and its `nouns.json`) to `/tools/cryptonyms/`.
- `public/_headers` sets the Content-Security-Policy, HSTS and the other security headers. The site's own scripts are files under `/_astro/` and `/theme.js`, so the policy needs no `'unsafe-inline'` for scripts.
- `public/.well-known/security.txt` expires on 2027-10-01 (RFC 9116 asks for less than a year). Renew the `Expires` line before then. Uncomment the `Encryption` line when a PGP key is published at `/pgp.asc`.

## Open items

- Confirm the contact address (`hello@emerson.sh` is a placeholder) in `src/lib/site.ts`.
- Publish a PGP key, then update the Contact page and `security.txt`.
- Write the About page biography (two or three paragraphs: responsibilities, the problems you work on, the thread between business systems, security and intelligence; no employer or location).
- Add CommCrate's build guide and source links to `src/data/work.yaml`.
