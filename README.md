# caleb.rocks

The caleb.rocks site — Astro + Tailwind + GSAP.

Based on the [Mintaka](https://github.com/majesticooss/mintaka) template (public domain / Unlicense), rebuilt as Caleb's own site.

## Develop

```sh
bun install
bun run dev
```

## Build

```sh
bun run build
bun run preview
```

Output is `dist/`.

## Structure

- `src/pages/` — routes (landing, blog, work, contact, legal, tags, author, RSS)
- `src/components/` — landing sections, global chrome, blog + form components
- `src/layouts/` — `BaseLayout` (chrome + SEO) and `MarkdownPostLayout`
- `src/content/` — posts, projects, authors (Markdown/MDX collections)
- `src/i18n/` — UI strings and locale helpers
- `src/styles/` — global styles
- `public/` — static assets, fonts, icons, manifest

## Deploy

Cloudflare, built from the `astro` branch. Build command `bun run build`, output directory `dist`.

## Credits

Template: [Mintaka](https://github.com/majesticooss/mintaka) by Majestico (Unlicense).
