// Throwaway seed script — deleted after running. Uses SUPABASE_SERVICE_ROLE_KEY from env.
const URL = "https://atexotjtbvcsfyzhpcum.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error("Missing SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function req(method, path, body) {
  const r = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${text}`);
  return data;
}

const categoryId = String(Date.now());
const productId = String(Date.now() + 1);

async function main() {
  const category = {
    id: categoryId,
    name: "Strength Training",
    name_en: "Strength Training",
    name_fr: "Musculation",
    name_ar: "تدريب القوة",
    description: "Plates, bars, and heavy-lift essentials for serious training.",
    image_url: "/images/products/1.jpeg",
  };
  await req("POST", "categories", category);
  console.log("Category inserted:", categoryId);

  const product = {
    id: productId,
    name: "Olympic Rubber Bumper Plates",
    name_en: "Olympic Rubber Bumper Plates",
    name_fr: "Disques Bumper Olympiques",
    name_ar: "أقراص بمبر أولمبية",
    brand: "TaurusFit",
    brand_en: "TaurusFit",
    brand_fr: "TaurusFit",
    brand_ar: "توروس فيت",
    category_ids: categoryId,
    sub_category_ids: "",
    sub_sub_category_ids: "",
    description: "Color-coded rubber bumper plates built for heavy drops and daily CrossFit WODs. Precision-balanced, low-bounce, competition-standard diameter.",
    description_en: "Color-coded rubber bumper plates built for heavy drops and daily CrossFit WODs. Precision-balanced, low-bounce, competition-standard diameter.",
    description_fr: "Disques bumper en caoutchouc codés par couleur, conçus pour les lâchers lourds et les WODs quotidiens. Équilibrage précis, rebond limité, diamètre aux normes de compétition.",
    description_ar: "أقراص بمبر مطاطية مرمزة بالألوان مصممة لتحمل الإسقاط الثقيل وتمارين الكروسفيت اليومية. توازن دقيق وارتداد منخفض بقطر مطابق لمعايير المنافسات.",
    image_url: ["/images/products/4.jpeg", "/images/products/5.jpeg"],
    variants: [
      { weight: "10", unit: "kg", price: 4500 },
      { weight: "15", unit: "kg", price: 6200 },
      { weight: "20", unit: "kg", price: 7900 },
    ],
    flavors: [],
    stock: 25,
    discount: 0,
    free_delivery: false,
    status: "active",
    hidden: false,
  };
  await req("POST", "products", product);
  console.log("Product inserted:", productId);

  await req("DELETE", `bundle?bundle_id=neq.__none__`);
  const bundle = {
    bundle_id: productId,
    title_en: "The Strength Starter Bundle",
    title_fr: "Le Pack Force Essentiel",
    title_ar: "حزمة بداية القوة",
    description_en: "Everything you need to load the bar and start hitting PRs — our signature bumper plates, ready for your first WOD.",
    description_fr: "Tout ce qu'il faut pour charger la barre et viser vos records — nos disques bumper signature, prêts pour votre premier WOD.",
    description_ar: "كل ما تحتاجه لتحميل البار وتحقيق أرقامك الشخصية — أقراص البمبر المميزة لدينا، جاهزة لأول تمرين لك.",
  };
  await req("POST", "bundle", bundle);
  console.log("Bundle inserted for product:", productId);
}

main().catch((e) => { console.error(e); process.exit(1); });
