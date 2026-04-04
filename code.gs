// ============================================================
// ByBens Admin Panel — Google Apps Script Backend
// ============================================================
// SETUP:
// 1. Go to https://script.google.com → New Project
// 2. Paste this ENTIRE code
// 3. Run initSheets() once from the editor (Run → initSheets)
// 4. Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the Web App URL and paste it in the admin HTML
// ============================================================

const SHEET_ID = "19G5rvx6bNxhU0sM638tF_hDXrP6v1vuSYOKVFrdDeHU"; // ← Paste your Google Sheet ID here

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(name);
}

// ── INIT: Run this once to create all sheets ──
function initSheets() {
  const ss = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  const sheets = {
    Settings: ["key", "value"],
    Categories: ["id", "name", "description", "createdAt"],
    SubCategories: ["id", "name", "categoryIds", "createdAt"],
    Products: [
      "id",
      "name",
      "brand",
      "categoryIds",
      "subCategoryIds",
      "description",
      "imageUrl",
      "variants",
      "flavors",
      "stock",
      "discount",
      "allowPromo",
      "promoCodeIds",
      "status",
      "createdAt",
    ],
    PromoCodes: [
      "id",
      "code",
      "type",
      "value",
      "minOrder",
      "maxUses",
      "uses",
      "expiry",
      "status",
      "createdAt",
    ],
    DeliveryPrices: ["id", "wilaya", "homePrice", "officePrice", "createdAt"],
    Bundle: ["bundleId"],
    Orders: [
      "id",
      "source",
      "firstName",
      "lastName",
      "phone",
      "wilaya",
      "commune",
      "deliveryType",
      "deliveryCost",
      "promoCode",
      "promoDiscount",
      "items",
      "subtotal",
      "total",
      "status",
      "createdAt",
    ],
  };

  for (const [sheetName, headers] of Object.entries(sheets)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    // Clear row 1 and set headers fresh
    if (sheet.getLastColumn() > 0) {
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).clear();
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  // Default admin credentials — only if Settings has no data rows
  const settingsSheet = ss.getSheetByName("Settings");
  const settingsData = settingsSheet.getDataRange().getValues();
  if (settingsData.length <= 1) {
    settingsSheet.appendRow(["admin_username", "admin"]);
    settingsSheet.appendRow(["admin_password", "1234"]);
    settingsSheet.appendRow(["admin_displayname", "Admin"]);
  }

  // Auto-resize columns
  for (const sheetName of Object.keys(sheets)) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet.getLastColumn() > 0) {
      sheet.autoResizeColumns(1, sheet.getLastColumn());
    }
  }
}

// ══════════════════════════════════════════════════════════════
// RESET SETTINGS — Run this to force-reset admin credentials
// This clears the Settings sheet and writes fresh defaults
// Run from the editor: Run → resetSettings
// ══════════════════════════════════════════════════════════════
function resetSettings() {
  const ss = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Settings");
  if (!sheet) {
    Logger.log("Settings sheet not found! Run initSheets first.");
    return;
  }
  // Clear everything
  sheet.clear();
  // Re-write headers
  sheet.getRange(1, 1, 1, 2).setValues([["key", "value"]]);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
  sheet.setFrozenRows(1);
  // Write default credentials as plain text strings
  sheet.getRange(2, 1, 3, 2).setNumberFormat("@"); // Force text format
  sheet.getRange(2, 1, 3, 2).setValues([
    ["admin_username", "admin"],
    ["admin_password", "1234"],
    ["admin_displayname", "Admin"],
  ]);
  sheet.autoResizeColumns(1, 2);
  Logger.log("Settings reset! Username: admin / Password: 1234");
}

