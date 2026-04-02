// ============================================================
//  ByBens Admin Panel — Google Apps Script Backend
// ============================================================

// ── CONFIG ──────────────────────────────────────────────────
var SPREADSHEET_ID = ""; // ← paste your sheet ID here after first run

var SHEET_CATEGORIES = "Categories";
var SHEET_SUBCATEGORIES = "SubCategories";
var SHEET_PRODUCTS = "Products";
var SHEET_PROMOS = "PromoCodes";

// ── ENTRY POINTS ────────────────────────────────────────────
function doGet(e) {
  return handleRequest(e);
}
function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var params = e.parameter || {};
    var body = {};
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (_) {}
    }

    var action = params.action || body.action || "";
    var result;

    switch (action) {
      case "init":
        result = initSheets();
        break;
      case "getCategories":
        result = getCategories();
        break;
      case "addCategory":
        result = addCategory(body);
        break;
      case "deleteCategory":
        result = deleteCategory(body);
        break;
      case "addSubCategory":
        result = addSubCategory(body);
        break;
      case "deleteSubCategory":
        result = deleteSubCategory(body);
        break;
      case "getProducts":
        result = getProducts();
        break;
      case "addProduct":
        result = addProduct(body);
        break;
      case "updateProduct":
        result = updateProduct(body);
        break;
      case "deleteProduct":
        result = deleteProduct(body);
        break;
      case "getPromos":
        result = getPromos();
        break;
      case "addPromo":
        result = addPromo(body);
        break;
      case "updatePromo":
        result = updatePromo(body);
        break;
      case "deletePromo":
        result = deletePromo(body);
        break;
      default:
        result = { error: "Unknown action: " + action };
    }

    return buildResponse(result);
  } catch (err) {
    return buildResponse({ error: err.message });
  }
}

function buildResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ── SPREADSHEET HELPER ──────────────────────────────────────
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  var ss = SpreadsheetApp.create("ByBens Database");
  Logger.log("NEW SPREADSHEET ID: " + ss.getId());
  Logger.log(
    "Open it here: https://docs.google.com/spreadsheets/d/" + ss.getId(),
  );
  SPREADSHEET_ID = ss.getId();
  return ss;
}

function getSheet(name) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// ── INIT SHEETS ─────────────────────────────────────────────
function initSheets() {
  setupCategoriesSheet();
  setupSubCategoriesSheet();
  setupProductsSheet();
  setupPromosSheet();

  var ss = getSpreadsheet();
  var def = ss.getSheetByName("Sheet1");
  if (def) ss.deleteSheet(def);

  return {
    success: true,
    spreadsheetId: ss.getId(),
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/" + ss.getId(),
    message:
      "All sheets initialized. Copy the spreadsheetId above into SPREADSHEET_ID.",
  };
}

function setupCategoriesSheet() {
  var s = getSheet(SHEET_CATEGORIES);
  if (s.getLastRow() === 0) {
    s.appendRow(["id", "name", "description", "createdAt"]);
    formatHeader(s);
  }
}

function setupSubCategoriesSheet() {
  var s = getSheet(SHEET_SUBCATEGORIES);
  if (s.getLastRow() === 0) {
    s.appendRow(["id", "categoryId", "categoryName", "name", "createdAt"]);
    formatHeader(s);
  }
}

function setupProductsSheet() {
  var s = getSheet(SHEET_PRODUCTS);
  if (s.getLastRow() === 0) {
    s.appendRow([
      "id",
      "name",
      "brand",
      "description",
      "categories",
      "imageUrl",
      "variants",
      "flavors",
      "discount",
      "allowPromo",
      "status",
      "createdAt",
    ]);
    formatHeader(s);
  }
}

function setupPromosSheet() {
  var s = getSheet(SHEET_PROMOS);
  if (s.getLastRow() === 0) {
    s.appendRow([
      "id",
      "code",
      "type",
      "value",
      "expiryDate",
      "status",
      "createdAt",
    ]);
    formatHeader(s);
  }
}

