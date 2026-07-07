import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public", "icon.svg");
const outDir = join(root, "public", "icons");

mkdirSync(outDir, { recursive: true });
const svg = readFileSync(svgPath);

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(outDir, `icon-${size}.png`));
}

// Maskable: küçük padding ile güvenli alan
await sharp(svg)
  .resize(512, 512, { fit: "contain", background: "#7c3aed" })
  .extend({
    top: 64,
    bottom: 64,
    left: 64,
    right: 64,
    background: "#7c3aed",
  })
  .resize(512, 512)
  .png()
  .toFile(join(outDir, "icon-maskable-512.png"));

console.log("PWA icons generated in public/icons/");