// ── Response helper ──
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ── GET handler ──
function doGet(e) {
  try {
    const action = e.parameter.action;
    switch (action) {
      case "login":
        return handleLogin(e.parameter);
      case "getCategories":
        return handleGetCategories();
      case "getSubCategories":
        return handleGetSubCategories();
      case "getProducts":
        return handleGetProducts();
      case "getPromos":
        return handleGetPromos();
      case "getDeliveryPrices":
        return handleGetDeliveryPrices();
      case "getBundle":
        return handleGetBundle();
      case "getSettings":
        return handleGetSettings();
      case "getDashboard":
        return handleGetDashboard();
      case "getOrders":
        return handleGetOrders();
      default:
        return jsonResponse({ success: false, error: "Unknown action" });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── POST handler ──
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    switch (action) {
      case "addCategory":
        return handleAddCategory(body);
      case "deleteCategory":
        return handleDeleteCategory(body);
      case "addSubCategory":
        return handleAddSubCategory(body);
      case "deleteSubCategory":
        return handleDeleteSubCategory(body);
      case "addProduct":
        return handleAddProduct(body);
      case "updateProduct":
        return handleUpdateProduct(body);
      case "deleteProduct":
        return handleDeleteProduct(body);
      case "addPromo":
        return handleAddPromo(body);
      case "updatePromo":
        return handleUpdatePromo(body);
      case "deletePromo":
        return handleDeletePromo(body);
      case "addDeliveryPrice":
        return handleAddDeliveryPrice(body);
      case "updateDeliveryPrice":
        return handleUpdateDeliveryPrice(body);
      case "deleteDeliveryPrice":
        return handleDeleteDeliveryPrice(body);
      case "saveBundle":
        return handleSaveBundle(body);
      case "updateSettings":
        return handleUpdateSettings(body);
      case "submitCartOrder":
      case "submitProductOrder":
        return handleSubmitOrder(body);
      case "updateOrderStatus":
        return handleUpdateOrderStatus(body);
      default:
        return jsonResponse({
          success: false,
          error: "Unknown action: " + action,
        });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ════════════════════════════════════════════
// AUTH — uses String() to avoid number vs string mismatch
// ════════════════════════════════════════════
function handleLogin(params) {
  const sheet = getSheet("Settings");
  const data = sheet.getDataRange().getValues();
  const settings = {};
  data.slice(1).forEach((r) => {
    settings[String(r[0]).trim()] = String(r[1]).trim();
  });

  const inputUser = String(params.username).trim();
  const inputPass = String(params.password).trim();
  const storedUser = settings["admin_username"] || "";
  const storedPass = settings["admin_password"] || "";

  if (inputUser === storedUser && inputPass === storedPass) {
    return jsonResponse({
      success: true,
      displayName: settings["admin_displayname"] || storedUser,
    });
  }
  return jsonResponse({ success: false, error: "Invalid credentials" });
}

function handleGetSettings() {
  const sheet = getSheet("Settings");
  const data = sheet.getDataRange().getValues();
  const settings = {};
  data.slice(1).forEach((r) => {
    settings[String(r[0]).trim()] = String(r[1]).trim();
  });
  return jsonResponse({ success: true, settings });
}

function handleUpdateSettings(body) {
  const sheet = getSheet("Settings");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    if (body.updates[key] !== undefined) {
      sheet.getRange(i + 1, 2).setNumberFormat("@"); // Force text
      sheet.getRange(i + 1, 2).setValue(String(body.updates[key]));
    }
  }

  const existingKeys = data.slice(1).map((r) => String(r[0]).trim());
  for (const [key, value] of Object.entries(body.updates)) {
    if (!existingKeys.includes(key)) {
      const newRow = sheet.getLastRow() + 1;
      sheet.getRange(newRow, 1, 1, 2).setNumberFormat("@");
      sheet.getRange(newRow, 1, 1, 2).setValues([[key, String(value)]]);
    }
  }

  return jsonResponse({ success: true });
}

// ════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════
function handleGetCategories() {
  const sheet = getSheet("Categories");
  const data = sheet.getDataRange().getValues();
  const categories = data.slice(1).map((r) => ({
    id: String(r[0]),
    name: r[1],
    description: r[2],
    createdAt: r[3],
  }));
  return jsonResponse({ success: true, categories });
}

function handleAddCategory(body) {
  const sheet = getSheet("Categories");
  const id = Date.now().toString();
  sheet.appendRow([
    id,
    body.name,
    body.description || "",
    new Date().toISOString(),
  ]);
  if (body.subCategories && body.subCategories.length > 0) {
    const subSheet = getSheet("SubCategories");
    body.subCategories.forEach(function (sub, idx) {
      var subId = String(Date.now() + idx + 1);
      subSheet.appendRow([subId, sub, id, new Date().toISOString()]);
      Utilities.sleep(5);
    });
  }
  return jsonResponse({ success: true, id: id });
}

function handleDeleteCategory(body) {
  const sheet = getSheet("Categories");
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(body.id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  const subSheet = getSheet("SubCategories");
  const subData = subSheet.getDataRange().getValues();
  for (let i = subData.length - 1; i >= 1; i--) {
    const catIds = String(subData[i][2]).split(",");
    if (catIds.includes(String(body.id))) {
      const remaining = catIds.filter((c) => c !== String(body.id));
      if (remaining.length === 0) {
        subSheet.deleteRow(i + 1);
      } else {
        subSheet.getRange(i + 1, 3).setValue(remaining.join(","));
      }
    }
  }
  return jsonResponse({ success: true });
}

// ════════════════════════════════════════════
// SUB-CATEGORIES
// ════════════════════════════════════════════
function handleGetSubCategories() {
  const sheet = getSheet("SubCategories");
  const data = sheet.getDataRange().getValues();
  const subs = data.slice(1).map((r) => ({
    id: String(r[0]),
    name: r[1],
    categoryIds: String(r[2]).split(",").filter(Boolean),
    createdAt: r[3],
  }));
  return jsonResponse({ success: true, subCategories: subs });
}

function handleAddSubCategory(body) {
  const sheet = getSheet("SubCategories");
  const id = Date.now().toString();
  const categoryIds = Array.isArray(body.categoryIds)
    ? body.categoryIds.join(",")
    : body.categoryIds;
  sheet.appendRow([id, body.name, categoryIds, new Date().toISOString()]);
  return jsonResponse({ success: true, id });
}

function handleDeleteSubCategory(body) {
  const sheet = getSheet("SubCategories");
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(body.id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return jsonResponse({ success: true });
}

// ════════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════════
// Columns: id(1) name(2) brand(3) categoryIds(4) subCategoryIds(5) description(6) imageUrl(7)
//          variants(8) flavors(9) stock(10) discount(11) allowPromo(12) promoCodeIds(13) status(14) createdAt(15)

function handleGetProducts() {
  const sheet = getSheet("Products");
  const data = sheet.getDataRange().getValues();
  const products = data.slice(1).map((r) => ({
    id: String(r[0]),
    name: r[1],
    brand: r[2],
    categoryIds: String(r[3]).split(",").filter(Boolean),
    subCategoryIds: String(r[4]).split(",").filter(Boolean),
    description: r[5],
    imageUrl: r[6],
    variants: safeParseJSON(r[7], []),
    flavors: safeParseJSON(r[8], []),
    stock: Number(r[9]) || 0,
    discount: Number(r[10]) || 0,
    allowPromo: r[11] === true || r[11] === "true" || r[11] === "TRUE",
    promoCodeIds: String(r[12] || "")
      .split(",")
      .filter(Boolean),
    status: r[13] || "active",
    createdAt: r[14],
  }));
  return jsonResponse({ success: true, products });
}

function handleAddProduct(body) {
  const sheet = getSheet("Products");
  const id = Date.now().toString();
  sheet.appendRow([
    id,
    body.name,
    body.brand || "",
    (body.categoryIds || []).join(","),
    (body.subCategoryIds || []).join(","),
    body.description || "",
    body.imageUrl || "",
    JSON.stringify(body.variants || []),
    JSON.stringify(body.flavors || []),
    Number(body.stock) || 0,
    Number(body.discount) || 0,
    body.allowPromo ? "true" : "false",
    (body.promoCodeIds || []).join(","),
    body.status || "active",
    new Date().toISOString(),
  ]);
  return jsonResponse({ success: true, id });
}

function handleUpdateProduct(body) {
  const sheet = getSheet("Products");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.id)) {
      const row = i + 1;
      sheet.getRange(row, 2).setValue(body.name);
      sheet.getRange(row, 3).setValue(body.brand || "");
      sheet.getRange(row, 4).setValue((body.categoryIds || []).join(","));
      sheet.getRange(row, 5).setValue((body.subCategoryIds || []).join(","));
      sheet.getRange(row, 6).setValue(body.description || "");
      sheet.getRange(row, 7).setValue(body.imageUrl || "");
      sheet.getRange(row, 8).setValue(JSON.stringify(body.variants || []));
      sheet.getRange(row, 9).setValue(JSON.stringify(body.flavors || []));
      sheet.getRange(row, 10).setValue(Number(body.stock) || 0);
      sheet.getRange(row, 11).setValue(Number(body.discount) || 0);
      sheet.getRange(row, 12).setValue(body.allowPromo ? "true" : "false");
      sheet.getRange(row, 13).setValue((body.promoCodeIds || []).join(","));
      sheet.getRange(row, 14).setValue(body.status || "active");
      break;
    }
  }
  return jsonResponse({ success: true });
}

function handleDeleteProduct(body) {
  const sheet = getSheet("Products");
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(body.id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return jsonResponse({ success: true });
}

// ════════════════════════════════════════════
// PROMO CODES
// ════════════════════════════════════════════
function handleGetPromos() {
  const sheet = getSheet("PromoCodes");
  const data = sheet.getDataRange().getValues();
  const promos = data.slice(1).map((r) => ({
    id: String(r[0]),
    code: r[1],
    type: r[2],
    value: Number(r[3]) || 0,
    minOrder: Number(r[4]) || 0,
    maxUses: r[5] ? Number(r[5]) : null,
    uses: Number(r[6]) || 0,
    expiry: r[7] ? formatDate(r[7]) : "",
    status: r[8] || "active",
    createdAt: r[9],
  }));
  return jsonResponse({ success: true, promos });
}

function handleAddPromo(body) {
  const sheet = getSheet("PromoCodes");
  const id = Date.now().toString();
  sheet.appendRow([
    id,
    body.code.toUpperCase(),
    body.type,
    body.type === "free_delivery" ? 0 : Number(body.value) || 0,
    Number(body.minOrder) || 0,
    body.maxUses || "",
    0,
    body.expiry || "",
    body.status || "active",
    new Date().toISOString(),
  ]);
  return jsonResponse({ success: true, id });
}

function handleUpdatePromo(body) {
  const sheet = getSheet("PromoCodes");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.id)) {
      const row = i + 1;
      sheet.getRange(row, 2).setValue(body.code.toUpperCase());
      sheet.getRange(row, 3).setValue(body.type);
      sheet
        .getRange(row, 4)
        .setValue(body.type === "free_delivery" ? 0 : Number(body.value) || 0);
      sheet.getRange(row, 5).setValue(Number(body.minOrder) || 0);
      sheet.getRange(row, 6).setValue(body.maxUses || "");
      sheet.getRange(row, 8).setValue(body.expiry || "");
      sheet.getRange(row, 9).setValue(body.status || "active");
      break;
    }
  }
  return jsonResponse({ success: true });
}

