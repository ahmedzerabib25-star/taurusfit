/* ══════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════ */
const SUPABASE_URL = "https://rgbmfstbvqzvgxadjxrb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYm1mc3RidnF6dmd4YWRqeHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDcxNDYsImV4cCI6MjA5ODUyMzE0Nn0.RWnBzmNPonwj7eZz5X0mMpEODFP5Jo6iAmBWdRDQBs4";
const CART_KEY = "bybens_cart";

let _allProducts = [];
let _allCategories = [];
let _allSubCategories = [];
let _allSubSubCategories = [];

function parseField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const s = String(val).trim();
  if (s === "" || s === "[]") return [];
  if (s.startsWith("[")) {
    try {
      return JSON.parse(s);
    } catch (e) {}
  }
  return s.split(",").map((v) => v.trim()).filter(Boolean);
}

function getProductPrice(p) {
  const variants = parseField(p.variants);
  const base = variants.length ? Number(variants[0].price) || 0 : 0;
  const disc = Number(p.discount) || 0;
  return disc > 0 ? Math.round(base * (1 - disc / 100)) : base;
}

/* ══════════════════════════════════════════════════════
   CART BADGE
══════════════════════════════════════════════════════ */
function cartGet() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}
function cartUpdateBadge() {
  const n = cartGet().reduce((s, i) => s + (i.qty || 0), 0);
  const b = document.getElementById("cartBadge");
  if (!b) return;
  b.textContent = n;
  b.style.display = n === 0 ? "none" : "";
}

