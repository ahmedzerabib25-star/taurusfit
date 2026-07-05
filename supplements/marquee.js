(function () {
  const DISMISS_KEY = "mc_announce_dismissed";

  function pickText(settings, lang) {
    const suffix = lang === "ar" ? "_ar" : lang === "en" ? "_en" : "_fr";
    const text = settings["announcement_text" + suffix] || settings.announcement_text_en || "";
    const linkText = settings["announcement_link_text" + suffix] || settings.announcement_link_text_en || "";
    const linkUrl = settings.announcement_link_url || "";
    return { text: text.trim(), linkText: linkText.trim(), linkUrl: linkUrl.trim() };
  }

  function currentLang() {
    return localStorage.getItem("bybens_lang") || "fr";
  }

  function applyOffset(bar) {
    const h = bar ? bar.offsetHeight : 0;
    const header = document.getElementById("site-header");
    if (header) header.style.top = h ? h + "px" : "";
    document.body.style.marginTop = h ? h + "px" : "";
  }

  function buildInnerHtml(text, linkText, linkUrl) {
    const linkHtml = linkText && linkUrl
      ? ` <a href="${linkUrl}" class="announcement-link">${linkText}</a>`
      : "";
    const item = `<span class="announcement-text">${text}${linkHtml}</span>`;
    return item + item;
  }

  function render(settings) {
    const enabled = settings.announcement_enabled === "true";
    if (!enabled || sessionStorage.getItem(DISMISS_KEY) === "1") return;
    const lang = currentLang();
    const { text, linkText, linkUrl } = pickText(settings, lang);
    if (!text) return;

    const bar = document.createElement("div");
    bar.id = "announcement-bar";
    bar.className = "announcement-bar";
    bar.dir = lang === "ar" ? "rtl" : "ltr";
    bar.innerHTML =
      `<div class="announcement-track">${buildInnerHtml(text, linkText, linkUrl)}</div>` +
      `<button type="button" class="announcement-close" aria-label="Dismiss">&times;</button>`;

    document.body.insertBefore(bar, document.body.firstChild);

    bar.querySelector(".announcement-close").addEventListener("click", function () {
      sessionStorage.setItem(DISMISS_KEY, "1");
      bar.remove();
      applyOffset(null);
    });

    requestAnimationFrame(() => applyOffset(bar));
    window._announcementSettings = settings;
  }

  window.updateAnnouncementLang = function (lang) {
    const settings = window._announcementSettings;
    if (!settings) return;
    let bar = document.getElementById("announcement-bar");
    const { text, linkText, linkUrl } = pickText(settings, lang);

    if (!text) {
      if (bar) { bar.remove(); applyOffset(null); }
      return;
    }
    if (!bar) {
      render(settings);
      return;
    }
    bar.dir = lang === "ar" ? "rtl" : "ltr";
    bar.querySelector(".announcement-track").innerHTML = buildInnerHtml(text, linkText, linkUrl);
    requestAnimationFrame(() => applyOffset(bar));
  };

  function init() {
    if (!window.__initialDataPromise) return;
    window.__initialDataPromise
      .then(function (data) {
        if (!data || !data.settings) return;
        render(data.settings);
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
