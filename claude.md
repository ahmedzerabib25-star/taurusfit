# Luxury Secret — Complete Redesign Blueprint

> **CRITICAL CONTEXT FOR ALL FUTURE CONVERSATIONS:**
> This project is a **ground-up redesign** of the Luxury Secret e-commerce website. The existing site (`/supplements/`) is the **reference for features and backend only** — not for design, layout, or aesthetics. The new site must look nothing like the original. Every page must be rebuilt from scratch with an entirely different visual identity. The backend (Supabase), API routes, and data models are preserved exactly.

---

## Brand Identity

| Field | Value |
|---|---|
| Brand Name (EN/FR) | **Luxury Secret** |
| Brand Name (AR) | **لوكسري سيكرت** |
| Domain niche | Luxury makeup & beauty (Algeria) |
| Languages | English · French · Arabic (full RTL for AR) |
| Tone | Clean · Editorial · High-fashion · Minimal |

---

## Design Direction — What the New Site Must Be

### Core Aesthetic
- **White** (`#FFFFFF`) base canvas — light mode default
- **Pure black** (`#0A0A0A`) as primary typography and UI color
- **Single accent color** — a deep, muted rose or warm nude (not gold, not taupe) — used sparingly for CTAs and highlights only
- **Editorial layout** — wide grids, structured whitespace, asymmetric hero sections, full-bleed category imagery
- **Typography-first** — large, refined serif or display font for headings; clean sans-serif for body
- Zero resemblance to the current "supplements/sports-nutrition" layout (no particle animations, no dark hero panels, no centered text stacks)

### What the Old Site Looks Like (AVOID ALL OF THIS)
- Dark hero with animated particle/gradient overlays
- Espresso/gold warm color palette
- Centered "trust badges" row below hero
- Horizontal product sliders
- Mobile sidebar with dark `#1c1612` background
- Gold accent (`#A3845B`, `#C5A880`) throughout

### New Layout Principles
- **Homepage**: Full-bleed editorial hero (image + text left/right split), category grid with real category images (not icons), products in a masonry or staggered editorial grid, bundle/pack section as a large feature block
- **Products page**: Two-column layout — slim left filter rail + wide right product grid, no sidebar hamburger on desktop
- **Product Detail**: Gallery on left (large images, thumbnail strip below), all details on right in clean vertical stack — shade picker as color swatches, not dropdowns
- **Checkout**: Single-column clean form, order summary panel on the right (desktop), step-indicator at top
- **Mobile**: Full-screen overlay nav (clean white panel with black text, NOT dark)

### Dark Mode
- Background: `#0A0A0A`
- Cards: `#141414`
- Text: `#F5F5F5`
- Borders: `#2A2A2A`
- Accent: same muted rose, slightly lighter

---

## Arabic Language Support (Full)

Arabic is a **first-class language**, not an afterthought.

- **RTL layout**: When `lang === "ar"`, set `document.documentElement.dir = "rtl"` and `document.documentElement.lang = "ar"`
- **Every user-visible string** must have an `_ar` translation key in the i18n objects (in addition to `_en` and `_fr`)
- **All database fields** that have `_en` and `_fr` variants must also display the `_ar` variant when Arabic is selected:
  - `products`: `name_ar`, `brand_ar`, `description_ar` — already in DB schema (add if missing)
  - `categories`: `name_ar` — **must be added to DB** (see schema migration below)
  - `sub_categories`: `name_ar` — **must be added to DB**
  - `bundle`: `title_ar`, `description_ar` — already in DB schema
- **Font**: Use a dedicated Arabic web font (e.g., Cairo, Tajawal, or IBM Plex Arabic) loaded via Google Fonts, activated only when `lang === "ar"`
- **RTL-specific CSS**: Use `[dir="rtl"]` selector for flipping flex directions, text alignment, icon positions, and padding/margin asymmetries — never use `margin-left` or `padding-right` hardcoded in components that must RTL-flip
- **Number formatting**: Prices displayed in Arabic locale use Arabic-Indic numerals (`toLocaleString("ar-DZ")`) — make this a toggle based on active language
- **Form labels**: All checkout form labels and placeholders must have Arabic translations

