const SUPABASE_URL = process.env.SUPABASE_URL || "https://atexotjtbvcsfyzhpcum.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SB_HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
};

function sf(path) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: SB_HEADERS }).then((r) => r.json());
}

module.exports = async function handler(_req, res) {
  try {
    const [products, categories, subCategories, subSubCategories, bundle, promos, deliveryPrices, settingsArr] = await Promise.all([
      sf(
        "products?select=id,name,name_en,name_fr,name_ar,brand,brand_en,brand_fr,brand_ar,category_ids,sub_category_ids,sub_sub_category_ids,description,description_en,description_fr,description_ar,image_url,variants,flavors,stock,discount,allow_promo,promo_code_ids,free_delivery,status,created_at,hidden&hidden=not.is.true&order=created_at.asc"
      ),
      sf("categories?select=*&order=created_at.asc"),
      sf("sub_categories?select=*"),
      sf("sub_sub_categories?select=*"),
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
      subSubCategories,
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
