# caleb.rocks — project notes

Static marketing site for Caleb's freelance web-design business. Plain HTML/CSS/JS (Bootstrap 5.3 theme, no build step). Deploy: drag-drop the repo folder to Cloudflare (or point a Pages/Workers static deploy at it).

## Commands

- `npm start` — local dev server (`serve .`)

## Structure

- `index.html` — one-page landing (hero, who I help, services, work, pricing, why lightweight, process, about, FAQ, CTA)
- `contact.html` — enquiry form (FormSubmit) + quick FAQ
- `404.html`, `privacy-policy.html`, `terms-and-conditions.html`
- `assets/css/styles.css` — compiled Bootstrap theme with the brand palette. **Do not redo the colour palette.** Custom caleb.rocks styles live in the clearly-marked "caleb.rocks — custom layer" block at the END of the file. Edit styles there, not in the compiled section above.
- `assets/js/custom.js` — vanilla JS: fixed header, scroll-spy, scroll-to-top, scroll-reveal (honours existing `data-aos` attributes), contact-form success note
- `assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js` — the only JS dependency (offcanvas + accordion)
- Icons are an inline SVG sprite defined at the top of each page's `<body>` (`.icon` class, sized via Bootstrap `fs-*` utilities)
- Work images: `brellark-mockup.png` + `elite-torque-mockup.png` are live; `rob-wilkinson-placeholder.svg` is held for when the RW concept card returns

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