---

## Category Images

Categories now display a real image (not an icon). This requires a DB schema addition and UI changes.

### DB Change Required
```sql
-- Add image_url and Arabic name to categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255),
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add Arabic name to sub_categories
ALTER TABLE public.sub_categories
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
```

After running the migration:
- Populate `name_en`, `name_fr`, `name_ar` from the existing `name` field via the admin panel
- Upload category images via the admin panel (stored in Supabase Storage or as direct URLs)
- The `_remapCategory()` function in `supabase-client.js` must be updated to include `nameAr`, `nameFr`, `nameEn` and `imageUrl`

---

## File Structure

All pages live inside `/supplements/`. The structure stays the same — only the content of every file is replaced:

```
supplements/
├── home/
│   ├── index.html       # Editorial homepage — hero split, category image grid, product editorial grid, bundle feature
│   ├── index.css        # Homepage styles — grid layouts, hero split, category cards with images
│   └── index.js         # Data fetch, render logic, i18n (EN/FR/AR), cart modal
├── products/
│   ├── index.html       # Catalog — slim filter rail + wide product grid, active filter chips
│   ├── index.css        # Catalog layout — two-column desktop, stacked mobile
│   └── index.js         # Filter logic, sort, category/subcategory URL params, i18n (EN/FR/AR)
├── product-detail/
│   ├── index.html       # Detail — split gallery left / info right, shade swatches, add-to-cart
│   ├── index.css        # Detail styles — gallery, swatch grid, tabs, delivery calculator
│   └── index.js         # Image switcher, shade/variant selection, quick-buy, i18n (EN/FR/AR)
├── checkout/
│   ├── index.html       # Clean checkout form + right-side order summary, step indicator
│   ├── index.css        # Checkout form styles — clean inputs, step bar, summary panel
│   └── index.js         # Order compute, promo codes, wilaya/commune picker, i18n (EN/FR/AR)
├── mgmt9kx/
│   ├── index.html       # Admin login (minimal, unchanged functionally)
│   ├── index.css        # Login styles
│   └── index.js         # Auth check + redirect
├── panel4rz/
│   ├── index.html       # Admin dashboard — orders, products, categories (add category image_url field here)
│   ├── index.css        # Admin panel styles
│   └── index.js         # All CRUD — orders, products, categories, delivery, promos, bundle, settings
├── privacy/
│   ├── index.html       # Privacy policy (3 languages)
│   ├── index.css        # Privacy styles
│   └── index.js         # i18n (EN/FR/AR)
├── footer.css           # CSS variables (new palette) + shared footer + dark mode tokens
├── footer.js            # Shared footer, language switcher (EN/FR/AR + RTL toggle), theme toggle
├── supabase-client.js   # Supabase init + remap helpers (update _remapCategory for nameAr + imageUrl)
└── marquee.js           # Announcement marquee
api/
└── initial-data.js      # Edge-cached data fetch (unchanged)
serve.json               # Local dev rewrites (unchanged)
vercel.json              # Vercel routing + cache headers (unchanged)
```

---

## Database Architecture (Full Schema)