function handleDeletePromo(body) {
  const sheet = getSheet("PromoCodes");
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(body.id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return jsonResponse({ success: true });
}

// ════════════════════════════════════════════
// DELIVERY PRICES
// ════════════════════════════════════════════
function handleGetDeliveryPrices() {
  const sheet = getSheet("DeliveryPrices");
  const data = sheet.getDataRange().getValues();
  const deliveryPrices = data.slice(1).map((r) => ({
    id: String(r[0]),
    wilaya: r[1],
    homePrice: Number(r[2]) || 0,
    officePrice: Number(r[3]) || 0,
    createdAt: r[4],
  }));
  return jsonResponse({ success: true, deliveryPrices });
}

function handleAddDeliveryPrice(body) {
  const sheet = getSheet("DeliveryPrices");
  const id = Date.now().toString();
  sheet.appendRow([
    id,
    body.wilaya,
    Number(body.homePrice) || 0,
    Number(body.officePrice) || 0,
    new Date().toISOString(),
  ]);
  return jsonResponse({ success: true, id });
}

function handleUpdateDeliveryPrice(body) {
  const sheet = getSheet("DeliveryPrices");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.id)) {
      const row = i + 1;
      sheet.getRange(row, 2).setValue(body.wilaya);
      sheet.getRange(row, 3).setValue(Number(body.homePrice) || 0);
      sheet.getRange(row, 4).setValue(Number(body.officePrice) || 0);
      break;
    }
  }
  return jsonResponse({ success: true });
}

