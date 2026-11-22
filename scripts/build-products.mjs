/* build-products.mjs — generate static product pages from data/products.json.
   Each product becomes products/<slug>.html with its own title/meta + Product schema.
   Also generates products/index.html (the full listing).
   Run:  node scripts/build-products.mjs
   Keeps data/products.json as the single source of truth. */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(await readFile(join(ROOT, "data/products.json"), "utf8"));
const C = data.company;

/* ---- shared chrome (relative paths use ../ because pages live in /products) ---- */
const head = (title, desc, schema) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${C.domain}/products/" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
  <link rel="icon" type="image/svg+xml" href="../assets/img/favicon.svg" />
  <link rel="apple-touch-icon" href="../assets/img/logo.webp" />
  <link rel="stylesheet" href="../css/styles.css" />
  ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ""}
</head>
<body>`;

const header = `
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="../index.html"><img class="brand-logo" src="../assets/img/logo.webp" alt="Power Solutions Equipment — شركة حلول الطاقة للمعدات" /></a>
      <nav class="nav-links">
        <a href="index.html"><span data-ar>المنتجات</span><span data-en>Products</span></a>
        <a href="../services.html"><span data-ar>الخدمات</span><span data-en>Services</span></a>
        <a href="../about.html"><span data-ar>من نحن</span><span data-en>About</span></a>
        <a href="../index.html#quote"><span data-ar>اتصل بنا</span><span data-en>Contact</span></a>
      </nav>
      <div class="nav-actions">
        <button class="lang-toggle" data-lang-toggle><span data-lang-label>EN</span></button>
        <a class="btn btn-primary" href="../index.html#quote"><span data-ar>اطلب عرض سعر</span><span data-en>Get a quote</span></a>
        <button class="nav-toggle" data-nav-toggle aria-label="Menu">☰</button>
      </div>
    </div>
    <div class="mobile-menu" data-mobile-menu>
      <a href="index.html"><span data-ar>المنتجات</span><span data-en>Products</span></a>
      <a href="../services.html"><span data-ar>الخدمات</span><span data-en>Services</span></a>
      <a href="../about.html"><span data-ar>من نحن</span><span data-en>About</span></a>
      <a href="../index.html#quote"><span data-ar>اتصل بنا</span><span data-en>Contact</span></a>
    </div>
  </header>`;

const footer = `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <img class="footer-logo" src="../assets/img/logo.webp" alt="Power Solutions Equipment" />
        <p style="max-width:320px"><span data-ar>بيع وتأجير المولدات ومعدات الطاقة في الرياض، المملكة العربية السعودية.</span><span data-en>Sale and rental of generators and power equipment in Riyadh, Saudi Arabia.</span></p>
        <div class="social-row">
          <a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.607z"/></svg></a>
          <a href="#" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.34 18.34V9.9H5.67v8.44h2.67zM7 8.73a1.55 1.55 0 100-3.1 1.55 1.55 0 000 3.1zm11.34 9.61v-4.63c0-2.47-1.32-3.62-3.08-3.62-1.42 0-2.06.78-2.41 1.33v-1.14h-2.67c.04.75 0 8.44 0 8.44h2.67v-4.71c0-.24.02-.48.09-.65.19-.48.63-.98 1.37-.98.97 0 1.36.74 1.36 1.82v4.52h2.67z"/></svg></a>
          <a href="#" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.81 3.81 0 01-1.38-.9 3.81 3.81 0 01-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.76.07-.9.04-1.38.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.33-.28.81-.32 1.71-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.9.19 1.38.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.33.13.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.9-.04 1.38-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.33.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.9-.19-1.38-.32-1.71a2.85 2.85 0 00-.69-1.06 2.85 2.85 0 00-1.06-.69c-.33-.13-.81-.28-1.71-.32-1.24-.06-1.61-.07-4.76-.07zm0 3.06a4.98 4.98 0 110 9.96 4.98 4.98 0 010-9.96zm0 8.21a3.23 3.23 0 100-6.46 3.23 3.23 0 000 6.46zm6.34-8.41a1.16 1.16 0 11-2.32 0 1.16 1.16 0 012.32 0z"/></svg></a>
          <a href="#" target="_blank" rel="noopener" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.5 8.57L23 22h-6.9l-5.4-7.06L4.5 22H1.4l8-9.17L1 2h7.06l4.9 6.48L18.9 2zm-1.2 18h1.7L7.4 3.8H5.6L17.7 20z"/></svg></a>
        </div>
      </div>
      <div>
        <h4><span data-ar>روابط</span><span data-en>Links</span></h4>
        <a href="index.html"><span data-ar>المنتجات</span><span data-en>Products</span></a>
        <a href="../services.html"><span data-ar>الخدمات</span><span data-en>Services</span></a>
        <a href="../about.html"><span data-ar>من نحن</span><span data-en>About</span></a>
      </div>
      <div>
        <h4><span data-ar>تواصل</span><span data-en>Contact</span></h4>
        <a href="tel:+${C.whatsapp}">+966 55 455 7220</a>
        <a href="tel:+966114003468">+966 11 400 3468</a>
        <a href="mailto:${C.email}">${C.email}</a>
      </div>
    </div>
    <div class="footer-bottom">© 2026 Power Solutions Equipment. All rights reserved.</div>
  </footer>`;

const waMsgAr = (name) => encodeURIComponent(`مرحباً، أرغب في طلب عرض سعر لـ ${name}.`);
const scripts = `
  <a class="wa-float" data-wa="${C.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.607z"/></svg>
  </a>
  <script src="../js/i18n.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>`;

