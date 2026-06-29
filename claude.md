# Assistant Guidelines: Makeup Store Development Blueprint (Luxury Secret)

This file contains the complete blueprint for recreating, deploying, and styling the luxury makeup store template (**Luxury Secret**) using this codebase. **Do not modify this document.** It is designed to minimize token usage by presenting all system architecture, files, database schemas, and migration steps in one place.

---

## 🏷️ Brand Name
The target brand name is **Luxury Secret**.
- Replace all references to "ByBens" or "ByBens Sports Nutrition" with **Luxury Secret** (English/French) and **لوكسري سيكرت** (Arabic).
- Update titles, headers, and description texts to reflect this brand identity.

---

## 📁 File Structure & Content Directory

All user-facing page logic is modularized inside `/supplements/`. Below is the complete directory structure and a summary of what each file contains:

```
├── supplements/
│   ├── home/
│   │   ├── index.html       # Home page layout, top categories, trusts banner, feature items slider.
│   │   ├── index.css        # Custom CSS for homepage layout (hero slides, features grid, responsiveness).
│   │   └── index.js         # Fetch logic, render products slider, filter categories, add to cart modal logic.
│   ├── products/
│   │   ├── index.html       # Product catalog page, sidebar filters (category/subcategory/price).
│   │   ├── index.css        # Styles for the catalog sidebar, sorting, filter tags, and catalog grid.
│   │   └── index.js         # Filter handling, category URL parameter bindings, and list sorting.
│   ├── product-detail/
│   │   ├── index.html       # Product details template, images carousel, variations select, description tabs.
│   │   ├── index.css        # Styling for product gallery zoom, variation grids, tabs, shipping calculator.
│   │   └── index.js         # URL id matching, main image switcher, custom options picker, cart additions.
│   ├── checkout/
│   │   ├── index.html       # Checkout details form, order list confirmation summary, order success modal.
│   │   ├── index.css        # Styles for form inputs, error outlines, delivery select buttons.
│   │   └── index.js         # Order summary computations, promo codes handler, dynamic 69 wilayas & communes list.
│   ├── mgmt9kx/
│   │   ├── index.html       # Admin login interface.
│   │   ├── index.css        # Admin login aesthetics.
│   │   └── index.js         # Supabase client authentication check and session redirects.
│   ├── panel4rz/
│   │   ├── index.html       # Admin dashboard panel (manage orders, product catalog, delivery pricing).
│   │   ├── index.css        # Layout structure for admin sidebars, data tables, modals, edit forms.
│   │   └── index.js         # Direct CRUD queries to Supabase (orders, stock, promos, products, bundle).
│   ├── privacy/
│   │   ├── index.html       # Static privacy policy markup.
│   │   ├── index.css        # Privacy text styling.
│   │   └── index.js         # Privacy language translations.
│   ├── footer.css            # Shared global footer styles & light/dark mode variables definition.
│   ├── footer.js             # Shared footer logic, language selectors, translations, and theme toggle.
│   ├── supabase-client.js    # Client-side Supabase init and REST mapper translations (snake_case -> camelCase).
│   └── marquee.js            # Scrolling announcements marquee logic.
├── api/
│   └── initial-data.js       # Vercel Serverless Function to fetch & cache product/categories catalogs on the Edge.
├── serve.json                # Local clean URL rewrite mappings (routes /supplements/* requests to folders).
└── vercel.json               # Vercel routing, clean URLs, redirects, and Edge caching headers rules.
```

---

## 🗄️ Database Architecture

The backend database contains **7 core tables** and **5 Supabase Edge Functions** (written in Deno). 

### 1. SQL Schema (Create Tables)
Run these commands in your new Supabase SQL Editor to initialize the database:

