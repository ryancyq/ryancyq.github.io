# Jekyll → Astro Migration Context

**Status**: Planning complete, implementation not started  
**Branch**: `tw4` (current working branch — Tailwind v4 migration already done here)  
**Goal**: Migrate from Jekyll 4.4 + Tailwind v4 to Astro static site generator

---

## Why Astro was chosen

- SvelteKit was attempted first but dropped due to Svelte's reactivity-first templating being a poor fit for static content
- Astro's `.astro` component syntax is HTML-first — closest conceptual match to Jekyll's Liquid templates
- Native Content Collections API maps directly to Jekyll's `_posts/`, `_jobs/`, `_projects/`, `_education/` structure
- Tailwind v4 + PostCSS pipeline is identical to the current setup
- Static output deploys to GitHub Pages the same way

---

## Current project structure (Jekyll)

```
_posts/          8 blog posts (YYYY-MM-DD-slug.md)
_jobs/           4 entries (intuit, paypal, softworkz, tradegecko)
_projects/       5 entries (aspnetboilerplate, github-signed-commit, mime_actor, rodiff, teammates)
_education/      2 entries (nus, nyp)
_includes/       ~15 partials (components)
_layouts/        6 layouts (base, document, home, post, resume, projects, tag)
assets/css/      style.css (Tailwind v4 entry point)
blog/index.html  Paginated blog listing
index.md         Home page
projects.md      Projects page
resume.md        Resume page
```

### Active Jekyll plugins (all need Astro replacements)
| Plugin | Astro replacement |
|--------|------------------|
| `jekyll-feed` | `@astrojs/rss` → `src/pages/feed.xml.ts` |
| `jekyll-paginate` | Astro built-in `paginate()` |
| `jekyll-postcss-v2` | Not needed — Astro uses Vite |
| `jekyll-seo-tag` | `astro-seo` package or manual `<head>` |
| `jekyll-sitemap` | `@astrojs/sitemap` integration |
| `jekyll/tagging` | `getStaticPaths()` in `src/pages/topic/[tag].astro` |

---

## CSS / Tailwind setup (already on tw4 branch)

Current `assets/css/style.css` uses:
- `@import "tailwindcss"` (single import)
- `@plugin "@tailwindcss/typography"`
- `@source` directives for class scanning
- `@source inline(...)` for Liquid-dynamic safelist classes (text-github, text-linkedin, text-rss)
- `@custom-variant dark (&:where(.dark, .dark *))` for class-based dark mode
- `@theme` block with `--color-github`, `--color-linkedin`, `--color-rss`
- Inline `.prose code::before/after` reset (removes backtick quotes)

In Astro, switch from PostCSS-CLI runner to `@tailwindcss/vite` plugin:

```ts
// astro.config.ts
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  vite: { plugins: [tailwindcss()] }
});
```

CSS file moves to `src/styles/style.css`. Update `@source` paths (remove one `../../` level since file is now under `src/`).

Remove Pygments CSS imports (`pygments-github.css`, `pygments-tomorrow-bright.css`) — replaced by Shiki.

---

## Syntax highlighting change

Jekyll uses Rouge + custom Pygments CSS files for light/dark code themes.  
Astro uses Shiki natively — no extra CSS needed.

```ts
// astro.config.ts
markdown: {
  shikiConfig: {
    themes: { light: "github-light", dark: "one-dark-pro" }
  }
}
```

The two Pygments CSS files in `assets/css/` can be deleted after confirming Shiki output looks correct.

---

## Content Collections schema

Define in `src/content.config.ts`:

