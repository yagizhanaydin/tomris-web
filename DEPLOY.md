# Tomris — Canlıya Alma (Deploy)

Doğrulama fotoğrafları geçicidir; onay/red/ban sonrası silinir.

---

## Fotoğraf depolama (otomatik)

| Ortam | Backend | Açıklama |
|-------|---------|----------|
| `npm run dev` (local) | **Disk** `data/verifications/` | Varsayılan, ek ayar gerekmez |
| VPS / Docker / Railway | **Disk** | Kalıcı volume mount: `./data/verifications` |
| **Vercel** / serverless | **Firestore** | Otomatik (`VERCEL=1` → firestore) — **Spark ücretsiz, kart gerekmez** |

Kod: `src/lib/verification/photo-storage.ts`

Manuel zorlama:

```env
VERIFICATION_PHOTO_STORAGE=local      # disk
VERIFICATION_PHOTO_STORAGE=firestore  # Firestore geçici belge (Spark)
VERIFICATION_PHOTO_STORAGE=firebase   # Firebase Storage (Blaze + kart gerekir)
```

Firestore backend: koleksiyon `verification_photos/{uid}` — client erişimi kapalı (`firestore.rules`).

---

## Seçenek A — Vercel + Spark (önerilen, 0 TL)

**Firebase Storage veya Blaze gerekmez.** Fotoğraflar geçici olarak Firestore'da tutulur (~300–500 KB JPEG).

### 1. Firestore kuralları

1. [Firebase Console](https://console.firebase.google.com) → **Firestore** → **Rules**
2. Repodaki [`firestore.rules`](firestore.rules) yapıştır → **Publish**
3. `verification_photos` bloğu client erişimini kapatır — yalnızca Admin SDK (API route) yazar/okur

### 2. Vercel'e deploy

1. GitHub repo'yu Vercel'e bağla
2. **Environment Variables** — `.env.local` içeriğinin tamamı:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
REP_USERNAME=...
REP_PASSWORD=...
SESSION_SECRET=uzun-rastgele-string-en-az-32-karakter
VERIFICATION_PHOTO_STORAGE=firestore
```

> `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` **gerekmez** (firestore backend).

3. Deploy → `https://tomris-xxx.vercel.app`

### 3. Test

- Kayıt → doğrulama fotoğrafı yükle
- Temsilci panelinde fotoğraf görünmeli
- Onay/red sonrası `verification_photos/{uid}` belgesi silinmeli

---

## Seçenek B — Vercel + Firebase Storage (Blaze)

Kart ve Blaze plan gerekir. Yalnızca Storage tercih ediyorsan:

1. Firebase Console → **Storage** → Get started
2. [`storage.rules`](storage.rules) publish
3. Vercel env: `VERIFICATION_PHOTO_STORAGE=firebase` + `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...`

---

## Seçenek C — VPS (Hetzner, DigitalOcean, vb.)

Disk backend kullan — ek Firebase Storage gerekmez.

```bash
git clone https://github.com/yagizhanaydin/tomris-web.git
cd tomris-web
npm install
cp .env.local.example .env.local
# .env düzenle
npm run build
npm start
```

```env
VERIFICATION_PHOTO_STORAGE=local
```

Kalıcı klasör:

```bash
mkdir -p data/verifications
# PM2 / systemd ile npm start — data/ klasörü sunucuda kalır
```

Nginx reverse proxy + HTTPS (Let's Encrypt) önerilir.

---

## Deploy öncesi kontrol listesi

- [ ] Firestore **Rules** publish (`firestore.rules`) — `verification_photos` dahil
- [ ] Firestore **Indexes** Enabled (2 adet `conversations`)
- [ ] `SESSION_SECRET` production env'de
- [ ] Temsilci/admin şifreleri güçlü
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` Vercel'de tek satır JSON
- [ ] Vercel: `VERIFICATION_PHOTO_STORAGE=firestore` (veya otomatik `VERCEL=1`)

---

## Spark plan limitleri

Firestore Spark: günlük okuma/yazma kotası MVP test için yeterli. Doğrulama fotoğrafları geçici ve sıkıştırılmış (~500 KB altı).

Blaze plan **gerekmez** (firestore backend ile).

---

Detaylı Firebase kurulum: [`FIREBASE-KURULUM.md`](FIREBASE-KURULUM.md)
