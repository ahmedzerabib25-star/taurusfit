/**
 * TaurusFit — Dynamic Multi-Facebook Pixel Tracking System
 * Supports multi-pixel initialization & standard e-commerce events.
 */

(function () {
  var _initialized = false;
  var _activePixelIds = [];

  function _loadBaseScript() {
    if (window.fbq) return;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  }

  function parsePixelIds(raw) {
    if (!raw) return [];
    var list = raw;
    if (typeof raw === "string") {
      try {
        list = JSON.parse(raw);
      } catch (e) {
        // Fallback if comma separated string
        list = raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      }
    }
    if (!Array.isArray(list)) return [];

    var active = [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (typeof item === "string" && item.trim()) {
        active.push(item.trim());
      } else if (typeof item === "object" && item !== null && item.id) {
        if (item.active !== false && item.active !== "false") {
          active.push(String(item.id).trim());
        }
      }
    }
    return active;
  }

  function init(settingsOrRaw) {
    var raw = settingsOrRaw;
    if (settingsOrRaw && typeof settingsOrRaw === "object" && settingsOrRaw.facebook_pixel_ids !== undefined) {
      raw = settingsOrRaw.facebook_pixel_ids;
    }

    var ids = parsePixelIds(raw);
    if (!ids || ids.length === 0) return;

    _activePixelIds = ids;
    _loadBaseScript();

    for (var j = 0; j < ids.length; j++) {
      window.fbq("init", ids[j]);
    }

    if (!_initialized) {
      _initialized = true;
      window.fbq("track", "PageView");
    }
  }

  function track(eventName, params) {
    if (!_activePixelIds || _activePixelIds.length === 0 || !window.fbq) return;
    window.fbq("track", eventName, params || {});
  }

  function trackViewContent(product) {
    if (!product) return;
    track("ViewContent", {
      content_name: product.nameEn || product.name || "",
      content_ids: [String(product.id)],
      content_type: "product",
      value: Number(product.discount || product.price || 0),
      currency: "DZD",
    });
  }

  function trackAddToCart(product, quantity) {
    if (!product) return;
    var qty = Number(quantity) || 1;
    var unitPrice = Number(product.discount || product.price || 0);
    track("AddToCart", {
      content_name: product.nameEn || product.name || "",
      content_ids: [String(product.id)],
      content_type: "product",
      value: unitPrice * qty,
      currency: "DZD",
      num_items: qty,
    });
  }

  function trackInitiateCheckout(cartItems, totalValue) {
    var items = Array.isArray(cartItems) ? cartItems : [];
    var contentIds = items.map(function (item) { return String(item.id || item.productId); }).filter(Boolean);
    var numItems = items.reduce(function (acc, item) { return acc + (Number(item.quantity || item.qty) || 1); }, 0);

    track("InitiateCheckout", {
      content_ids: contentIds,
      content_type: "product",
      value: Number(totalValue) || 0,
      currency: "DZD",
      num_items: numItems,
    });
  }

  function trackPurchase(orderId, totalValue, cartItems) {
    var items = Array.isArray(cartItems) ? cartItems : [];
    var contentIds = items.map(function (item) { return String(item.id || item.productId); }).filter(Boolean);
    var numItems = items.reduce(function (acc, item) { return acc + (Number(item.quantity || item.qty) || 1); }, 0);

    track("Purchase", {
      content_ids: contentIds,
      content_type: "product",
      value: Number(totalValue) || 0,
      currency: "DZD",
      num_items: numItems,
      order_id: String(orderId || ""),
    });
  }

  window.TaurusPixel = {
    parsePixelIds: parsePixelIds,
    init: init,
    track: track,
    trackViewContent: trackViewContent,
    trackAddToCart: trackAddToCart,
    trackInitiateCheckout: trackInitiateCheckout,
    trackPurchase: trackPurchase,
  };
})();
