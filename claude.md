# TaurusFit — Project Brief

## What this project actually is

This repository is being turned into **TaurusFit**, an Algerian e-commerce website
selling **CrossFit and gym accessories** (plates, bars, straps, gloves, belts,
resistance bands, gym bags, etc.).

The codebase currently on disk is a leftover from a *previous* client project
(a carpet/home-furnishings store, "Maison Comfort" / "Luxury Secret"). That old
project's branding, copy, product data, and visual design are **not relevant
anymore** and must not be treated as a reference for "how the site should look."

**This is a full remake, not a reskin.** Do not approach this as "swap the CSS
variables and change the logo." Assume every page needs to be rebuilt for a new
brand identity, new content, new product structure, and a new visual language
built around a gym/fitness aesthetic (bold, high-contrast, energetic — not the
soft/luxury look of the old site). Treat the old frontend pages as scaffolding
to gut and rebuild, not as a design source of truth.

What **is** reused: the underlying technical plumbing — Supabase backend,
the Vercel routing setup, the checkout/order flow architecture, the admin
panel (`panel4rz`) as a structural template, and the general repo layout
(`supplements/<page>/index.{html,css,js}`). These are being kept because
they work, not because they're locked in — if a page needs structural changes
to fit the new brand/content, make them.

## Brand identity

- **Name:** TaurusFit
- **Logo colors / brand accents:**
  - Red: `#fc0002`
  - Blue: `#00b6fa`
  - These two are the primary accent colors for buttons, links, active states,
    badges, and other interactive/brand components. Use them deliberately
    (e.g. red for primary CTAs / urgency, blue for secondary actions or
    informational accents) rather than mixing them arbitrarily — confirm with
    the user if a specific split isn't obvious from context.
- **Theme:** Dark by default. The site should ship with a dark background/UI
  as the default experience, with a visible **light mode toggle** for users
  who want to switch. Both themes need to be fully designed and usable, not
  just dark with a half-finished light fallback (or vice versa) — build the
  theme switcher (e.g. CSS variables + a `data-theme` / class toggle,
  persisted via localStorage) as a first-class feature from the start.
- General tone: bold, high-energy, athletic/gym aesthetic. Strong contrast,
  confident typography, sports-brand feel — not delicate or "luxury."

## Homepage hero — explicit client requirement

The client specified **one** concrete feature for the homepage hero section:
a **photo slider/carousel**. This must be present — an image slideshow in the
hero area (auto-rotating and/or manually navigable, likely showcasing product
shots or gym/lifestyle photography). Everything else about the homepage is
open to redesign, but do not drop or water down the hero slider — it's the
one specific thing the client asked for by name.

## Repo layout (kept from the previous project)

- `supplements/<page>/index.html|css|js` — one folder per route (`home`,
  `products`, `product-detail`, `checkout`, `privacy`, `panel4rz` = admin,
  `mgmt9kx` = another admin/mgmt area). `vercel.json` rewrites clean URLs
  (e.g. `/products`) to these folders.
- `supabase/functions/` — edge functions: `manage-customers`, `manage-users`,
  `submit-contact`, `submit-order`, `update-order-status`.
- `content.js` — site content/product data loaded by the frontend.
- `api/initial-data.js` — initial data endpoint.
- `serve.json` / `server.js` — local dev serving.
- Product/category images live in `products-pictures/` and
  `categorie-pictures/` — expect these to be replaced with gym/fitness
  product photography as the catalog changes.

## Coding rules

1. **Version buster required:** after editing any `index.js` or `index.css`,
   increment the `?v=N` query param on its corresponding `<script>`/`<link>`
   tag in the matching HTML file, so browsers don't serve a stale cached copy.
2. Keep the light/dark theme fully driven by CSS custom properties (`:root`
   plus a theme-override selector) so new components automatically pick up
   the correct palette — avoid hardcoding one-off colors that only work in
   one theme (this bit the previous project during its own theme work; audit
   for hardcoded `rgba(255,255,255,…)` / `rgba(0,0,0,…)` values when porting
   old components).
3. Don't assume the old site's product model (carpets, dimensions, wilaya
   delivery flow, etc.) maps 1:1 onto gym accessories — check with the user
   before reusing old field names/structure for anything that isn't obviously
   generic (orders, customers, delivery), since product attributes (size,
   weight, color, material) will likely differ meaningfully from the old
   catalog.
4. Admin panel (`panel4rz`) should be updated to reflect new product
   categories/status vocabulary as the catalog changes, but its dark/light
   theme system and general structure can stay as a base.

## Open questions to confirm with the user before assuming

- Exact product catalog/categories for launch.
- Whether delivery/checkout flow (wilaya-based Algeria delivery, cash-on-delivery,
  etc.) carries over unchanged from the old site or needs changes for this brand.
- Any additional hero-section content beyond the photo slider (headline, CTA
  copy, etc.) — client only specified the slider explicitly.
