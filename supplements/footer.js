/**
 * ByBen's E-Commerce - Modular Footer Component
 * This script injects the footer HTML, styles, and handles modal logic.
 */

(function() {

  // Dark mode toggle — shared across all pages
  // logo-dark.png is used as the single logo in both light and dark mode
  function updateLogos(isDark) {
    document.querySelectorAll('.logo img').forEach(function(img) {
      img.src = '/images/logo-dark.png';
    });
  }

  window.toggleTheme = function() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('bybens_theme', 'light');
      updateLogos(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('bybens_theme', 'dark');
      updateLogos(true);
    }
  };

  // Sync logos on page load after DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    updateLogos(document.documentElement.getAttribute('data-theme') === 'dark');
  });

  const footerHTML = `
    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="/" class="footer-logo-link">
              <img src="/images/logo-dark.png" alt="Maison Comfort" class="footer-brand-logo" />
            </a>
            <p data-i18n="footer.brand.desc">Algeria's destination for handpicked carpets and home furnishings. We bring quality pieces directly to your door.</p>
            <div class="social-links">
              <a href="https://www.facebook.com/profile.php?id=100063629197113" class="social-link" aria-label="Facebook" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/maisonconfort2026/" class="social-link" aria-label="Instagram" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="https://www.tiktok.com/@maisonconfort25?_r=1&_t=ZS-97rpSeOIWLF" class="social-link" aria-label="TikTok" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
              <a href="https://wa.me/213550066603" class="social-link" aria-label="WhatsApp" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer.links">Quick Links</h4>
            <ul>
              <li><a href="/" data-i18n="nav.home">Home</a></li>
              <li><a href="/products" data-i18n="nav.products">Products</a></li>
              <li><a href="#" data-i18n="footer.shipping" onclick="openShippingModal();return false;">Shipping Policy</a></li>
              <li><a href="#" data-i18n="footer.returns" onclick="openReturnsModal();return false;">Returns</a></li>
              <li><a href="/privacy" data-i18n="footer.privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer.categories">Categories</h4>
            <ul id="footerCategoryList"></ul>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer.contact">Send a Message</h4>
            <form class="contact-form" onsubmit="handleContactForm(event)">
              <div class="form-group">
                <input class="form-input" type="text" id="contactName" placeholder="Your Name" data-i18n="form.name" required />
              </div>
              <div class="form-group">
                <input class="form-input" type="text" id="contactEmail" placeholder="Email / Phone" data-i18n="form.email" required />
              </div>
              <div class="form-group">
                <textarea class="form-input form-textarea" id="contactMsg" placeholder="Message" data-i18n="form.message" required></textarea>
              </div>
              <button type="submit" class="btn-send">
                <span data-i18n="form.send">Send Message</span>
              </button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© <span id="footerYear"></span> Maison Comfort Algeria. <span data-i18n="footer.rights">All rights reserved.</span></p>
          <p class="footer-credit">Made by <a href="https://www.nuvex.agency" target="_blank" rel="noopener noreferrer">NUVEX</a></p>
        </div>
      </div>
    </footer>

    <!-- Modals -->
    <div class="about-overlay" id="shippingOverlay" onclick="if(event.target===this)closeShippingModal()">
      <div class="about-modal" role="dialog" aria-modal="true">
        <button class="about-close" onclick="closeShippingModal()" aria-label="Close">&#x2715;</button>
        <div class="about-header">
          <div class="about-brand" data-i18n="shipping.title">Shipping Policy</div>
          <div class="about-sub">Luxury Secret</div>
        </div>
        <div class="about-body">
          <div class="about-card">
            <div class="about-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <div class="about-card-text">
              <h4 data-i18n="shipping.item1.title">Nationwide Delivery</h4>
              <p data-i18n="shipping.item1.text">We deliver to all 69 Wilayas across Algeria with care and speed via Imir Logistics.</p>
            </div>
          </div>
          <div class="about-card">
            <div class="about-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8M8 8l8 8"/></svg>
            </div>
            <div class="about-card-text">
              <h4 data-i18n="shipping.item2.title">Complimentary Shipping</h4>
              <p data-i18n="shipping.item2.text">Orders exceeding 15,000 DA enjoy complimentary shipping. Standard rates apply otherwise.</p>
            </div>
          </div>
          <div class="about-card">
            <div class="about-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="about-card-text">
              <h4 data-i18n="shipping.item3.title">Dispatch Timeline</h4>
              <p data-i18n="shipping.item3.text">Your orders are processed within 24 hours. Delivery takes 2-4 business days for major metropolitan hubs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="about-overlay" id="returnsOverlay" onclick="if(event.target===this)closeReturnsModal()">
      <div class="about-modal" role="dialog" aria-modal="true">
        <button class="about-close" onclick="closeReturnsModal()" aria-label="Close">&#x2715;</button>
        <div class="about-header">
          <div class="about-brand" data-i18n="returns.title">Returns & Refunds</div>
          <div class="about-sub">Luxury Secret</div>
        </div>
        <div class="about-body">
          <div class="about-card">
            <div class="about-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="about-card-text">
              <h4 data-i18n="returns.item1.title">Exchanges & Returns</h4>
              <p data-i18n="returns.item1.text">We offer a 7-day return policy for unopened items in their original packaging with intact seals.</p>
            </div>
          </div>
          <div class="about-card">
            <div class="about-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="about-card-text">
              <h4 data-i18n="returns.item2.title">Easy Support</h4>
              <p data-i18n="returns.item2.text">Contact us via WhatsApp or Instagram to initiate a return. We will arrange the courier return for you.</p>
            </div>
          </div>
          <div class="about-card">
            <div class="about-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="about-card-text">
              <h4 data-i18n="returns.item3.title">Maison Credit</h4>
              <p data-i18n="returns.item3.text">Following inspection, we issue store credit, exchanges, or refunds, ensuring your satisfaction.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="about-overlay" id="aboutOverlay" onclick="if(event.target===this)closeAboutModal()">
      <div class="about-modal" role="dialog" aria-modal="true">
        <button class="about-close" onclick="closeAboutModal()" aria-label="Close">&#x2715;</button>
        <div class="about-header">
          <div class="about-brand">MAISON <span>COMFORT</span></div>
          <div class="about-sub">Carpets &amp; Home Furnishings</div>
        </div>
        <div class="about-body">
          <div class="about-card">
            <div class="about-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="about-card-text">
              <h4 data-i18n="about.who.title">Our Heritage</h4>
              <p data-i18n="about.who.text">Maison Comfort is a home furnishings house, dedicated to bringing carpets and decor of lasting quality to Algerian homes.</p>
            </div>
          </div>
          <div class="about-card">
            <div class="about-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <div class="about-card-text">
              <h4 data-i18n="about.order.title">How To Order</h4>
              <p data-i18n="about.order.text">Choose your carpet's size and color, then add it to your cart. Complete your address without registration, and enjoy careful Cash on Arrival delivery.</p>
            </div>
          </div>
        </div>
        <div class="about-cta-wrap">
          <a href="/products" class="about-cta" data-i18n="about.cta">Shop Collection</a>
        </div>
      </div>
    </div>
  `;

  // Modal Functions
  window.openShippingModal = function() { document.getElementById("shippingOverlay").classList.add("open"); document.body.style.overflow = "hidden"; };
  window.closeShippingModal = function() { document.getElementById("shippingOverlay").classList.remove("open"); document.body.style.overflow = ""; };
  window.openReturnsModal = function() { document.getElementById("returnsOverlay").classList.add("open"); document.body.style.overflow = "hidden"; };
  window.closeReturnsModal = function() { document.getElementById("returnsOverlay").classList.remove("open"); document.body.style.overflow = ""; };
  window.openAboutModal = function() { document.getElementById("aboutOverlay").classList.add("open"); document.body.style.overflow = "hidden"; };
  window.closeAboutModal = function() { document.getElementById("aboutOverlay").classList.remove("open"); document.body.style.overflow = ""; };

  // Inject HTML
  const placeholder = document.getElementById("footerPlaceholder");
  if (placeholder) placeholder.innerHTML = footerHTML;
  else document.body.insertAdjacentHTML('beforeend', footerHTML);

  // Sync footer logo immediately after injection
  updateLogos(document.documentElement.getAttribute('data-theme') === 'dark');

  // Set Year
  const yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact form — shared across all pages
  window.handleContactForm = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type=submit]');
    const name = (document.getElementById('contactName') || {}).value || '';
    const contact = (document.getElementById('contactEmail') || {}).value || '';
    const message = (document.getElementById('contactMsg') || {}).value || '';
    if (!name.trim() || !contact.trim() || !message.trim()) return;
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<span style="opacity:.7">Sending…</span>';
    try {
      await fetch('https://rgbmfstbvqzvgxadjxrb.supabase.co/functions/v1/submit-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYm1mc3RidnF6dmd4YWRqeHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDcxNDYsImV4cCI6MjA5ODUyMzE0Nn0.RWnBzmNPonwj7eZz5X0mMpEODFP5Jo6iAmBWdRDQBs4',
        },
        body: JSON.stringify({ name: name.trim(), contact: contact.trim(), message: message.trim() }),
      });
    } catch (_) {}
    btn.disabled = false;
    btn.innerHTML = orig;
    form.reset();
    const lang = (window.currentLang) || 'en';
    const msg = (window.i18n && window.i18n[lang] && window.i18n[lang]['toast.sent']) || 'Message sent!';
    if (window.showToast) window.showToast(msg);
  };

})();