function handleDeleteDeliveryPrice(body) {
  const sheet = getSheet("DeliveryPrices");
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(body.id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return jsonResponse({ success: true });
}

// ════════════════════════════════════════════
// BUNDLE
// ════════════════════════════════════════════
function handleGetBundle() {
  const sheet = getSheet("Bundle");
  if (!sheet) return jsonResponse({ success: true, bundleId: "" });
  const data = sheet.getDataRange().getValues();
  const bundleId = data.length > 1 ? String(data[1][0] || "").trim() : "";
  return jsonResponse({ success: true, bundleId: bundleId });
}

function handleSaveBundle(body) {
  const sheet = getSheet("Bundle");
  if (!sheet)
    return jsonResponse({
      success: false,
      error: "Bundle sheet not found. Run initSheets first.",
    });
  const id = body.bundleId ? String(body.bundleId).trim() : "";
  // Keep header, overwrite row 2
  if (sheet.getLastRow() < 2) {
    sheet.appendRow([id]);
  } else {
    sheet.getRange(2, 1).setValue(id);
    // Clear any extra rows just in case
    if (sheet.getLastRow() > 2) {
      sheet.getRange(3, 1, sheet.getLastRow() - 2, 1).clear();
    }
  }
  return jsonResponse({ success: true });
}

// ════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════
function handleGetDashboard() {
  const productsSheet = getSheet("Products");
  const promosSheet = getSheet("PromoCodes");
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const ordersSheet = ss.getSheetByName("Orders");
  const totalProducts = Math.max(0, productsSheet.getLastRow() - 1);
  const promoData = promosSheet.getDataRange().getValues();
  const activePromos = promoData
    .slice(1)
    .filter((r) => r[8] === "active").length;
  const totalOrders = ordersSheet
    ? Math.max(0, ordersSheet.getLastRow() - 1)
    : 0;
  return jsonResponse({
    success: true,
    stats: { totalProducts, activePromos, totalOrders },
  });
}

// ════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════
function handleSubmitOrder(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Orders");
  if (!sheet) {
    sheet = ss.insertSheet("Orders");
    const hdrs = [
      "id", "source", "firstName", "lastName", "phone", "wilaya", "commune",
      "deliveryType", "deliveryCost", "promoCode", "promoDiscount", "items",
      "subtotal", "total", "status", "createdAt",
    ];
    sheet.getRange(1, 1, 1, hdrs.length).setValues([hdrs]);
    sheet.getRange(1, 1, 1, hdrs.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  const id = Date.now().toString();
  const source = body.action === "submitCartOrder" ? "checkout" : "product-detail";
  sheet.appendRow([
    id,
    source,
    body.firstName || "",
    body.lastName || "",
    body.phone || "",
    body.wilaya || "",
    body.commune || "",
    body.deliveryType || "",
    Number(body.deliveryCost) || 0,
    body.promoCode || "",
    Number(body.promoDiscount) || 0,
    JSON.stringify(body.items || []),
    Number(body.subtotal) || 0,
    Number(body.total) || 0,
    "waiting",
    new Date().toISOString(),
  ]);
  return jsonResponse({ success: true, id });
}

function handleGetOrders() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Orders");
  if (!sheet) return jsonResponse({ success: true, orders: [] });
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse({ success: true, orders: [] });
  const orders = data.slice(1).map(function (r) {
    return {
      id: String(r[0] || ""),
      source: String(r[1] || ""),
      firstName: String(r[2] || ""),
      lastName: String(r[3] || ""),
      phone: String(r[4] || ""),
      wilaya: String(r[5] || ""),
      commune: String(r[6] || ""),
      deliveryType: String(r[7] || ""),
      deliveryCost: Number(r[8]) || 0,
      promoCode: String(r[9] || ""),
      promoDiscount: Number(r[10]) || 0,
      items: safeParseJSON(r[11], []),
      subtotal: Number(r[12]) || 0,
      total: Number(r[13]) || 0,
      status: String(r[14] || "waiting"),
      createdAt: r[15] ? String(r[15]) : "",
    };
  });
  return jsonResponse({ success: true, orders });
}

function handleUpdateOrderStatus(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Orders");
  if (!sheet)
    return jsonResponse({ success: false, error: "Orders sheet not found" });
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.id)) {
      const statusCol = data[0].indexOf("status");
      if (statusCol >= 0)
        sheet.getRange(i + 1, statusCol + 1).setValue(body.status);
      break;
    }
  }
  return jsonResponse({ success: true });
}

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════
function safeParseJSON(str, fallback) {
  try {
    if (!str) return fallback;
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function formatDate(d) {
  try {
    if (d instanceof Date) return d.toISOString().split("T")[0];
    return String(d);
  } catch (e) {
    return String(d);
  }
}