```sql
-- 1. SETTINGS TABLE
CREATE TABLE public.settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL
);

-- 2. CATEGORIES TABLE
CREATE TABLE public.categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUB-CATEGORIES TABLE
CREATE TABLE public.sub_categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_ids TEXT, -- Comma-separated category IDs
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE public.products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category_ids TEXT, -- Comma-separated category IDs
    sub_category_ids TEXT, -- Comma-separated sub-category IDs
    description TEXT,
    image_url JSONB, -- Array of image URLs
    variants JSONB, -- Array of variant objects: [{label, weight, unit, price, stock, flavorStock}]
    flavors JSONB, -- Array of flavor objects/labels (legacy backup)
    stock INTEGER DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    allow_promo BOOLEAN DEFAULT TRUE,
    promo_code_ids TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    hidden BOOLEAN DEFAULT FALSE
);

-- 5. BUNDLE (PACKS) TABLE
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

-- 6. PROMO CODES TABLE
CREATE TABLE public.promo_codes (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- "flat" or "percent"
    value NUMERIC NOT NULL,
    min_order NUMERIC DEFAULT 0,
    max_uses INTEGER,
    uses INTEGER DEFAULT 0,
    expiry VARCHAR(100), -- YYYY-MM-DD
    status VARCHAR(50) DEFAULT 'active',
    apply_to_all BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DELIVERY PRICES (WILAYAS) TABLE
CREATE TABLE public.delivery_prices (
    id VARCHAR(100) PRIMARY KEY,
    wilaya VARCHAR(255) NOT NULL, -- Wilaya name or code matching selector
    home_price NUMERIC DEFAULT 0,
    office_price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS TABLE
CREATE TABLE public.orders (
    id VARCHAR(100) PRIMARY KEY,
    source VARCHAR(50), -- "checkout" or "product-detail"
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    wilaya VARCHAR(255) NOT NULL,
    commune VARCHAR(255) NOT NULL,
    delivery_type VARCHAR(50) DEFAULT 'home', -- 'home' or 'office'
    delivery_cost NUMERIC DEFAULT 0,
    promo_code TEXT,
    promo_discount NUMERIC DEFAULT 0,
    items JSONB NOT NULL, -- Array of items ordered
    subtotal NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'confirmed', 'delivered', 'canceled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Migrating Database from Current to New Supabase

To copy the existing `delivery_prices` (your wilayas pricing catalog) and table configurations to your new Supabase account, use the PostgreSQL command-line tools or Supabase CLI.

### Option A: Direct pg_dump / psql (Recommended)
1. **Export the `delivery_prices` schema and data** from the old database:
   ```bash
   pg_dump -h db.dbezrrzmcosxdoorbrgx.supabase.co -U postgres -d postgres -t delivery_prices --data-only > delivery_prices_data.sql
   ```
   *(Password can be found in the current connection settings).*
2. **Import it into the new database**:
   ```bash
   psql -h db.<new-project-ref>.supabase.co -U postgres -d postgres -f delivery_prices_data.sql
   ```

### Option B: Supabase CLI Migration
1. **Initialize the local Supabase environment**:
   ```bash
   supabase init
   ```
2. **Link the source project** to pull the database structure:
   ```bash
   supabase link --project-ref dbezrrzmcosxdoorbrgx
   supabase db pull
   ```
3. **Link your new destination project** and deploy the structure:
   ```bash
   supabase link --project-ref <new-project-ref>
   supabase db push
   ```

---

## 🎨 Theme Variable & Customization Engine

The light/dark themes are declared globally in **[footer.css](file:///c:/Users/Ahmed/Desktop/byben-s-nutrition/supplements/footer.css)** and top of page styles. Swap the color values inside these rule blocks to make your makeup store design unrecognisable:

```css
/* ☀️ Light Mode variables */
:root {
  --off-white: #F9F7F4;       /* Main canvas background */
  --white: #FFFFFF;           /* Cards & sheet backdrops */
  --black: #2B2523;           /* Primary Espresso typography */
  --red: #A3845B;             /* Luxury CTA Accent (Muted Gold) */
  --gray-400: #8E827E;        /* Muted Taupe text */
  --gray-200: #E3DFDA;        /* Light taupe borders */
}

/* 🌙 Dark Mode variables */
html[data-theme="dark"] {
  --off-white: #121212;     /* Rich Charcoal background */
  --white: #1A1A1A;         /* Onyx Black cards */
  --black: #F9F8F6;         /* Soft Ivory typography */
  --red: #C5A880;           /* Champagne Gold Accent */
  --gray-400: #4A3F41;      /* Deep Muted Rose borders */
  --gray-200: #2E2527;      /* Subtle dark rose borders */
}
```

---

## ⚙️ Assistant Coding Guidelines

When editing this repository:
1. **No direct `.html` extensions** inside page links or code redirects.
2. **Always append a version buster** (`?v=...`) to index.js/index.css script references inside HTML files after modifying them (e.g. `index.js?v=3`).
3. **Rename user-facing references to Flavors** to `Shade` or `Color` across `products`, `product-detail` and `checkout` JS/HTML templates.
