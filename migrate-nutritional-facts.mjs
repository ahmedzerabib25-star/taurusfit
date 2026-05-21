/**
 * One-time migration: replace base64 images in nutritional_facts with Cloudinary URLs.
 * Run: SUPABASE_SERVICE_KEY=<your_service_role_key> node migrate-nutritional-facts.mjs
 */

const SUPABASE_URL = "https://qlvvarnujhlgalawojhi.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const CLOUDINARY_CLOUD = "dbxna1ipc";
const CLOUDINARY_PRESET = "Bybens";

if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY environment variable.");
  process.exit(1);
}

const sbHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: "Bearer " + SUPABASE_KEY,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function uploadBase64ToCloudinary(base64DataUrl, productId, index) {
  const fd = new FormData();
  fd.append("file", base64DataUrl);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  fd.append("folder", "bybens-nutritional-facts");
  fd.append("public_id", `product_${productId}_nutrifacts_${index}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);
  const data = await res.json();
  return data.secure_url;
}

async function migrateProduct(product) {
  const html = product.nutritional_facts || "";
  if (!html.includes("data:image")) return null;

  let updated = html;
  let index = 0;
  const regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
  let match;
  const replacements = [];

  while ((match = regex.exec(html)) !== null) {
    replacements.push({ full: match[0], dataUrl: match[1], index: index++ });
  }

  if (replacements.length === 0) return null;

  console.log(`  Found ${replacements.length} base64 image(s) in product ${product.id} (${product.name})`);

  for (const r of replacements) {
    const url = await uploadBase64ToCloudinary(r.dataUrl, product.id, r.index);
    updated = updated.replace(r.full, `src="${url}"`);
    console.log(`  Uploaded image ${r.index} → ${url}`);
  }

  return updated;
}

async function run() {
  console.log("Fetching products from Supabase...");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,nutritional_facts`, {
    headers: sbHeaders,
  });
  if (!res.ok) throw new Error(`Failed to fetch products: ${await res.text()}`);
  const products = await res.json();

  const toMigrate = products.filter(p => (p.nutritional_facts || "").includes("data:image"));
  console.log(`Found ${toMigrate.length} product(s) with base64 nutritional facts.\n`);

  if (toMigrate.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  for (const product of toMigrate) {
    console.log(`Processing: ${product.name} (${product.id})`);
    const updatedHtml = await migrateProduct(product);
    if (!updatedHtml) continue;

    const patch = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
      method: "PATCH",
      headers: sbHeaders,
      body: JSON.stringify({ nutritional_facts: updatedHtml }),
    });
    if (!patch.ok) {
      console.error(`  Failed to update product ${product.id}: ${await patch.text()}`);
    } else {
      console.log(`  Database updated.\n`);
    }
  }

  console.log("Migration complete.");
}

run().catch(err => { console.error(err); process.exit(1); });
