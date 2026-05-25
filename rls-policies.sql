-- RLS Policies for new Supabase project

-- BUNDLE
CREATE POLICY "auth_all_bundle" ON public.bundle FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_bundle" ON public.bundle FOR SELECT TO anon USING (true);

-- CATEGORIES
CREATE POLICY "auth_all_categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT TO anon USING (true);

-- CONTACTS
CREATE POLICY "auth_all_contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CUSTOMERS
CREATE POLICY "auth_all_customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- DELIVERY_PRICES
CREATE POLICY "auth_all_delivery_prices" ON public.delivery_prices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_delivery_prices" ON public.delivery_prices FOR SELECT TO anon USING (true);

-- ORDERS
CREATE POLICY "auth_all_orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PRODUCTS
CREATE POLICY "auth_all_products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_products" ON public.products FOR SELECT TO anon USING (true);

-- PROMO_CODES
CREATE POLICY "auth_all_promo_codes" ON public.promo_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_promo_codes" ON public.promo_codes FOR SELECT TO anon USING (true);

-- SETTINGS
CREATE POLICY "auth_all_settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SUB_CATEGORIES
CREATE POLICY "auth_all_sub_categories" ON public.sub_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_sub_categories" ON public.sub_categories FOR SELECT TO anon USING (true);