```ts
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    modified_date: z.string().optional(),
  }),
});

const jobs = defineCollection({
  type: "data",  // or "content" if body is used
  schema: z.object({
    country: z.string(),
    org: z.string(),
    logo: z.string().optional(),
    team: z.string(),
    role: z.string(),
    since: z.coerce.date(),
    till: z.coerce.date().optional(),
    frameworks: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    country: z.string(),
    org: z.string(),
    name: z.string(),
    link: z.string().url(),
    summary: z.string(),
    showcase: z.array(z.enum(["resume", "projects"])),
    since: z.coerce.date().optional(),
    till: z.coerce.date().optional(),
  }),
});

const education = defineCollection({
  type: "content",
  schema: z.object({
    country: z.string(),
    org: z.string(),
    logo: z.object({ url: z.string() }).optional(),
    role: z.string(),
    since: z.coerce.date(),
    till: z.coerce.date().optional(),
  }),
});
```

**Note**: Jobs have both YAML frontmatter and a Markdown body (bullet points). Use `type: "content"` for jobs too so the body renders.

---

## Target Astro directory structure

```
src/
├── content/
│   ├── posts/        ← _posts/*.md (strip `layout:` frontmatter key)
│   ├── jobs/         ← _jobs/*.md
│   ├── projects/     ← _projects/*.md
│   └── education/    ← _education/*.md
├── components/
│   ├── Head.astro           ← head.html + head_theme.html
│   ├── Header.astro         ← header.html
│   ├── Navbar.astro         ← navbar.html
│   ├── Footer.astro         ← footer.html + footer_theme.html
│   ├── PostItem.astro       ← post-item.html
│   ├── PostListing.astro    ← post-listing.html + pagination.html
│   ├── ExperienceItem.astro ← experience-item.html + experience-duration.html
│   ├── ProjectItem.astro    ← project-item.html
│   ├── OrganizationItem.astro ← organization-item.html
│   ├── TagBadge.astro       ← tag-badge.html
│   ├── Social.astro         ← social.html + social-badge.html
│   └── ResumeHeader.astro   ← resume_header.html
├── layouts/
│   ├── Base.astro       ← _layouts/base.html
│   ├── Post.astro       ← _layouts/post.html
│   ├── Document.astro   ← _layouts/document.html
│   ├── Resume.astro     ← _layouts/resume.html
│   └── Projects.astro   ← _layouts/projects.html
├── pages/
│   ├── index.astro              ← index.md
│   ├── blog/[...page].astro     ← blog/index.html (paginated)
│   ├── posts/[...slug].astro    ← individual post pages
│   ├── projects.astro           ← projects.md
│   ├── resume.astro             ← resume.md
│   ├── topic/[tag].astro        ← tag pages
│   └── feed.xml.ts              ← RSS feed
└── styles/
    ├── style.css                ← assets/css/style.css (paths updated)
    └── (pygments files deleted — replaced by Shiki)
public/
├── assets/logos/
├── assets/screenshots/
└── CNAME
```

---

## Critical: URL parity for posts

Jekyll permalink config: `/:collection/:categories/:year/:month/:day/:slug`  
No posts use `categories`, so actual URLs are: `/posts/2024/07/24/building-a-static-site-with-jekyll-and-tailwind-css/`

Astro must reproduce this exact pattern or existing links and Google indexing will break.

```ts
// src/pages/posts/[...slug].astro
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map(post => {
    const date = post.data.date; // extracted from filename YYYY-MM-DD-slug
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const slug = post.id.replace(/^\d{4}-\d{2}-\d{2}-/, "");
    return {
      params: { slug: `${y}/${m}/${d}/${slug}` },
      props: { post },
    };
  });
}
```

**Note**: Astro's Content Collections don't automatically expose the date from filenames — you must parse the `post.id` (which is the filename without extension).

---

## Liquid → Astro syntax cheatsheet