```sql
-- 1. SETTINGS
CREATE TABLE public.settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL
);

-- 2. CATEGORIES (with image and all language names)
CREATE TABLE public.categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,          -- legacy fallback
    name_en VARCHAR(255),
    name_fr VARCHAR(255),
    name_ar VARCHAR(255),
    description TEXT,
    image_url TEXT,                       -- category cover image
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUB-CATEGORIES (with all language names)
CREATE TABLE public.sub_categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,          -- legacy fallback
    name_en VARCHAR(255),
    name_fr VARCHAR(255),
    name_ar VARCHAR(255),
    category_ids TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS (Arabic fields already present or to be added)
CREATE TABLE public.products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_fr VARCHAR(255),
    name_ar VARCHAR(255),
    brand VARCHAR(255),
    brand_en VARCHAR(255),
    brand_fr VARCHAR(255),
    brand_ar VARCHAR(255),
    category_ids TEXT,
    sub_category_ids TEXT,
    description TEXT,
    description_en TEXT,
    description_fr TEXT,
    description_ar TEXT,
    image_url JSONB,
    variants JSONB,
    flavors JSONB,
    stock INTEGER DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    allow_promo BOOLEAN DEFAULT TRUE,
    promo_code_ids TEXT,
    free_delivery BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BUNDLE / PACK
CREATE TABLE public.bundle (
    bundle_id VARCHAR(100) PRIMARY KEY,
    title_en VARCHAR(255),
    title_fr VARCHAR(255),
    title_ar VARCHAR(255),
    description_en TEXT,
    description_fr TEXT,
    description_ar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROMO CODES
CREATE TABLE public.promo_codes (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    min_order NUMERIC DEFAULT 0,
    max_uses INTEGER,
    uses INTEGER DEFAULT 0,
    expiry VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    apply_to_all BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DELIVERY PRICES (69 Algerian wilayas)
CREATE TABLE public.delivery_prices (
    id VARCHAR(100) PRIMARY KEY,
    wilaya VARCHAR(255) NOT NULL,
    home_price NUMERIC DEFAULT 0,
    office_price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS
CREATE TABLE public.orders (
    id VARCHAR(100) PRIMARY KEY,
    source VARCHAR(50),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    wilaya VARCHAR(255) NOT NULL,
    commune VARCHAR(255) NOT NULL,
    delivery_type VARCHAR(50) DEFAULT 'home',
    delivery_cost NUMERIC DEFAULT 0,
    promo_code TEXT,
    promo_discount NUMERIC DEFAULT 0,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## CSS Design Tokens (New Palette)

These variables live in `footer.css` and are imported by every page. **Do not use any hardcoded color values anywhere in the codebase** — always use variables.

```css
/* Light Mode (default) */
:root {
  --bg:          #FFFFFF;        /* page canvas */
  --surface:     #F7F7F7;        /* cards, panels, inputs */
  --border:      #E8E8E8;        /* dividers, input borders */
  --text-primary:#0A0A0A;        /* headings, primary labels */
  --text-muted:  #6B6B6B;        /* secondary text, meta */
  --text-subtle: #ABABAB;        /* placeholders, disabled */
  --accent:      #C4616A;        /* CTA buttons, active states — muted rose */
  --accent-hover:#A8474F;        /* accent hover/pressed */
  --accent-light:#FDF0F1;        /* accent tint background */
  --success:     #2D7A4F;
  --warning:     #B45309;
  --error:       #C0392B;

  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;   /* headings */
  --font-body:    'Inter', system-ui, sans-serif;        /* body */
  --font-arabic:  'Cairo', 'Tajawal', sans-serif;       /* Arabic text */

  /* Spacing scale */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;
  --space-3xl: 96px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 999px;
}

