import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public", "icon.svg");
const outDir = join(root, "public", "icons");
const BRAND = "#7c3aed";

mkdirSync(outDir, { recursive: true });
const svg = readFileSync(svgPath);

const sizes = [192, 512];

// Ana ekran / store — icon.svg ile birebir (tam bleed)
for (const size of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(outDir, `icon-${size}.png`));
}

// Maskable — Android güvenli alan (~62% merkez); aynı SVG, küçültülmüş + mor zemin
const canvas = 512;
const inner = 318;
const pad = Math.floor((canvas - inner) / 2);

await sharp(svg)
  .resize(inner, inner)
  .extend({
    top: pad,
    bottom: canvas - inner - pad,
    left: pad,
    right: canvas - inner - pad,
    background: BRAND,
  })
  .png()
  .toFile(join(outDir, "icon-maskable-512.png"));

console.log("PWA icons generated in public/icons/");
console.log("  icon-512.png  → icon.svg ile birebir (iOS ana ekran)");
console.log("  icon-maskable-512.png → güvenli alan (%62 merkez)");
