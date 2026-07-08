import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const signature = [
  'cx="256" cy="178" r="62"',
  'cx="168" cy="292" r="62"',
  'cx="344" cy="292" r="62"',
  'cx="256" cy="248" r="38"',
  'cx="256" cy="248" r="22"',
];

const iconSvg = readFileSync(join(root, "public", "icon.svg"), "utf8");
const markTsx = readFileSync(join(root, "src", "components", "TomrisMark.tsx"), "utf8");

let ok = true;

for (const part of signature) {
  if (!iconSvg.includes(part)) {
    console.error(`icon.svg eksik: ${part}`);
    ok = false;
  }
  if (!markTsx.includes(part)) {
    console.error(`TomrisMark.tsx eksik: ${part}`);
    ok = false;
  }
}

if (!iconSvg.includes('fill="#7c3aed"')) {
  console.error("icon.svg marka rengi (#7c3aed) uyumsuz");
  ok = false;
}

for (const file of ["icon-192.png", "icon-512.png", "icon-maskable-512.png"]) {
  try {
    readFileSync(join(root, "public", "icons", file));
  } catch {
    console.error(`Eksik PNG: public/icons/${file} — npm run icons:pwa çalıştır`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log("OK — icon.svg, TomrisMark ve PWA PNG'ler tutarlı (geometri imzası eşleşti).");
console.log("Not: maskable PNG güvenli alan için küçültülmüş kopyadır; ana ekran ikonu icon-512.png ile birebir.");
