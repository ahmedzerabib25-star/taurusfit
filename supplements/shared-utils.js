/**
 * Shared Utilities for ByBens Supplements
 */

window.BYBENS_CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzYEJF3vwS5nZDP2zmVXiYputV_qSRmXGOnBtEOmhqAqFg9Tygg8g90Wplljynbrq2_rQ/exec",
  CACHE_TTL: 5 * 60 * 1000,
  CART_KEY: "bybens_cart"
};

/* --- Data Parsing --- */
function parseField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const s = String(val).trim();
  if (s === "" || s === "[]") return [];
  if (s.startsWith("[")) {
    try { return JSON.parse(s); } catch (e) {}
  }
  return s.split(",").map(v => v.trim()).filter(Boolean);
}

/* --- Product Helpers --- */
function computeBadge(p, bundleId, topSoldIds) {
  if (Number(p.stock) <= 0) return { type: 'oos', label: 'OUT OF STOCK' };
  if (topSoldIds && topSoldIds.includes(p.id)) return { type: 'hot', label: 'HOT' };
  if (bundleId && p.id === bundleId) return { type: 'bundle', label: 'BUNDLE' };
  if (p.createdAt) {
    const c = new Date(p.createdAt), n = new Date();
    if (c.toDateString() === n.toDateString()) return { type: 'new', label: 'NEW' };
  }
  const disc = p.discount || 0;
  if (disc > 0) return { type: 'promo', label: 'PROMO' };
  return null;
}

/* --- Cart Management --- */
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem(window.BYBENS_CONFIG.CART_KEY)) || []; }
    catch { return []; }
  },
  save(items) {
    localStorage.setItem(window.BYBENS_CONFIG.CART_KEY, JSON.stringify(items));
  },
  count() {
    return this.get().reduce((s, i) => s + i.qty, 0);
  },
  updateBadge() {
    const n = this.count();
    const b = document.getElementById("cartBadge");
    if (!b) return;
    b.textContent = n;
    b.style.display = n === 0 ? "none" : "";
  }
};

/* --- UI Utilities --- */
function showToast(msg) {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toastMsg");
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  toast.classList.add("show");
  if (window.toastTimer) clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* --- Optimization --- */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}