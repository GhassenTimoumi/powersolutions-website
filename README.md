# Power Solutions Equipment (PSE) — Website

Bilingual (AR/RTL + EN/LTR) static marketing site for Power Solutions Equipment, Riyadh.
Built from the rebuild proposal (Path B): conversion-focused, SEO-ready, mobile-first.

## Stack
Plain **HTML + CSS + vanilla JS** — no build step. Deploys to GitHub Pages / Netlify.

## Structure
```
index.html              Home: hero, products, trust, quote form, WhatsApp float
products/index.html     Product listing (generated)
products/<slug>.html    One detail page per product — specs + Product schema (generated)
services.html           Services (8) — benefit-focused
about.html              Company story + trust signals + stats
css/styles.css          Mobile-first, RTL/LTR aware, industrial brand
js/i18n.js              AR/EN toggle (sets <html lang/dir>, persists to localStorage)
js/products.js          Renders home-page product grid from data/products.json
js/main.js              Mobile nav + floating WhatsApp deep-link
data/products.json      Single source of truth: 8 products, specs, buy/rent flags
scripts/build-products.mjs  Generates products/*.html from the JSON (no deps)
robots.txt, sitemap.xml
```

## Regenerate product pages
Edit `data/products.json`, then:
```bash
node scripts/build-products.mjs
```
This rewrites `products/index.html` + one page per product slug.

## Run locally
Any static server (needed because `products.js` uses `fetch`):
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Before going live — TODO
- [ ] Replace `YOUR_WEB3FORMS_KEY` in `index.html` with a real key from https://web3forms.com (free, no backend) — delivers quote requests to the sales inbox.
- [ ] Add real images to `assets/img/` (hero.jpg + one per product slug) — pages reference them but images aren't included yet.
- [ ] Fill real spec values in `data/products.json` (current values are realistic placeholders) and re-run the generator.
- [ ] Add project gallery, client logos, certifications, testimonials (trust content).
- [ ] Verify/confirm the WhatsApp number (currently 966554557220) and phone numbers.
- [ ] Set the real domain in canonical/hreflang/sitemap if it changes.
- [ ] Register Google Business Profile + submit sitemap to Search Console.

## Deploy (GitHub Pages)
```bash
git init && git add . && git commit -m "Initial PSE website"
# push to a repo, then enable Pages on the main branch root
```
