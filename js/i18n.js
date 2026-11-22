/* i18n.js — AR(RTL) / EN(LTR) language toggle.
   Elements are marked with [data-ar] / [data-en]; CSS shows the active one.
   The <html> lang + dir drive font and layout direction. */
(function () {
  const KEY = "pse-lang";
  const saved = localStorage.getItem(KEY) || "ar"; // default Arabic (primary market)

  function apply(lang) {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    localStorage.setItem(KEY, lang);
    document.querySelectorAll("[data-lang-label]").forEach((el) => {
      el.textContent = lang === "ar" ? "EN" : "ع"; // toggle shows the *other* language
    });
    // Let other scripts (product renderer) react to the change.
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  window.PSE = window.PSE || {};
  window.PSE.getLang = () => document.documentElement.getAttribute("lang") || "ar";
  window.PSE.setLang = apply;

  document.addEventListener("DOMContentLoaded", () => {
    apply(saved);
    document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        apply(window.PSE.getLang() === "ar" ? "en" : "ar");
      });
    });
  });
})();