/* ---- product detail page ---- */
function productPage(p) {
  const title = `${p.name_en} | Power Solutions Equipment — ${p.name_ar}`;
  const desc = p.summary_en;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name_en,
    description: p.summary_en,
    brand: { "@type": "Brand", name: "Power Solutions Equipment" },
    category: "Power equipment",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "SAR",
      seller: { "@type": "Organization", name: "Power Solutions Equipment" },
      url: `${C.domain}/products/${p.slug}.html`
    }
  };

  const tags = [
    p.buy ? `<span class="tag buy"><span data-ar>متاح للبيع</span><span data-en>Available to buy</span></span>` : "",
    p.rent ? `<span class="tag rent"><span data-ar>متاح للتأجير</span><span data-en>Available to rent</span></span>` : ""
  ].join("");

  const specRows = p.specs.map((s) => `
        <tr><th><span data-ar>${s.key_ar}</span><span data-en>${s.key_en}</span></th>
            <td><span data-ar>${s.val_ar}</span><span data-en>${s.val_en}</span></td></tr>`).join("");

  return head(title, desc, schema) + header + `
  <section class="section">
    <div class="container">
      <p style="margin-bottom:10px"><a class="card-link" href="index.html"><span data-ar>→ كل المنتجات</span><span data-en>← All products</span></a></p>
      <img class="product-hero" src="../${p.image}" alt="${p.name_en}" />
      <h1 class="section-title"><span data-ar>${p.name_ar}</span><span data-en>${p.name_en}</span></h1>
      <div class="tag-row" style="margin:12px 0 18px">${tags}</div>
      <p class="section-sub"><span data-ar>${p.summary_ar}</span><span data-en>${p.summary_en}</span></p>

      <h2 class="section-title" style="font-size:1.4rem;margin-top:28px"><span data-ar>المواصفات</span><span data-en>Specifications</span></h2>
      <table class="spec-table">${specRows}
      </table>

      <div class="hero-cta" style="margin-top:28px">
        <a class="btn btn-primary" href="../index.html#quote"><span data-ar>اطلب عرض سعر</span><span data-en>Request a quote</span></a>
        <a class="btn btn-outline" href="https://wa.me/${C.whatsapp}?text=${waMsgAr(p.name_ar)}" target="_blank" rel="noopener"><span data-ar>تواصل عبر واتساب</span><span data-en>Chat on WhatsApp</span></a>
      </div>
    </div>
  </section>` + footer + scripts;
}

/* ---- products listing page ---- */
function listingPage() {
  const title = "Products | Power Solutions Equipment — منتجاتنا";
  const desc = "Generators, light towers, UPS, power distribution and renewable energy — for sale and rental in Riyadh.";
  const cards = data.products.map((p) => {
    const tags = [
      p.buy ? `<span class="tag buy"><span data-ar>بيع</span><span data-en>Buy</span></span>` : "",
      p.rent ? `<span class="tag rent"><span data-ar>تأجير</span><span data-en>Rent</span></span>` : ""
    ].join("");
    return `
        <article class="card">
          <div class="media"><img src="../${p.image}" alt="${p.name_en}" loading="lazy" /></div>
          <h3><span data-ar>${p.name_ar}</span><span data-en>${p.name_en}</span></h3>
          <p><span data-ar>${p.summary_ar}</span><span data-en>${p.summary_en}</span></p>
          <div class="tag-row">${tags}</div>
          <a class="card-link" href="${p.slug}.html"><span data-ar>التفاصيل وطلب عرض سعر ←</span><span data-en>Details & quote →</span></a>
        </article>`;
  }).join("");

  return head(title, desc, null) + header + `
  <section class="section">
    <div class="container">
      <h1 class="section-title"><span data-ar>منتجاتنا</span><span data-en>Our Products</span></h1>
      <p class="section-sub"><span data-ar>حلول متكاملة للبيع والتأجير مع مواصفات واضحة لكل منتج.</span><span data-en>Complete sale and rental solutions with clear specs for every product.</span></p>
      <div class="grid cols-3">${cards}
      </div>
    </div>
  </section>` + footer + scripts;
}

/* ---- write files ---- */
let count = 0;
for (const p of data.products) {
  await writeFile(join(ROOT, "products", `${p.slug}.html`), productPage(p), "utf8");
  count++;
}
await writeFile(join(ROOT, "products", "index.html"), listingPage(), "utf8");
console.log(`Generated ${count} product pages + products/index.html`);