| Jekyll Liquid | Astro |
|---|---|
| `{{ page.title \| escape }}` | `{frontmatter.title}` |
| `{{ content }}` | `<slot />` |
| `{%- if condition -%}` | `{condition && <Fragment>...</Fragment>}` |
| `{%- unless condition -%}` | `{!condition && <Fragment>...</Fragment>}` |
| `{%- for item in items -%}` | `{items.map(item => (...))}` |
| `{%- include foo.html param=val -%}` | `<Foo param={val} />` |
| `{{ page.date \| date: "%d-%b-%Y" }}` | `date.toLocaleDateString("en-SG", {...})` |
| `{{ page.content \| number_of_words }}` | Custom word count utility |
| `{{ words \| divided_by: 180 }}` | `Math.floor(wordCount / 180)` |
| `{{ site.jobs \| sort: 'till' \| reverse }}` | `jobs.sort((a,b) => b.data.till - a.data.till)` |
| `{%- assign x = y \| where_exp: "item", "item.showcase contains 'resume'" -%}` | `items.filter(i => i.data.showcase.includes("resume"))` |

---

## Site config values to carry over

From `_config.yml`:
```ts
// src/config.ts (create this)
export const SITE = {
  title: "Ryan Chang",
  description: "Fueled by coffee, driven by craft",
  author: { name: "Ryan Chang", email: "ryancyq@gmail.com", website: "https://ryancyq.com" },
  timezone: "Asia/Singapore",
  dateFormat: "dd-MMM-yyyy",
  wordsPerMinute: 180,
  googleAnalytics: "G-B3F2H65ZT2",
  social: [
    { platform: "github", url: "https://github.com/ryancyq" },
    { platform: "linkedin", url: "https://linkedin.com/in/changyanqian/" },
  ],
  tagPageDir: "topic",
  paginate: 5,
};
```

---

## GitHub Actions update

Replace current `.github/workflows/jekyll.yml` with Astro's official Pages workflow:

```yaml
- uses: withastro/action@v3
  # No extra config needed for default static output
- uses: actions/deploy-pages@v4
```

Key differences:
- No Ruby setup
- `dist/` replaces `_site/`
- `NODE_ENV=production` replaces `JEKYLL_ENV=production`
- cssnano still fires in production (driven by `NODE_ENV` check in `postcss.config.js` — update the env var check accordingly)

---

## Suggested phase order

1. **Scaffold** — `npm create astro@latest` in a new branch off `tw4`, minimal + TypeScript strict
2. **CSS** — copy `style.css`, wire up `@tailwindcss/vite`, verify dark mode and brand colors render
3. **Content Collections** — define schemas, copy all markdown files, verify `astro check` passes
4. **Base layout + Header/Footer** — get a blank page rendering with nav and dark mode toggle working
5. **Post pages** — `Post.astro` layout + `src/pages/posts/[...slug].astro`, verify URL structure
6. **Blog listing** — paginated index at `/blog/`, tag pages at `/topic/[tag]`
7. **Resume page** — `Resume.astro` with jobs/education/projects sorted and filtered
8. **Projects page**
9. **RSS + Sitemap + SEO**
10. **GitHub Actions**
11. **URL audit** — crawl old `_site/` and new `dist/` and diff all paths before shipping

---

## Known gotchas

- **`modified_date` format**: stored as `"28-03-2025"` string in frontmatter. Parse carefully — it's `dd-MM-yyyy`, not ISO.
- **Organization logos**: `_includes/organization-logos/` contains SVG files used as inline includes. These become either imported SVG components or `<img>` tags pointing to `public/`.
- **Social icons**: same as above — `_includes/social-icons/` contains SVGs.
- **Print styles on resume**: The resume layout has extensive `print:` Tailwind variants. These must be preserved exactly.
- **`assets/organization-logos.liquid` and `assets/social-icons.liquid`**: These are Jekyll asset bundles. Check if they're still needed or can be replaced by direct imports in Astro components.
- **`google-analytics.html` include**: Currently injected conditionally. Move logic into `Head.astro` behind an `import.meta.env.PROD` guard.
- **Dark mode script timing**: The script in `head_theme.html` runs before paint to avoid flash. It must stay in `<head>`, not deferred. In Astro, use `is:inline` on the script tag.
