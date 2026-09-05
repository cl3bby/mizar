# caleb.rocks — project notes

Static marketing site for Caleb's freelance web-design business. Plain HTML/CSS/JS (Bootstrap 5.3 theme, no build step). Deploy: git push — the repo is connected to Cloudflare (Pages/Workers) and pushes deploy automatically. No build command, output directory is the repo root.

## Commands

- `npm start` — local dev server (`serve .`)

## Structure

- `index.html` — one-page landing (hero, who I help, services, work, pricing, why lightweight, process, about, FAQ, CTA)
- `contact.html` — enquiry form (FormSubmit) + quick FAQ
- `404.html`, `privacy-policy.html`, `terms-and-conditions.html`
- `test-a.html` … `test-h.html` + `test-h1/h2/h1a/h1b/h2a/h2b/p.html` — TEMPORARY load-bisect ladder for the iOS-stall investigation (bare → +CSS → +scripts → +fonts → full → full minus icon links → full minus custom.js → full minus all JS; halving rungs split main's sections, `test-p` = chrome+footer only). All noindex, each halving page prints a green `LOADED at Xms` reporter on load. **Delete once the stall is solved.**
- `assets/css/styles.css` — compiled Bootstrap theme with the brand palette. **Do not redo the colour palette.** Custom caleb.rocks styles live in the clearly-marked "caleb.rocks — custom layer" block at the END of the file. Edit styles there, not in the compiled section above.
- `assets/js/custom.js` — vanilla JS, loaded FIRST (before Bootstrap) so reveals and diagnostics survive a stalled bootstrap download: fixed header, scroll-spy, scroll-to-top, scroll-reveal (honours existing `data-aos` attributes; rect-sweep based, no IntersectionObserver — IO callback delivery is broken on some iOS Safari builds), contact-form success note, `?debug=1` diagnostic banner (on-device error/stalled-resource log — add the query param to any page URL)
- `assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js` — the only JS dependency (offcanvas + accordion)
- `assets/fonts/` — self-hosted WOFF2s (Inter Tight variable + italic, Instrument Serif + italic). `@font-face` rules live in the styles.css custom layer; the two above-the-fold faces are preloaded in every page head. No Google Fonts requests anywhere.
- `_headers` — Cloudflare cache rules: fonts/images/libs cached 1 year immutable, CSS/JS 1 day. 404.html uses absolute (`/assets/...`) paths because it's served at arbitrary URLs
- Icons are an inline SVG sprite defined at the top of each page's `<body>` (`.icon` class, sized via Bootstrap `fs-*` utilities)
- Work images: `brellark-mockup.webp` + `elite-torque-mockup.webp` (WebP, ~28 + ~55 KB); `rob-wilkinson-placeholder.svg` is held for when the RW concept card returns. `apple-touch-icon.png` (hand-made, dark `#003934` ground) is the home-screen icon; `apple-touch-icon-light.png` is held unused — Safari doesn't support `media` on `apple-touch-icon`, and iOS 18+ derives dark/tinted variants itself

## Hard rules

- **No phone numbers anywhere on this site — by design.** Contact is email-only (`hello@caleb.rocks`, Cloudflare-routed to Gmail). The contact form's "Phone" field is for the *enquirer's* number; that stays.
- Same sole-trader entity as Brellark: **Caleb Bruce Whittaker, ABN 62 866 297 258** (already in the legal pages).

## Single edit points (search for "PRICING" / "Add-ons")

- **Pricing** — prices, package features, and add-ons sit in the clearly-commented `PRICING` block in `index.html`. Current: Essential A$1,950 · Signature A$2,750 · Website Care A$69/month (A$199/quarter) · ad-hoc A$95/hr (30-min increments). Also update: the form selects + quick FAQ in `contact.html`, FAQ #3 in `index.html`, and JSON-LD `priceRange` in the `index.html` head.
- **Form endpoint** — the FormSubmit `action` + `_next` hidden fields in `contact.html`. FormSubmit needs a one-time activation: submit the form once and confirm the email it sends (it arrives via the hello@caleb.rocks forward to Gmail).
- **Work cards** — Brellark links to brellark.com; Elite Torque links to its workers.dev concept URL. Add new work by copying a card in the `#work` section.

## Conventions

- `en-AU` language; Australian English copy; AUD prices
- Reuse existing template components/sections where possible — the site is deliberately built from the Awake template's own markup with new content
- No new JS/CSS dependencies; keep it lean (that's the brand)
- `prefers-reduced-motion` must keep working: reveals, marquee, and smooth scroll all degrade gracefully
- If you reformat (Prettier), that's fine — the HTML is formatter-tolerant