function formatHeader(sheet) {
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  header.setBackground("#ad0000");
  header.setFontColor("#ffffff");
  header.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

// ── GENERATE ID ─────────────────────────────────────────────
function generateId() {
  return (
    new Date().getTime().toString() +
    Math.floor(Math.random() * 1000).toString()
  );
}

// ── CATEGORIES ──────────────────────────────────────────────
function getCategories() {
  var catSheet = getSheet(SHEET_CATEGORIES);
  var subSheet = getSheet(SHEET_SUBCATEGORIES);
  var catData = catSheet.getDataRange().getValues();
  var subData = subSheet.getDataRange().getValues();

  if (catData.length <= 1) return { categories: [] };

  var catHeaders = catData[0];
  var subHeaders = subData[0];

  var categories = catData.slice(1).map(function (row) {
    var cat = rowToObj(row, catHeaders);
    var subs = [];
    if (subData.length > 1) {
      subs = subData
        .slice(1)
        .filter(function (sr) {
          return (
            String(sr[subHeaders.indexOf("categoryId")]) === String(cat.id)
          );
        })
        .map(function (sr) {
          return rowToObj(sr, subHeaders);
        });
    }
    cat.subCategories = subs;
    return cat;
  });

  return { categories: categories };
}

function addCategory(body) {
  var name = (body.name || "").trim();
  if (!name) return { error: "Category name is required" };

  var sheet = getSheet(SHEET_CATEGORIES);
  var id = generateId();
  var now = new Date().toISOString();

  sheet.appendRow([id, name, body.description || "", now]);

  var addedSubs = [];
  if (body.subCategories && Array.isArray(body.subCategories)) {
    body.subCategories.forEach(function (subName) {
      subName = (subName || "").trim();
      if (subName) {
        addedSubs.push(addSubCategoryDirect(id, name, subName));
      }
    });
  }

  return { success: true, id: id, name: name, subCategories: addedSubs };
}

function deleteCategory(body) {
  var id = String(body.id || "");
  var sheet = getSheet(SHEET_CATEGORIES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) {
      sheet.deleteRow(i + 1);
      deleteSubCategoriesByCatId(id);
      return { success: true };
    }
  }
  return { error: "Category not found" };
}

// ── SUBCATEGORIES ────────────────────────────────────────────
function addSubCategoryDirect(categoryId, categoryName, name) {
  var sheet = getSheet(SHEET_SUBCATEGORIES);
  var id = generateId();
  var now = new Date().toISOString();
  sheet.appendRow([id, categoryId, categoryName, name, now]);
  return {
    id: id,
    categoryId: categoryId,
    categoryName: categoryName,
    name: name,
  };
}

function addSubCategory(body) {
  var categoryId = String(body.categoryId || "").trim();
  var categoryName = (body.categoryName || "").trim();
  var name = (body.name || "").trim();

  if (!categoryId) return { error: "categoryId is required" };
  if (!name) return { error: "Sub-category name is required" };

  if (!categoryName) {
    var cats = getSheet(SHEET_CATEGORIES).getDataRange().getValues();
    for (var i = 1; i < cats.length; i++) {
      if (String(cats[i][0]) === categoryId) {
        categoryName = cats[i][1];
        break;
      }
    }
  }

  return {
    success: true,
    subCategory: addSubCategoryDirect(categoryId, categoryName, name),
  };
}

function deleteSubCategory(body) {
  var id = String(body.id || "");
  var sheet = getSheet(SHEET_SUBCATEGORIES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: "Sub-category not found" };
}

function deleteSubCategoriesByCatId(categoryId) {
  var sheet = getSheet(SHEET_SUBCATEGORIES);
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]) === categoryId) {
      sheet.deleteRow(i + 1);
    }
  }
}