/* ══════════════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════════════ */
function handleSearch(query) {
  const dropdown = document.getElementById("searchDropdown");
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    dropdown.classList.remove("open");
    dropdown.innerHTML = "";
    return;
  }
  const matches = _allProducts.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q),
  );
  if (!matches.length) {
    dropdown.innerHTML = `<div class="search-drop-empty">No results for "${query}"</div>`;
    dropdown.classList.add("open");
    return;
  }
  dropdown.innerHTML = matches
    .map((p) => {
      const price = getProductPrice(p).toLocaleString("fr-DZ");
      const _t0 = Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl;
      const thumb = _t0
        ? `<img src="${_t0}" alt="${p.name}" />`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>`;
      return `
      <div class="search-drop-item" onclick="window.location.href='/product-detail?id=${p.id}'">
        <div class="search-drop-thumb">${thumb}</div>
        <div class="search-drop-info">
          <p class="search-drop-brand">${p.brand || ""}</p>
          <p class="search-drop-name">${prodName(p)}</p>
        </div>
        <span class="search-drop-price">${price} DA</span>
      </div>`;
    })
    .join("");
  dropdown.classList.add("open");
}

document.addEventListener("DOMContentLoaded", () => {
  const si = document.getElementById("searchInput");
  if (si) {
    si.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const dd = document.getElementById("searchDropdown");
        if (dd) dd.classList.remove("open");
      }
      if (e.key === "Enter") {
        const q = e.target.value.trim();
        if (q) window.location.href = `/products?q=${encodeURIComponent(q)}`;
      }
    });
  }
  document.addEventListener("click", (e) => {
    const ds = document.getElementById("desktopSearch");
    if (ds && !ds.contains(e.target)) {
      const dd = document.getElementById("searchDropdown");
      if (dd) dd.classList.remove("open");
    }
  });
});

/* ══════════════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════════════ */
function toggleMobileMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("mobileOverlay");
  const isOpen = menu.classList.toggle("open");
  if (overlay) overlay.classList.toggle("open", isOpen);
  btn.classList.toggle("open", isOpen);
  btn.setAttribute("aria-expanded", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

function toggleMobileCat(btn) {
  const item = btn.closest(".m-cat-item");
  const isOpen = item.classList.contains("open");
  document.querySelectorAll(".m-cat-item.open").forEach((el) => el.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}

function toggleMobileSubCat(btn) {
  const item = btn.closest(".m-subsub-cat-item");
  const parent = item.closest(".m-sub");
  const isOpen = item.classList.contains("open");
  if (parent) {
    parent.querySelectorAll(".m-subsub-cat-item.open").forEach((el) => el.classList.remove("open"));
  }
  if (!isOpen) item.classList.add("open");
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  document.getElementById("toastMsg").textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function scrollToFooter(e) {
  if (e) e.preventDefault();
  const footer = document.querySelector(".site-footer") || document.getElementById("footerPlaceholder");
  if (footer) footer.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ══════════════════════════════════════════════════════
   CATEGORY NAV (mobile accordion — cat > sub > sub-sub)
══════════════════════════════════════════════════════ */
function renderCatNav(cats, subs, subSubs) {
  const mobile = document.getElementById("mobileCatItems");
  if (!mobile) return;
  const chevron = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>`;
  const viewAllLabel = currentLang === "ar" ? "الكل" : currentLang === "fr" ? "Tout voir" : "View All";
  mobile.innerHTML = cats
    .map((cat) => {
      const catSubs = subs.filter((s) => Array.isArray(s.categoryIds) && s.categoryIds.includes(cat.id));
      const label = catName(cat);
      if (catSubs.length === 0) {
        return `<a href="/products?cat=${encodeURIComponent(cat.id)}" class="m-link">${label}</a>`;
      }
      return `
        <div class="m-cat-item">
          <button class="m-link m-cat-toggle" onclick="toggleMobileCat(this)">
            <span>${label}</span> ${chevron}
          </button>
          <div class="m-sub">
            <a href="/products?cat=${encodeURIComponent(cat.id)}" class="m-sub-link m-sub-all">${label} — ${viewAllLabel}</a>
            ${catSubs
              .map((s) => {
                const subLabel = catName(s);
                const subSubItems = (subSubs || []).filter((ss) => Array.isArray(ss.subCategoryIds) && ss.subCategoryIds.includes(s.id));
                if (subSubItems.length === 0) {
                  return `<a href="/products?sub=${encodeURIComponent(s.id)}" class="m-sub-link">${subLabel}</a>`;
                }
                return `
                  <div class="m-subsub-cat-item">
                    <button class="m-sub-link m-subsub-toggle" onclick="toggleMobileSubCat(this)">
                      <span>${subLabel}</span> ${chevron}
                    </button>
                    <div class="m-subsub">
                      <a href="/products?sub=${encodeURIComponent(s.id)}" class="m-subsub-link m-subsub-all">${subLabel} — ${viewAllLabel}</a>
                      ${subSubItems.map((ss) => `<a href="/products?subsub=${encodeURIComponent(ss.id)}" class="m-subsub-link">${catName(ss)}</a>`).join("")}
                    </div>
                  </div>`;
              })
              .join("")}
          </div>
        </div>`;
    })
    .join("");
}

/* ══════════════════════════════════════════════════════
   PAGE LOADER
══════════════════════════════════════════════════════ */
var _wlStart = Date.now();
function hideLoader() {
  var s = document.getElementById("dataSpinner");
  if (s) s.style.display = "none";
  var l = document.getElementById("pageLoader");
  if (!l || l._exiting) return;
  sessionStorage.setItem("bb_wl", "1");
  var delay = Math.max(0, 1600 - (Date.now() - _wlStart));
  setTimeout(function () {
    l._exiting = true;
    l.classList.add("wl-exit");
    setTimeout(function () {
      l.classList.add("hidden");
    }, 700);
  }, delay);
}

/* ══════════════════════════════════════════════════════
   DATA LOADING
══════════════════════════════════════════════════════ */
async function loadData() {
  try {
    const res = await getInitialData();
    if (!res || !res.success) throw new Error("getInitialData failed");
    _allCategories = res.categories || [];
    _allSubCategories = res.subCategories || [];
    _allSubSubCategories = res.subSubCategories || [];
    _allProducts = res.products || [];
    renderCatNav(_allCategories, _allSubCategories, _allSubSubCategories);

    const footerList = document.getElementById("footerCategoryList");
    if (footerList) {
      footerList.innerHTML = _allCategories
        .slice(0, 6)
        .map((cat) => `<li><a href="/products?cat=${encodeURIComponent(cat.id)}">${catName(cat)}</a></li>`)
        .join("");
    }
  } catch (err) {
    console.error("Failed to load data:", err);
  }
  hideLoader();
}

/* ══════════════════════════════════════════════════════
   SCROLL
══════════════════════════════════════════════════════ */
window.addEventListener(
  "scroll",
  () => {
    const st = document.getElementById("scrollTop");
    if (st) st.classList.toggle("visible", window.scrollY > 400);
  },
  { passive: true },
);

(function () {
  var bar = document.getElementById("scroll-progress");
  if (!bar) return;
  window.addEventListener(
    "scroll",
    function () {
      var scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = Math.min(scrolled, 100) + "%";
    },
    { passive: true },
  );
})();

/* ══════════════════════════════════════════════════════
   I18N
══════════════════════════════════════════════════════ */
const i18n = {
  en: {
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.contact": "Contact",
    "search.placeholder": "Search carpets, rugs, home decor…",
    "search.cancel": "Cancel",
    "footer.brand.desc": "Algeria's destination for handpicked carpets and home furnishings. We bring quality pieces directly to your door.",
    "footer.links": "Quick Links",
    "footer.shipping": "Shipping Policy",
    "footer.returns": "Returns",
    "footer.privacy": "Privacy Policy",
    "footer.categories": "Categories",
    "footer.contact": "Send a Message",
    "footer.rights": "All rights reserved.",
    "form.name": "Your Name",
    "form.email": "Email / Phone",
    "form.message": "Message",
    "form.send": "Send Message",
    "shipping.title": "Courier & Shipping",
    "shipping.item1.title": "Nationwide Delivery",
    "shipping.item1.text": "We deliver to all 69 Wilayas across Algeria with care and speed via Imir Logistics.",
    "shipping.item2.title": "Complimentary Shipping",
    "shipping.item2.text": "Orders exceeding 15,000 DA enjoy complimentary shipping. Standard rates apply otherwise.",
    "shipping.item3.title": "Dispatch Timeline",
    "shipping.item3.text": "Your orders are processed within 24 hours. Delivery takes 2-4 business days for major metropolitan hubs.",
    "returns.title": "Returns & Exchange",
    "returns.item1.title": "Exchanges & Returns",
    "returns.item1.text": "We offer a 7-day return policy for unopened items in their original packaging with intact seals.",
    "returns.item2.title": "Easy Support",
    "returns.item2.text": "Contact us via WhatsApp or Instagram to initiate a return. We will arrange the courier return for you.",
    "returns.item3.title": "Maison Credit",
    "returns.item3.text": "Following inspection, we issue store credit, exchanges, or refunds, ensuring your satisfaction.",
    "about.who.title": "Our Heritage",
    "about.who.text": "Maison Comfort is a home furnishings house, dedicated to bringing carpets and decor of lasting quality to Algerian homes.",
    "about.order.title": "How To Order",
    "about.order.text": "Choose your carpet's size and color, then add it to your cart. Complete your address without registration, and enjoy careful Cash on Arrival delivery.",
    "about.cta": "Shop Collection",
    "toast.sent": "Your message has been sent to our team.",
    "privacy.eyebrow": "Maison Comfort",
    "privacy.title": "Privacy <em>Policy</em>",
    "privacy.updated": "Last updated: July 2026",
    "privacy.intro": "Maison Comfort is committed to protecting your privacy. This policy explains what personal information we collect, how we use it, and your rights.",
    "privacy.s1.title": "Information We Collect",
    "privacy.s1.text": "When you place an order, we collect your first name, last name, phone number, delivery address, wilaya, and commune. When you contact us via the contact form, we collect your name and email or phone number, along with your message.",
    "privacy.s2.title": "How We Use Your Information",
    "privacy.s2.text": "Your data is used solely to process and deliver your orders, respond to your messages, and improve our service. We never sell, rent, or share your personal data with third parties for marketing purposes.",
    "privacy.s3.title": "Payment Information",
    "privacy.s3.text": "Maison Comfort operates on a cash on delivery basis only. We do not collect, store, or process any payment card or banking information.",
    "privacy.s4.title": "Cookies & Local Storage",
    "privacy.s4.text": "We use your browser's local storage to save your shopping cart, language, and theme preference. This data stays on your device and is never transmitted to our servers.",
    "privacy.s5.title": "Third-Party Services",
    "privacy.s5.text": "We use Supabase for secure database and image storage, and Vercel for website hosting. Each service operates under its own privacy policy.",
    "privacy.s6.title": "Data Retention",
    "privacy.s6.text": "Order information is retained as long as necessary for business operations and legal obligations. You may request deletion of your personal data at any time by contacting us.",
    "privacy.s7.title": "Your Rights",
    "privacy.s7.text": "You have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact us via WhatsApp, Instagram, Facebook, or TikTok.",
    "privacy.s8.title": "Contact",
    "privacy.s8.text": "For any privacy-related questions, reach us on WhatsApp, Instagram, Facebook, or TikTok — links in the footer below.",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.products": "Tapis",
    "nav.contact": "Contact",
    "search.placeholder": "Rechercher tapis, décoration…",
    "search.cancel": "Annuler",
    "footer.brand.desc": "La destination en Algérie pour des tapis et de la décoration d'intérieur sélectionnés. Nous livrons des pièces de qualité directement à votre porte.",
    "footer.links": "Liens rapides",
    "footer.shipping": "Livraison",
    "footer.returns": "Retours",
    "footer.privacy": "Politique de Confidentialité",
    "footer.categories": "Catégories",
    "footer.contact": "Envoyer un message",
    "footer.rights": "Tous droits réservés.",
    "form.name": "Votre nom",
    "form.email": "Email / Téléphone",
    "form.message": "Message",
    "form.send": "Envoyer",
    "shipping.title": "Livraison & Expédition",
    "shipping.item1.title": "Livraison Nationale",
    "shipping.item1.text": "Nous livrons dans les 69 wilayas d'Algérie avec une attention particulière via Imir Logistics.",
    "shipping.item2.title": "Livraison Offerte",
    "shipping.item2.text": "Les commandes de plus de 15 000 DA bénéficient de la livraison offerte. Des tarifs standards s'appliquent sinon.",
    "shipping.item3.title": "Délais de Livraison",
    "shipping.item3.text": "Les commandes sont traitées sous 24h et livrées sous 2 à 4 jours ouvrables pour les grandes villes.",
    "returns.title": "Retours & Échanges",
    "returns.item1.title": "Politique de Retour",
    "returns.item1.text": "Vous disposez de 7 jours pour retourner un produit non ouvert dans son emballage d'origine, avec scellé intact.",
    "returns.item2.title": "Assistance Dédiée",
    "returns.item2.text": "Contactez-nous via WhatsApp ou Instagram. Nous organiserons le retour par coursier à votre convenance.",
    "returns.item3.title": "Avoir de la Maison",
    "returns.item3.text": "Après vérification, nous procédons à un échange ou à l'émission d'un crédit boutique pour votre entière satisfaction.",
    "about.who.title": "Notre Héritage",
    "about.who.text": "Maison Comfort est une maison de décoration d'intérieur, dédiée à apporter des tapis et une décoration de qualité durable aux foyers algériens.",
    "about.order.title": "Comment Commander",
    "about.order.text": "Choisissez la taille et la couleur de votre tapis, puis ajoutez-le au panier. Complétez votre adresse sans inscription, et profitez d'une livraison soignée en paiement à la livraison.",
    "about.cta": "Voir la Collection",
    "toast.sent": "Votre message a été transmis à notre équipe.",
    "privacy.eyebrow": "Maison Comfort",
    "privacy.title": "Politique de <em>Confidentialité</em>",
    "privacy.updated": "Dernière mise à jour : juillet 2026",
    "privacy.intro": "Maison Comfort s'engage à protéger votre vie privée. Cette politique explique quelles informations personnelles nous collectons, comment nous les utilisons, et vos droits.",
    "privacy.s1.title": "Informations que Nous Collectons",
    "privacy.s1.text": "Lorsque vous passez une commande, nous collectons votre prénom, nom, numéro de téléphone, adresse de livraison, wilaya et commune. Lorsque vous nous contactez via le formulaire, nous collectons votre nom, votre email ou téléphone, ainsi que votre message.",
    "privacy.s2.title": "Comment Nous Utilisons Vos Informations",
    "privacy.s2.text": "Vos données sont utilisées uniquement pour traiter et livrer vos commandes, répondre à vos messages, et améliorer notre service. Nous ne vendons, ne louons ni ne partageons jamais vos données personnelles à des fins marketing.",
    "privacy.s3.title": "Informations de Paiement",
    "privacy.s3.text": "Maison Comfort fonctionne uniquement en paiement à la livraison. Nous ne collectons, ne stockons ni ne traitons aucune information de carte bancaire.",
    "privacy.s4.title": "Cookies et Stockage Local",
    "privacy.s4.text": "Nous utilisons le stockage local de votre navigateur pour sauvegarder votre panier, votre langue et votre préférence de thème. Ces données restent sur votre appareil et ne sont jamais transmises à nos serveurs.",
    "privacy.s5.title": "Services Tiers",
    "privacy.s5.text": "Nous utilisons Supabase pour le stockage sécurisé de la base de données et des images, et Vercel pour l'hébergement du site. Chaque service opère selon sa propre politique de confidentialité.",
    "privacy.s6.title": "Conservation des Données",
    "privacy.s6.text": "Les informations de commande sont conservées aussi longtemps que nécessaire pour les besoins opérationnels et légaux. Vous pouvez demander la suppression de vos données personnelles à tout moment en nous contactant.",
    "privacy.s7.title": "Vos Droits",
    "privacy.s7.text": "Vous avez le droit d'accéder, de corriger ou de demander la suppression de vos données personnelles. Pour exercer ces droits, contactez-nous via WhatsApp, Instagram, Facebook ou TikTok.",
    "privacy.s8.title": "Contact",
    "privacy.s8.text": "Pour toute question relative à la confidentialité, contactez-nous via WhatsApp, Instagram, Facebook ou TikTok — liens dans le pied de page ci-dessous.",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.products": "السجاد",
    "nav.contact": "اتصل بنا",
    "search.placeholder": "ابحث عن سجاد وأثاث منزلي…",
    "search.cancel": "إلغاء",
    "footer.brand.desc": "وجهتك في الجزائر لسجاد وأثاث منزلي مختار بعناية. نوصل لك قطعًا عالية الجودة مباشرة إلى بابك.",
    "footer.links": "روابط سريعة",
    "footer.shipping": "سياسة الشحن",
    "footer.returns": "الإرجاع",
    "footer.privacy": "سياسة الخصوصية",
    "footer.categories": "الفئات",
    "footer.contact": "أرسل رسالة",
    "footer.rights": "جميع الحقوق محفوظة.",
    "form.name": "الاسم الكامل",
    "form.email": "البريد الإلكتروني / الهاتف",
    "form.message": "الرسالة",
    "form.send": "إرسال",
    "shipping.title": "التوصيل والشحن",
    "shipping.item1.title": "توصيل وطني",
    "shipping.item1.text": "نوصل إلى جميع الولايات الـ69 في الجزائر بعناية وسرعة عبر Imir Logistics.",
    "shipping.item2.title": "شحن مجاني",
    "shipping.item2.text": "الطلبات التي تتجاوز 15,000 دج تستفيد من شحن مجاني. تُطبَّق أسعار عادية غير ذلك.",
    "shipping.item3.title": "مدة المعالجة",
    "shipping.item3.text": "تتم معالجة طلباتك خلال 24 ساعة. يستغرق التوصيل من 2 إلى 4 أيام عمل للمدن الكبرى.",
    "returns.title": "الإرجاع والاستبدال",
    "returns.item1.title": "سياسة الإرجاع",
    "returns.item1.text": "لديك 7 أيام لإرجاع منتج غير مفتوح في عبوته الأصلية وبختمه سليمًا.",
    "returns.item2.title": "دعم سهل",
    "returns.item2.text": "تواصل معنا عبر واتساب أو إنستغرام لبدء عملية الإرجاع. سننظم استرجاع الطرد نيابة عنك.",
    "returns.item3.title": "رصيد الميزون",
    "returns.item3.text": "بعد الفحص، نقدم رصيدًا في المتجر أو استبدالًا أو استرجاعًا لضمان رضاك التام.",
    "about.who.title": "إرثنا",
    "about.who.text": "ميزون كومفور هي دار لأثاث المنزل، مكرّسة لإحضار سجاد وديكور بجودة تدوم إلى المنازل الجزائرية.",
    "about.order.title": "كيفية الطلب",
    "about.order.text": "اختر مقاس ولون السجادة، ثم أضفها إلى سلتك. أكمل عنوانك دون تسجيل، واستمتع بتوصيل دفع عند الاستلام.",
    "about.cta": "تسوق المجموعة",
    "toast.sent": "تم إرسال رسالتك إلى فريقنا.",
    "privacy.eyebrow": "ميزون كومفور",
    "privacy.title": "سياسة <em>الخصوصية</em>",
    "privacy.updated": "آخر تحديث: يوليو 2026",
    "privacy.intro": "تلتزم ميزون كومفور بحماية خصوصيتك. توضح هذه السياسة المعلومات الشخصية التي نجمعها، وكيفية استخدامها، وحقوقك.",
    "privacy.s1.title": "المعلومات التي نجمعها",
    "privacy.s1.text": "عند إتمام طلبك، نجمع اسمك الأول واللقب ورقم الهاتف وعنوان التوصيل والولاية والبلدية. عند التواصل معنا عبر نموذج الاتصال، نجمع اسمك وبريدك الإلكتروني أو هاتفك، مع رسالتك.",
    "privacy.s2.title": "كيف نستخدم معلوماتك",
    "privacy.s2.text": "تُستخدم بياناتك فقط لمعالجة وتوصيل طلباتك، والرد على رسائلك، وتحسين خدماتنا. لا نبيع أو نؤجر أو نشارك بياناتك الشخصية مع أطراف ثالثة لأغراض تسويقية.",
    "privacy.s3.title": "معلومات الدفع",
    "privacy.s3.text": "تعمل ميزون كومفور بنظام الدفع عند الاستلام فقط. لا نجمع أو نخزن أو نعالج أي معلومات بطاقة دفع أو مصرفية.",
    "privacy.s4.title": "ملفات تعريف الارتباط والتخزين المحلي",
    "privacy.s4.text": "نستخدم التخزين المحلي لمتصفحك لحفظ سلة التسوق واللغة وتفضيل المظهر. تبقى هذه البيانات على جهازك ولا تُرسل أبدًا إلى خوادمنا.",
    "privacy.s5.title": "خدمات الأطراف الثالثة",
    "privacy.s5.text": "نستخدم Supabase لتخزين قاعدة البيانات والصور بأمان، و Vercel لاستضافة الموقع. تعمل كل خدمة وفق سياسة الخصوصية الخاصة بها.",
    "privacy.s6.title": "الاحتفاظ بالبيانات",
    "privacy.s6.text": "يتم الاحتفاظ بمعلومات الطلب طالما كان ذلك ضروريًا للعمليات التجارية والالتزامات القانونية. يمكنك طلب حذف بياناتك الشخصية في أي وقت بالتواصل معنا.",
    "privacy.s7.title": "حقوقك",
    "privacy.s7.text": "لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو طلب حذفها. لممارسة هذه الحقوق، تواصل معنا عبر واتساب أو إنستغرام أو فيسبوك أو تيك توك.",
    "privacy.s8.title": "اتصل بنا",
    "privacy.s8.text": "لأي أسئلة تتعلق بالخصوصية، تواصل معنا عبر واتساب أو إنستغرام أو فيسبوك أو تيك توك — الروابط في أسفل الصفحة.",
  },
};

let currentLang = "fr";
window.i18n = i18n;
window.currentLang = currentLang;

function catName(item) {
  if (!item) return "";
  const key = "name" + currentLang.charAt(0).toUpperCase() + currentLang.slice(1);
  return item[key] || item.nameEn || item.name || "";
}
function prodName(p) {
  if (!p) return "";
  const key = "name" + currentLang.charAt(0).toUpperCase() + currentLang.slice(1);
  return p[key] || p.nameEn || p.name || "";
}

function switchLang(lang) {
  localStorage.setItem("bybens_lang", lang);
  if (window.updateAnnouncementLang) window.updateAnnouncementLang(lang);
  currentLang = lang;
  window.currentLang = lang;
  const t = i18n[lang];
  const isRtl = lang === "ar";
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.body.classList.toggle("lang-ar", isRtl);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = t[key];
      } else {
        el.innerHTML = t[key];
      }
    }
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  sanitizeFooterBrand(lang);
  renderCatNav(_allCategories, _allSubCategories, _allSubSubCategories);
  const footerList = document.getElementById("footerCategoryList");
  if (footerList) {
    footerList.innerHTML = _allCategories
      .slice(0, 6)
      .map((cat) => `<li><a href="/products?cat=${encodeURIComponent(cat.id)}">${catName(cat)}</a></li>`)
      .join("");
  }
}

function sanitizeFooterBrand(lang) {
  const footerText = document.querySelector(".footer-bottom p");
  if (footerText) {
    const year = new Date().getFullYear();
    footerText.innerHTML =
      lang === "fr"
        ? `© ${year} Maison Comfort Algérie. Tous droits réservés.`
        : lang === "ar"
          ? `© ${year} ميزون كومفور الجزائر. جميع الحقوق محفوظة.`
          : `© ${year} Maison Comfort Algeria. All rights reserved.`;
  }
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  cartUpdateBadge();
  loadData();

  const savedLang = localStorage.getItem("bybens_lang") || "fr";
  if (window.BYBENS_CONTENT) {
    ["en", "fr"].forEach(function (lang) {
      if (window.BYBENS_CONTENT[lang]) Object.assign(i18n[lang], window.BYBENS_CONTENT[lang]);
    });
  }
  if (savedLang !== "fr") switchLang(savedLang);
});
