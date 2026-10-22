# caleb.rocks (Astro) — project notes

Astro + Tailwind + GSAP rebuild of caleb.rocks, based on the Mintaka template (Unlicense). This branch (`astro`) is the new site; the original static site lives on `main` and stays live until cutover.

## Commands

- `bun install` — install dependencies
- `bun run dev` — local dev server
- `bun run build` — production build to `dist/`
- `bun run preview` — preview the built site
- `bun run astro check` — type/diagnostic check

## Structure

- `src/pages/` — routes: landing, blog, work, contact, legal, tags, author, RSS. `it/` mirrors English routes.
- `src/components/landing/` — hero, services, work preview, testimonials, facts, FAQ, CTA
- `src/components/global/` — navigation, footer, textures, cursor, titles
- `src/components/blog/` + `forms/` + `infopages/` — blog chrome, contact form, legal/error pages
- `src/layouts/BaseLayout.astro` — chrome + default SEO (title/OG canonical live here)
- `src/layouts/MarkdownPostLayout.astro` — blog/project post layout
- `src/content/{posts,projects,authors}/{en,it}/` — content collections
- `src/i18n/ui.ts` — all UI copy (en/it)
- `src/styles/global.css` — global styles + Tailwind layers
- `public/` — static assets: fonts, icons, logos, `images/meta/og-image.png`, manifest, robots
- `functions/api/` — GitHub OAuth helpers for the (currently disabled) giscus comments

## Hard rules

- **No phone numbers anywhere on this site — by design.** Contact is email-only (`hello@caleb.rocks`, Cloudflare-routed to Gmail). The contact form's "Phone" field is for the *enquirer's* number; that stays.
- Same sole-trader entity: **Caleb Bruce Whittaker, ABN 62 866 297 258** (already in the legal pages).
- Australian English copy, `en-AU`, AUD prices.
- No Mintaka/Majestico references in shipping output. The only allowed remnant is attribution in `README.md`.
- Keep `site: "https://caleb.rocks"` in `astro.config.mjs`.
- Contact form posts to FormSubmit: `https://formsubmit.co/hello@caleb.rocks`. FormSubmit needs a one-time activation — submit once and confirm the email.
- Comments (giscus) are disabled in `MarkdownPostLayout.astro` until a repo/category is configured in `Comments.astro`.

## Deploy

Cloudflare, built from the `astro` branch. Build command `bun run build`, output `dist/`. `wrangler.toml` points assets at `./dist`.

## Single edit points

- **Pricing / FAQ** — `src/i18n/ui.ts` (`faqs.*`) and the landing components; keep prices consistent with `main`'s PRICING block (Essential A$1,950 · Signature A$2,750 · Care A$69/mo or A$199/quarter · ad-hoc A$95/hr).
- **Brand assets** — `public/logo*.svg`, `public/favicon.svg`, `public/apple-touch-icon.png`, `public/images/meta/og-image.png`.
- **Author portrait** — `src/assets/images/authors/caleb.webp`.
- **Social links** — `src/components/global/Footer.astro`.

## Notes

- The template pulls fonts (rsms.me / Google Fonts), Alpine and a squircle worklet from third-party CDNs in `BaseHead.astro`. The old static site self-hosted everything and avoided third-party requests; moving these local is a known follow-up.
- Italian (`it`) routes are still present. Remove them if the site should be English-only.
