/* products.js — renders the product grid from data/products.json.
   Re-renders on language change so cards show the active language. */
(function () {
  const mount = document.querySelector("[data-products-grid]");
  if (!mount) return;

  let DATA = null;

  function t(ar, en) {
    return (window.PSE && window.PSE.getLang() === "en") ? en : ar;
  }

  function render() {
    if (!DATA) return;
    const limit = parseInt(mount.getAttribute("data-limit") || "0", 10);
    const list = limit > 0 ? DATA.products.slice(0, limit) : DATA.products;
    mount.innerHTML = list.map((p) => {
      const tags = [];
      if (p.buy) tags.push(`<span class="tag buy">${t("بيع", "Buy")}</span>`);
      if (p.rent) tags.push(`<span class="tag rent">${t("تأجير", "Rent")}</span>`);
      return `
        <article class="card">
          <div class="media"><img src="${p.image}" alt="${t(p.name_ar, p.name_en)}" loading="lazy" /></div>
          <h3>${t(p.name_ar, p.name_en)}</h3>
          <p>${t(p.summary_ar, p.summary_en)}</p>
          <div class="tag-row">${tags.join("")}</div>
          <a class="card-link" href="products/${p.slug}.html">
            ${t("التفاصيل وطلب عرض سعر ←", "Details & quote →")}
          </a>
        </article>`;
    }).join("");
    if (window.PSE && window.PSE.scanReveal) window.PSE.scanReveal();
  }

  fetch("data/products.json")
    .then((r) => r.json())
    .then((d) => { DATA = d; render(); })
    .catch(() => { mount.innerHTML = "<p>Unable to load products.</p>"; });

  document.addEventListener("langchange", render);
})();
