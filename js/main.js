/* main.js — mobile nav toggle + floating WhatsApp link builder. */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // Mobile menu
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", () => menu.classList.toggle("open"));
      menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => menu.classList.remove("open"))
      );
    }

    // WhatsApp float — number comes from data-wa attribute
    const wa = document.querySelector("[data-wa]");
    if (wa) {
      const num = wa.getAttribute("data-wa");
      const msgAr = "مرحباً، أرغب في طلب عرض سعر.";
      const msgEn = "Hello, I would like to request a quote.";
      const setHref = () => {
        const msg = window.PSE && window.PSE.getLang() === "en" ? msgEn : msgAr;
        wa.href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
      };
      setHref();
      document.addEventListener("langchange", setHref);
    }
  });
})();
