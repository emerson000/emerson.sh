# emerson.sh

A modern Next.js personal website with support for MDX content.

## Quick Start

```bash
# Development server with hot reloading
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Runs content watcher and Next.js dev server with Turbopack |
| `npm run copy-content` | Copies content files to the appropriate directories |
| `npm run copy-content:watch` | Watches content files and copies them on changes |
| `npm run generate-icons` | Generates icon assets |
| `npm run build` | Copies content, generates icons, and builds the Next.js app |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs the linter |

## VS Code Launch Configurations

| Configuration | Description |
|---------------|-------------|
| `Debug: Firefox` | Launches Firefox with debugger attached to localhost:3000 |
| `Next.js: Run Dev` | Runs the development server |
| `Next.js: Build` | Builds the application |
| `Python: Serve Static Site` | Serves the static site from the `out` directory |

**Compound Configurations:**
- `Debug: Full Stack` - Runs dev server and Firefox debugger
- `Build and Serve` - Builds the app and serves it with Python

## Content System

This project uses MDX for content with a flexible type system.

### Content Types

Content is organized into directories under `content/` with each directory representing a content type. Each content type can have an `_index.mdx` file with the following frontmatter options:

```yaml
---
order: 1             # Controls display order in navigation (lower = higher priority)
nav: true            # Whether to show in navigation
show_in_recent: true # Whether to include in recent content listings
show_dates: true     # Whether to display dates for this content type
---
```

### Content Frontmatter

Individual content files support these frontmatter properties:

```yaml
---
title: "Post Title"    # Required: Title of the content
date: "2025-01-01"     # Required: Publication date
slug: "custom-slug"    # Optional: Override the default slug (filename)
excerpt: "Summary..."  # Optional: Short excerpt for previews
tags: ["tag1", "tag2"] # Optional: Tags for categorization
---
```

### Including Assets and Media

The content system supports associating media files with MDX content through a folder-based structure:

1. Create a folder with the same name as your MDX file
2. Place your assets in that folder
3. Reference them in your MDX content

**Example Structure:**
```
content/
  blog/
    my-article.mdx
    my-article/
      image1.jpg
      diagram.svg
      data.json
```

**In MDX Content:**
```mdx
---
title: "My Article"
date: "2025-01-01"
---

# My Article

Here's an image:

<CustomImage 
  src="/blog/my-article/image1.jpg" 
  alt="Example image" 
  caption="This is my example image" 
/>

And here's a diagram:

![Diagram](/blog/my-article/diagram.svg)
```

During the build process, the content copy script merges these files, making them available at the same URL path as your content.

## MDX Components

The following custom components are available in MDX content:

| Component | Description | Usage |
|-----------|-------------|-------|
| `Alert` | Styled alert box | `<Alert>Important info</Alert>` |
| `CodeBlock` | Syntax-highlighted code | `<CodeBlock language="js">code here</CodeBlock>` |
| `CustomImage` | Enhanced image with caption | `<CustomImage src="/image.jpg" alt="Description" />` |
| `Anchor` | Styled link | `<Anchor href="/">Link text</Anchor>` |
| `Checklist` | Interactive checklist | `<Checklist items={['Item 1', 'Item 2']} />` |
| `CryptonymGenerator` | Generates cryptonyms | `<CryptonymGenerator />` |
| `TableOfContents` | Auto-generated TOC | `<TableOfContents />` |

## Learn More

- [Next.js](https://nextjs.org/docs)
- [MDX](https://mdxjs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/docs)

## Deployment

The site is built for deployment on Vercel or Cloudflare Pages.

### Cloudflare Pages Deployment

This project is configured for deployment on Cloudflare Pages using Wrangler. The `wrangler.toml` file contains the deployment configuration.

To deploy to Cloudflare Pages:

```bash
# Build for production
npm run build

# Deploy using Wrangler
npx wrangler pages deploy out
```
The repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml` that automatically deploys the site to Cloudflare Pages when changes are pushed to the `main` or `develop` branches.
