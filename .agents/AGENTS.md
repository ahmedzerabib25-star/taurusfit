# Project Rules: Luxury Makeup Store Template (Luxury Secret)

This file defines the style, guidelines, and system constraints for AI agents modifying this repository for the **Luxury Secret** cosmetics project.

---

## 🏷️ Brand Identity
- **Brand Name**: `Luxury Secret`
- **Application**: Replace all user-facing references to the old store name ("ByBens" or "ByBens Sports Nutrition") with the new brand name:
  - English & French: `Luxury Secret`
  - Arabic: `لوكسري سيكرت` (or equivalent translation/transliteration as required).

---

## 🎨 Luxury Theme Color Palette
Always strictly adhere to these specific hex values for the light and dark themes. Do not use generic reds, greens, blues, or raw blacks (#000) or whites (#FFF).

### ☀️ Light Mode Theme (Default)
- **Main Canvas Background**: `#F9F7F4` (Alabaster / Ivory) — matte, clean look.
- **Cards & Sheet Backdrops**: `#FFFFFF` (Pure White) — provides subtle elevation.
- **Primary Typography**: `#2B2523` (Deep Espresso) — softer than pure black.
- **The Luxury Accent (CTAs)**: `#A3845B` (Muted Gold) — deep gold for high contrast.
- **Secondary Text & Borders**: `#8E827E` (Muted Taupe) — subtle dividers and labels.

### 🌙 Dark Mode Theme
- **Main Canvas Background**: `#121212` (Rich Charcoal) — elegant matte dark.
- **Cards & Sheet Backdrops**: `#1A1A1A` (Onyx Black) — elevated sections.
- **Primary Typography**: `#F9F8F6` (Soft Ivory) — easy on the eyes.
- **The Luxury Accent (CTAs)**: `#C5A880` (Champagne Gold) — bright gold to stand out.
- **Secondary Text & Borders**: `#4A3F41` (Deep Muted Rose) — warm dark borders.

---

## 💅 Luxury Design & Aesthetic Guidelines
The style should be completely redesigned to look like an **exclusive cosmetics & makeup brand** (unrecognizable from the sports nutrition layout):

1. **Typography**:
   - Display headings must use an elegant, editorial Serif font (e.g., *Cormorant Garamond* or *Playfair Display*).
   - UI controls, text inputs, and body content must use a clean, thin geometric Sans-Serif font (e.g., *Montserrat* or *DM Sans*).
2. **Layout**:
   - Shift from boxy grids to airy, editorial layouts with generous white space.
   - Use thin, subtle borders (`#E3DFDA` in light mode, `#2E2527` in dark mode) instead of thick borders.
3. **Buttons & Interactivity**:
   - Buttons should feel premium: flat matte with custom hover transitions, micro-animations, or gold-bordered outlines.
   - Use smooth gold gradients or flat gold backgrounds for call-to-actions.

---

## ⚙️ Functionality Adaptations
1. **Shades instead of Flavors**:
   - The user-facing label **"Flavor"** must be replaced with **"Shade"** or **"Color"** across the checkout, product detail, and cart drawer pages.
2. **Sizes/Volumes instead of Weights**:
   - Change product variants from weights (e.g. `1kg`, `500g`) to makeup volumes (e.g. `15ml`, `30g`, or shade names).
3. **Clean Architecture**:
   - All page assets must be kept strictly separated in their respective folders under `/supplements/` (e.g., `checkout/index.js`, `checkout/index.css`, `checkout/index.html`).
   - Every script tag referencing a page script must include the version parameter `?v=...` (e.g. `index.js?v=2`) to force bypass browser cache on changes.
4. **Vercel Routing**:
   - Any new routes must be added as clean URL rewrites in both `serve.json` and `vercel.json`.
