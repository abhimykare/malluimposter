/**
 * Rasterises the temporary SVG brand mark into the PNG icons required for the
 * PWA manifest, Apple touch icon, favicon and Open Graph image.
 *
 * Usage: node scripts/generate-icons.mjs
 * (sharp ships with Next.js, so no extra install is needed.)
 */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicIcons = path.join(root, "public", "icons");
const appDir = path.join(root, "src", "app");

const colors = {
  tile: "#10141f",
  tileEdge: "#ffb627",
  bubble: "#ffb627",
  bubbleDark: "#ff8a1f",
  imposter: "#ff3b5c",
  ink: "#10141f",
};

function markInner(c, withTile = true) {
  const tile = withTile
    ? `<rect x="4" y="4" width="120" height="120" rx="30" fill="${c.tile}"/>
       <rect x="4.75" y="4.75" width="118.5" height="118.5" rx="29.25" fill="none" stroke="${c.tileEdge}" stroke-opacity="0.35" stroke-width="1.5"/>`
    : "";
  return `
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c.bubble}"/>
        <stop offset="1" stop-color="${c.bubbleDark}"/>
      </linearGradient>
    </defs>
    ${tile}
    <path d="M30 34 h56 a12 12 0 0 1 12 12 v26 a12 12 0 0 1 -12 12 h-30 l-14 12 v-12 h-12 a12 12 0 0 1 -12 -12 v-26 a12 12 0 0 1 12 -12 z" fill="url(#g)"/>
    <path d="M55.5 52.5 c0 -5 4 -8 8.6 -8 c5 0 8.4 3.2 8.4 7.4 c0 3.4 -1.9 5.2 -4.6 7.1 c-2.4 1.7 -3.4 3 -3.4 5.6 v1" fill="none" stroke="${c.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="64.5" cy="74" r="3.2" fill="${c.ink}"/>
    <path d="M78 78 h22 a8 8 0 0 1 8 8 v8 a8 8 0 0 1 -8 8 h-8 l-8 7 v-7 h-6 a8 8 0 0 1 -8 -8 v-8 a8 8 0 0 1 8 -8 z" fill="${c.imposter}"/>
    <circle cx="89" cy="90" r="3.2" fill="${c.ink}"/>`;
}

function svg(size, { withTile = true, pad = 0, bg = null } = {}) {
  // pad: fraction of the canvas kept as margin (for maskable icons).
  const inner = 128 * (1 - pad * 2);
  const offset = 128 * pad;
  const bgRect = bg ? `<rect width="128" height="128" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="${size}" height="${size}">
    ${bgRect}
    <g transform="translate(${offset} ${offset}) scale(${inner / 128})">${markInner(colors, withTile)}</g>
  </svg>`;
}

async function png(svgString, size, file) {
  const buffer = await sharp(Buffer.from(svgString), { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(file, buffer);
  console.log("wrote", path.relative(root, file), `${(buffer.length / 1024).toFixed(1)}kB`);
}

async function og() {
  const W = 1200;
  const H = 630;
  const markSize = 260;
  const markSvg = svg(markSize);
  const mark = await sharp(Buffer.from(markSvg), { density: 384 }).resize(markSize, markSize).png().toBuffer();
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="a" cx="50%" cy="0%" r="70%">
        <stop offset="0" stop-color="#ffb627" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#0a0d14" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="b" cx="100%" cy="100%" r="60%">
        <stop offset="0" stop-color="#27d3c5" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#0a0d14" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#0a0d14"/>
    <rect width="${W}" height="${H}" fill="url(#a)"/>
    <rect width="${W}" height="${H}" fill="url(#b)"/>
    <text x="420" y="300" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="84" font-weight="800" fill="#f4f6fb" letter-spacing="-2">Mallu<tspan fill="#ffb627">Imposter</tspan></text>
    <text x="424" y="368" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="36" font-weight="500" fill="#a4adc3">One word. One imposter. Can you find them?</text>
    <text x="424" y="430" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="28" font-weight="500" fill="#6f7a95">Malayalam · English · One phone · 3–20 players</text>
  </svg>`;
  const buffer = await sharp(Buffer.from(bgSvg))
    .composite([{ input: mark, left: 120, top: Math.round((H - markSize) / 2) }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  const file = path.join(root, "public", "og.png");
  await writeFile(file, buffer);
  console.log("wrote", path.relative(root, file), `${(buffer.length / 1024).toFixed(1)}kB`);
}

await mkdir(publicIcons, { recursive: true });
await png(svg(512), 192, path.join(publicIcons, "icon-192.png"));
await png(svg(512), 512, path.join(publicIcons, "icon-512.png"));
// Maskable: full-bleed tile background with the mark inset into the safe zone.
await png(svg(512, { withTile: true, pad: 0.1, bg: colors.tile }), 512, path.join(publicIcons, "maskable-512.png"));
await png(svg(512), 180, path.join(publicIcons, "apple-touch-icon.png"));
await png(svg(512), 180, path.join(appDir, "apple-icon.png"));
await png(svg(512), 64, path.join(appDir, "icon.png"));
await og();
