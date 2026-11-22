/* gen-placeholders.mjs — generate lightweight branded SVG placeholder images.
   No binary deps; SVGs are crisp at any size and tiny. Replace with real photos later.
   Run:  node scripts/gen-placeholders.mjs */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMG = join(ROOT, "assets/img");
await mkdir(IMG, { recursive: true });

const data = JSON.parse(await readFile(join(ROOT, "data/products.json"), "utf8"));

const NAVY = "#0b2239", NAVY2 = "#13304f", AMBER = "#f5a623";
const bolt = "M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z";

/* grid-pattern + diagonal-sheen background shared by all tiles */
function bg(w, h, id) {
  return `
    <defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${NAVY}"/>
        <stop offset="1" stop-color="${NAVY2}"/>
      </linearGradient>
      <pattern id="p${id}" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g${id})"/>
    <rect width="${w}" height="${h}" fill="url(#p${id})"/>
    <polygon points="0,${h} ${w * 0.45},${h} ${w * 0.2},0 0,0" fill="#ffffff" fill-opacity="0.03"/>`;
}

function tile(label, id, w = 800, h = 600) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
    ${bg(w, h, id)}
    <g transform="translate(${w / 2 - 24}, ${h / 2 - 70}) scale(4)">
      <path d="${bolt}" fill="${AMBER}"/>
    </g>
    <text x="${w / 2}" y="${h / 2 + 70}" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" text-anchor="middle">${label}</text>
    <text x="${w / 2}" y="${h / 2 + 108}" fill="#aebfd0" font-family="Inter, Arial, sans-serif" font-size="18" text-anchor="middle">Power Solutions Equipment</text>
  </svg>`;
}

function hero(w = 1600, h = 760) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Power Solutions">
    ${bg(w, h, "hero")}
    <g transform="translate(${w - 360}, ${h / 2 - 160}) scale(14)" opacity="0.18">
      <path d="${bolt}" fill="${AMBER}"/>
    </g>
  </svg>`;
}

const esc = (s) => s.replace(/&/g, "&amp;");

/* hero */
await writeFile(join(IMG, "hero.svg"), hero(), "utf8");

/* one per product slug */
for (const p of data.products) {
  await writeFile(join(IMG, `${p.slug}.svg`), tile(esc(p.name_en), p.slug), "utf8");
}

/* gallery projects */
const projects = [
  "Data Center Standby", "Airport Light Towers", "Hospital UPS Backup",
  "Construction Site Power", "Event Power Rental", "Solar Hybrid Plant"
];
projects.forEach(async (name, i) => {
  await writeFile(join(IMG, `project-${i + 1}.svg`), tile(name, `pr${i}`), "utf8");
});

console.log(`Generated hero + ${data.products.length} product + ${projects.length} project placeholders in assets/img/`);