/* Dark Mode */
html[data-theme="dark"] {
  --bg:          #0A0A0A;
  --surface:     #141414;
  --border:      #2A2A2A;
  --text-primary:#F5F5F5;
  --text-muted:  #9A9A9A;
  --text-subtle: #555555;
  --accent:      #D97880;        /* slightly brighter rose in dark */
  --accent-hover:#E8959B;
  --accent-light:#1F1213;
}
```

---

## Features to Preserve (Backend / Logic)

These features exist in the current site and must all work identically in the redesign:

| Feature | Notes |
|---|---|
| Product catalog with filters | Filter by category, subcategory, price range |
| Shade/Color picker on product detail | Called "Shade" or "Color", never "Flavor" |
| Variant picker (size/weight) | Dropdowns or button group |
| Add to cart (session cart) | Cart persists in `sessionStorage` or `localStorage` |
| Checkout form | First name, last name, phone, address, wilaya, commune, delivery type |
| 69 Algerian wilayas + communes | Full hardcoded list, dynamic commune loading |
| Promo code validation | Flat or percent, expiry check, min order check, per-product restriction |
| Delivery pricing | Home vs office pricing per wilaya from `delivery_prices` table |
| Order placement | POST to Supabase `orders` table |
| Bundle/pack section | Displays `bundle` row from DB with EN/FR/AR |
| Marquee announcement | `marquee.js`, content from `settings` table |
| Language switcher | EN / FR / AR — AR activates RTL |
| Dark/light mode toggle | Persisted in `localStorage` |
| Admin login (`/mgmt9kx`) | Supabase email/password auth |
| Admin panel (`/panel4rz`) | Full CRUD for all tables |
| Settings system | Key-value pairs in `settings` table (WhatsApp number, marquee text, etc.) |
| Free delivery flag per product | `free_delivery` boolean on product |
| Product discount display | Show original price + discounted price |
| `getInitialData()` | Edge-cached API fetch — do not change `api/initial-data.js` |

---

## Supabase Configuration

```
Project URL:  https://zuprsewbheqpahwrlwll.supabase.co
Anon Key:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHJzZXdiaGVxcGFod3Jsd2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTAyNzcsImV4cCI6MjA5ODI2NjI3N30._Xyvx93Wj2kRoi4Drh_sDPBh24sU2Lcol6k27VuArnA
```

- Preconnect hint on every HTML page must point to `https://zuprsewbheqpahwrlwll.supabase.co`
- `supabase-client.js` uses `_isAdmin` to conditionally enable realtime + auth refresh only on `/panel4rz` and `/mgmt9kx` — **never change this pattern**, it prevents a perpetual browser loading spinner on public pages

---

## i18n Pattern

Every page JS file exports an `i18n` object with `en`, `fr`, and `ar` keys. Apply via `data-i18n` attributes on HTML elements. The footer language switcher calls `applyLang(lang)` which sets `dir="rtl"` on `<html>` when `lang === "ar"`.

```js
const i18n = {
  en: {
    "nav.home": "Home",
    "nav.products": "Products",
    // ...
  },
  fr: {
    "nav.home": "Accueil",
    "nav.products": "Produits",
    // ...
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.products": "المنتجات",
    // ...
  }
};
```

When Arabic is active:
1. `document.documentElement.dir = "rtl"`
2. `document.documentElement.lang = "ar"`
3. Body gets class `lang-ar` so `[dir="rtl"]` CSS rules activate
4. Arabic font stack loads via a `<link>` toggled dynamically or preloaded

---

## Coding Rules

1. **No `.html` extensions** in any internal links or redirects.
2. **Version buster required**: After every edit to any `index.js` or `index.css`, increment `?v=N` on its `<script>` or `<link>` tag in the corresponding HTML file.
3. **Use CSS variables only** — never hardcode colors, never hardcode font families.
4. **No RTL hacks** — use logical CSS properties (`margin-inline-start` instead of `margin-left`) wherever practical, and `[dir="rtl"]` overrides for complex cases.
5. **Shade/Color naming** — user-facing label for product variations by color is always "Shade" (EN), "Teinte" (FR), "لون" (AR). Never "Flavor".
6. **Do not modify `api/initial-data.js`** or `vercel.json` without explicit instruction.
7. **Admin panel is functional, not pretty** — redesign effort focuses on the 5 public pages. The admin panel (`panel4rz`) only needs the new DB fields (category `name_ar`, `image_url`) added to its forms.
8. **Category images**: rendered as `<img>` with `object-fit: cover` inside the category card. Fallback to a placeholder gradient if `imageUrl` is null/empty.
9. **Mobile nav**: Clean white (light mode) / dark `#141414` (dark mode) full-screen overlay — not a side drawer. No dark panel in light mode.
10. **No comments in code** unless the behavior would surprise a reader.
