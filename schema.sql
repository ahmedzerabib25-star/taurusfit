-- ByBens Nutrition - Schema

CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sub_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  category_ids text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  category_ids text NOT NULL DEFAULT '',
  sub_category_ids text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url jsonb NOT NULL DEFAULT '[]'::jsonb,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  flavors jsonb NOT NULL DEFAULT '[]'::jsonb,
  stock integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  allow_promo boolean NOT NULL DEFAULT false,
  promo_code_ids text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  nutritional_facts text NOT NULL DEFAULT '',
  benefits text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  hidden boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id text PRIMARY KEY,
  code text NOT NULL,
  type text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  expiry text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  apply_to_all boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_prices (
  id text PRIMARY KEY,
  wilaya text NOT NULL,
  home_price numeric NOT NULL DEFAULT 0,
  office_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bundle (
  id integer PRIMARY KEY DEFAULT 1,
  bundle_id text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_fr text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  title_en text DEFAULT 'RAMP UP YOUR PERFORMANCE',
  title_fr text DEFAULT 'BOOSTEZ VOS PERFORMANCES',
  title_ar text DEFAULT 'ارفع مستوى أدائك'
);

CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  source text NOT NULL DEFAULT '',
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  wilaya text NOT NULL DEFAULT '',
  commune text NOT NULL DEFAULT '',
  delivery_type text NOT NULL DEFAULT '',
  delivery_cost numeric NOT NULL DEFAULT 0,
  promo_code text NOT NULL DEFAULT '',
  promo_discount numeric NOT NULL DEFAULT 0,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id text PRIMARY KEY,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  password text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
