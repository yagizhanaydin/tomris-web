import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const raw = readFileSync(envPath, "utf8");
const marker = '\n{\n  "type": "service_account"';
const i = raw.indexOf(marker);

if (i === -1) {
  console.error("Altta cok satirli service account JSON bulunamadi.");
  process.exit(1);
}

const obj = JSON.parse(raw.slice(i).trim());
const oneLine = JSON.stringify(obj);
const header = raw
  .slice(0, i)
  .trimEnd()
  .replace(/^FIREBASE_SERVICE_ACCOUNT_JSON=.*$/m, `FIREBASE_SERVICE_ACCOUNT_JSON=${oneLine}`);

writeFileSync(envPath, `${header}\n`);
console.log("OK: FIREBASE_SERVICE_ACCOUNT_JSON tek satir; alttaki ham JSON kaldirildi.");
