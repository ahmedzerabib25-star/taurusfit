const SUPABASE_URL = "https://zuprsewbheqpahwrlwll.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHJzZXdiaGVxcGFod3Jsd2xsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjY5MDI3NywiZXhwIjoyMDk4MjY2Mjc3fQ.HssKXBhO6VmyihewDnl5rpIfceIIcCMTxQlTG6fzjsc";

const SB_HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
};

function sf(path) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: SB_HEADERS }).then((r) => r.json());
}

module.exports = async function handler(_req, res) {
  try {
    const [products, categories, subCategories, bundle, promos, deliveryPrices, settingsArr] = await Promise.all([
      sf(
        "products?select=id,name,brand,category_ids,sub_category_ids,description,image_url,variants,flavors,stock,discount,allow_promo,promo_code_ids,free_delivery,status,created_at,hidden&hidden=not.is.true&order=created_at.asc"
      ),
      sf("categories?select=*&order=created_at.asc"),
      sf("sub_categories?select=*"),
      sf("bundle?select=*&limit=1"),
      sf("promo_codes?select=*&order=created_at.desc"),
      sf("delivery_prices?select=*&order=wilaya.asc"),
      sf("settings?select=key,value"),
    ]);
    const settings = {};
    if (Array.isArray(settingsArr)) settingsArr.forEach(r => { settings[r.key] = r.value; });

    // 5-minute Vercel edge cache; stale-while-revalidate keeps the site fast during refresh
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      products,
      categories,
      subCategories,
      bundle: Array.isArray(bundle) ? bundle[0] || {} : bundle || {},
      promos,
      deliveryPrices,
      settings,
      orders: [], // orders are never exposed to public visitors
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
