// ByBens – Supabase client + shared data helpers
// Requires @supabase/supabase-js CDN to be loaded first.
// Wrapped in IIFE so const declarations don't collide with page scripts.

(function () {
  var _URL = "https://zuprsewbheqpahwrlwll.supabase.co";
  var _KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHJzZXdiaGVxcGFod3Jsd2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTAyNzcsImV4cCI6MjA5ODI2NjI3N30._Xyvx93Wj2kRoi4Drh_sDPBh24sU2Lcol6k27VuArnA";

  window.SUPABASE_URL = _URL;
  window.SUPABASE_ANON_KEY = _KEY;

  var _isAdmin = /panel4rz|mgmt9kx/.test(window.location.pathname);
  window.supabase = supabase.createClient(_URL, _KEY, {
    auth: {
      autoRefreshToken: _isAdmin,
      persistSession: _isAdmin,
      detectSessionInUrl: false,
    },
    realtime: { enabled: _isAdmin },
  });

  // ── Remapping helpers: snake_case (Supabase REST) → camelCase (app) ──

  function _remapProduct(p) {
    return {
      id: p.id,
      name: p.name_en || p.name || "",
      nameEn: p.name_en || p.name || "",
      nameFr: p.name_fr || "",
      brand: p.brand_en || p.brand || "",
      brandEn: p.brand_en || p.brand || "",
      brandFr: p.brand_fr || "",
      description: p.description_en || p.description || "",
      descriptionEn: p.description_en || p.description || "",
      descriptionFr: p.description_fr || "",
      categoryIds: (p.category_ids || "").split(",").filter(Boolean),
      subCategoryIds: (p.sub_category_ids || "").split(",").filter(Boolean),
      imageUrl: Array.isArray(p.image_url) ? p.image_url : (p.image_url ? [p.image_url] : []),
      variants: p.variants || [],
      flavors: p.flavors || [],
      stock: Number(p.stock) || 0,
      discount: Number(p.discount) || 0,
      allowPromo: p.allow_promo === true || p.allow_promo === "true",
      promoCodeIds: (p.promo_code_ids || "").split(",").filter(Boolean),
      freeDelivery: p.free_delivery === true || p.free_delivery === "true",
      status: p.status || "active",
      createdAt: p.created_at,
    };
  }

  function _remapCategory(c) {
    return {
      id: c.id,
      name: c.name_en || c.name || "",
      nameEn: c.name_en || c.name || "",
      nameFr: c.name_fr || "",
      description: c.description || "",
      createdAt: c.created_at,
    };
  }

  function _remapSubCategory(s) {
    return {
      id: s.id,
      name: s.name_en || s.name || "",
      nameEn: s.name_en || s.name || "",
      nameFr: s.name_fr || "",
      categoryIds: (s.category_ids || "").split(",").filter(Boolean),
      createdAt: s.created_at,
    };
  }

  function _remapBundle(b) {
    if (!b) return { bundleId: "", titleEn: "", titleFr: "", titleAr: "", descriptionEn: "", descriptionFr: "", descriptionAr: "" };
    return {
      bundleId:      b.bundle_id || "",
      titleEn:       b.title_en || "",
      titleFr:       b.title_fr || "",
      titleAr:       b.title_ar || "",
      descriptionEn: b.description_en || "",
      descriptionFr: b.description_fr || "",
      descriptionAr: b.description_ar || "",
    };
  }

  function _remapPromo(p) {
    return {
      id: p.id, code: p.code, type: p.type, value: Number(p.value) || 0,
      minOrder: Number(p.min_order) || 0,
      maxUses: p.max_uses != null ? Number(p.max_uses) : null,
      uses: Number(p.uses) || 0, expiry: p.expiry || "",
      status: p.status || "active",
      applyToAll: p.apply_to_all === true || p.apply_to_all === "true",
      createdAt: p.created_at,
    };
  }

  function _remapDeliveryPrice(d) {
    return { id: d.id, wilaya: d.wilaya, homePrice: Number(d.home_price) || 0, officePrice: Number(d.office_price) || 0, createdAt: d.created_at };
  }

  function _remapOrder(o) {
    return {
      id: o.id, source: o.source || "", firstName: o.first_name || "", lastName: o.last_name || "",
      phone: o.phone || "", address: o.address || "", wilaya: o.wilaya || "", commune: o.commune || "",
      deliveryType: o.delivery_type || "", deliveryCost: Number(o.delivery_cost) || 0,
      promoCode: o.promo_code || "", promoDiscount: Number(o.promo_discount) || 0,
      items: Array.isArray(o.items) ? o.items : [],
      subtotal: Number(o.subtotal) || 0, total: Number(o.total) || 0,
      status: o.status || "waiting", createdAt: o.created_at,
    };
  }

  window.sbRemapInitialData = function (raw) {
    if (!raw) return null;
    var prods = Array.isArray(raw.products) ? raw.products : [];

    var bundleRow = raw.bundle;
    if (Array.isArray(bundleRow)) bundleRow = bundleRow[0] || {};

    return {
      success: true,
      products: prods.map(_remapProduct),
      categories: (Array.isArray(raw.categories) ? raw.categories : []).map(_remapCategory),
      subCategories: (Array.isArray(raw.subCategories) ? raw.subCategories : Array.isArray(raw.sub_categories) ? raw.sub_categories : []).map(_remapSubCategory),
      bundle: _remapBundle(bundleRow),
      promos: (Array.isArray(raw.promos) ? raw.promos : Array.isArray(raw.promo_codes) ? raw.promo_codes : []).map(_remapPromo),
      deliveryPrices: (Array.isArray(raw.deliveryPrices) ? raw.deliveryPrices : Array.isArray(raw.delivery_prices) ? raw.delivery_prices : []).map(_remapDeliveryPrice),
      orders: (Array.isArray(raw.orders) ? raw.orders : []).map(_remapOrder),
      settings: (raw.settings && typeof raw.settings === "object" && !Array.isArray(raw.settings)) ? raw.settings : {},
    };
  };

  // Direct Supabase fallback — used when /api/initial-data is unavailable.
  // Orders intentionally excluded: anon no longer has SELECT on that table.
  function _sbFetchAllTables() {
    var h = { apikey: _KEY, Authorization: "Bearer " + _KEY };
    function sf(path) {
      return fetch(_URL + "/rest/v1/" + path, { headers: h }).then(function (r) { return r.json(); });
    }
    return Promise.all([
      sf("products?select=id,name,name_en,name_fr,name_ar,brand,brand_en,brand_fr,brand_ar,category_ids,sub_category_ids,description,description_en,description_fr,description_ar,image_url,variants,flavors,stock,discount,allow_promo,promo_code_ids,free_delivery,status,created_at&hidden=not.is.true"),
      sf("categories?select=*"),
      sf("sub_categories?select=*"),
      sf("bundle?select=*&limit=1"),
      sf("promo_codes?select=*"),
      sf("delivery_prices?select=*"),
      sf("settings?select=key,value"),
    ]).then(function (results) {
      var settingsArr = Array.isArray(results[6]) ? results[6] : [];
      var settingsMap = {};
      settingsArr.forEach(function(row) { settingsMap[row.key] = row.value; });
      return {
        products:       Array.isArray(results[0]) ? results[0] : [],
        categories:     Array.isArray(results[1]) ? results[1] : [],
        subCategories:  Array.isArray(results[2]) ? results[2] : [],
        bundle:         (Array.isArray(results[3]) ? results[3][0] : null) || {},
        promos:         Array.isArray(results[4]) ? results[4] : [],
        deliveryPrices: Array.isArray(results[5]) ? results[5] : [],
        settings:       settingsMap,
        orders:         [],
      };
    });
  }

  window.getInitialData = function () {
    // Prefer the edge-cached /api/initial-data prefetch; fall back to direct calls.
    var src = window.__initialDataPromise
      ? window.__initialDataPromise.then(function (d) { return d || _sbFetchAllTables(); })
      : _sbFetchAllTables();
    return src.then(function (rawData) {
      if (!rawData) return null;
      return window.sbRemapInitialData(rawData);
    });
  };
})();