// ── PRODUCTS ─────────────────────────────────────────────────
function getProducts() {
  var sheet = getSheet(SHEET_PRODUCTS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { products: [] };

  var headers = data[0];
  var products = data.slice(1).map(function (row) {
    var p = rowToObj(row, headers);
    try {
      p.categories = JSON.parse(p.categories || "[]");
    } catch (_) {
      p.categories = [];
    }
    try {
      p.variants = JSON.parse(p.variants || "[]");
    } catch (_) {
      p.variants = [];
    }
    try {
      p.flavors = JSON.parse(p.flavors || "[]");
    } catch (_) {
      p.flavors = [];
    }
    p.allowPromo =
      p.allowPromo === true ||
      p.allowPromo === "TRUE" ||
      p.allowPromo === "true";
    p.discount = Number(p.discount) || 0;
    return p;
  });

  return { products: products };
}

function addProduct(body) {
  var name = (body.name || "").trim();
  if (!name) return { error: "Product name is required" };

  var sheet = getSheet(SHEET_PRODUCTS);
  var id = generateId();
  var now = new Date().toISOString();

  sheet.appendRow([
    id,
    name,
    body.brand || "",
    body.description || "",
    JSON.stringify(body.categories || []),
    body.imageUrl || "",
    JSON.stringify(body.variants || []),
    JSON.stringify(body.flavors || []),
    body.discount || 0,
    body.allowPromo ? "TRUE" : "FALSE",
    body.status || "active",
    now,
  ]);

  return { success: true, id: id, name: name };
}

function updateProduct(body) {
  var id = String(body.id || "");
  var sheet = getSheet(SHEET_PRODUCTS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) {
      var row = i + 1;
      setCell(
        sheet,
        row,
        headers,
        "name",
        body.name || data[i][headers.indexOf("name")],
      );
      setCell(
        sheet,
        row,
        headers,
        "brand",
        body.brand !== undefined
          ? body.brand
          : data[i][headers.indexOf("brand")],
      );
      setCell(
        sheet,
        row,
        headers,
        "description",
        body.description !== undefined
          ? body.description
          : data[i][headers.indexOf("description")],
      );
      setCell(
        sheet,
        row,
        headers,
        "categories",
        JSON.stringify(body.categories || []),
      );
      if (body.imageUrl)
        setCell(sheet, row, headers, "imageUrl", body.imageUrl);
      setCell(
        sheet,
        row,
        headers,
        "variants",
        JSON.stringify(body.variants || []),
      );
      setCell(
        sheet,
        row,
        headers,
        "flavors",
        JSON.stringify(body.flavors || []),
      );
      setCell(sheet, row, headers, "discount", body.discount || 0);
      setCell(
        sheet,
        row,
        headers,
        "allowPromo",
        body.allowPromo ? "TRUE" : "FALSE",
      );
      setCell(sheet, row, headers, "status", body.status || "active");
      return { success: true };
    }
  }
  return { error: "Product not found" };
}

function deleteProduct(body) {
  var id = String(body.id || "");
  var sheet = getSheet(SHEET_PRODUCTS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: "Product not found" };
}

// ── PROMO CODES ──────────────────────────────────────────────
function getPromos() {
  var sheet = getSheet(SHEET_PROMOS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { promos: [] };

  var headers = data[0];
  return {
    promos: data.slice(1).map(function (row) {
      return rowToObj(row, headers);
    }),
  };
}

function addPromo(body) {
  var code = (body.code || "").trim().toUpperCase();
  if (!code) return { error: "Promo code is required" };

  var sheet = getSheet(SHEET_PROMOS);
  var data = sheet.getDataRange().getValues();
  var headers = data.length > 0 ? data[0] : [];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][headers.indexOf("code")]).toUpperCase() === code) {
      return { error: "Promo code already exists" };
    }
  }

  var id = generateId();
  var now = new Date().toISOString();

  sheet.appendRow([
    id,
    code,
    body.type || "percent",
    body.value || 0,
    body.expiryDate || "",
    body.status || "active",
    now,
  ]);

  return { success: true, id: id, code: code };
}

function updatePromo(body) {
  var id = String(body.id || "");
  var sheet = getSheet(SHEET_PROMOS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) {
      var row = i + 1;
      if (body.code)
        setCell(sheet, row, headers, "code", body.code.toUpperCase());
      if (body.type) setCell(sheet, row, headers, "type", body.type);
      if (body.value !== undefined)
        setCell(sheet, row, headers, "value", body.value);
      if (body.expiryDate !== undefined)
        setCell(sheet, row, headers, "expiryDate", body.expiryDate);
      if (body.status) setCell(sheet, row, headers, "status", body.status);
      return { success: true };
    }
  }
  return { error: "Promo not found" };
}

function deletePromo(body) {
  var id = String(body.id || "");
  var sheet = getSheet(SHEET_PROMOS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: "Promo not found" };
}

// ── UTILITIES ─────────────────────────────────────────────────
function rowToObj(row, headers) {
  var obj = {};
  headers.forEach(function (h, i) {
    obj[h] = row[i];
  });
  return obj;
}

function setCell(sheet, row, headers, colName, value) {
  var colIdx = headers.indexOf(colName);
  if (colIdx >= 0) sheet.getRange(row, colIdx + 1).setValue(value);
}
