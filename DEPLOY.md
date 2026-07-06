# Tomris — Canlıya Alma (Deploy)

Doğrulama fotoğrafları geçicidir; onay/red/ban sonrası silinir.

---

## Fotoğraf depolama (otomatik)

| Ortam | Backend | Açıklama |
|-------|---------|----------|
| `npm run dev` (local) | **Disk** `data/verifications/` | Varsayılan, ek ayar gerekmez |
| VPS / Docker / Railway | **Disk** | Kalıcı volume mount: `./data/verifications` |
| **Vercel** / serverless | **Firebase Storage** | Otomatik (`VERCEL=1` → firebase) |

Kod: `src/lib/verification/photo-storage.ts`

Manuel zorlama:

```env
VERIFICATION_PHOTO_STORAGE=local    # disk
VERIFICATION_PHOTO_STORAGE=firebase   # Firebase Storage (Admin SDK)
```

---

## Seçenek A — Vercel (önerilen, Spark plan yeterli)

### 1. Firebase Storage'ı aç

1. [Firebase Console](https://console.firebase.google.com/project/tomrisapp/storage) → **Storage** → **Get started**
2. **Production mode** → bölge seç (ör. `europe-west1`)
3. **Rules** sekmesi → repodaki [`storage.rules`](storage.rules) yapıştır → **Publish**  
   (Client erişimi kapalı; sadece sunucu Admin SDK kullanır)

### 2. Vercel'e deploy

1. GitHub repo'yu Vercel'e bağla
2. **Environment Variables** — `.env.local` içeriğinin tamamı:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...   # tomrisapp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
REP_USERNAME=...
REP_PASSWORD=...
SESSION_SECRET=uzun-rastgele-string-en-az-32-karakter
VERIFICATION_PHOTO_STORAGE=firebase
```

3. Deploy → `https://tomris-xxx.vercel.app`

### 3. Test

- Kayıt → doğrulama fotoğrafı → Firebase Storage → `verifications/pending/{uid}.jpg`
- Temsilci panelinde fotoğraf görünmeli
- Onay sonrası Storage'dan silinmeli

---

## Seçenek B — VPS (Hetzner, DigitalOcean, vb.)

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

- [ ] Firestore **Rules** publish (`firestore.rules`)
- [ ] Firestore **Indexes** Enabled (2 adet `conversations`)
- [ ] Firebase **Storage Rules** publish (`storage.rules`) — Vercel için
- [ ] `SESSION_SECRET` production env'de
- [ ] Temsilci/admin şifreleri güçlü
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` Vercel'de tek satır JSON

---

## Spark plan limitleri

Firebase Storage Spark'ta dahil (5 GB depolama, günlük indirme limiti). Doğrulama fotoğrafları geçici ve küçük olduğu için MVP için yeterli.

Blaze plan **gerekmez** (Storage MVP için).

---

Detaylı Firebase kurulum: [`FIREBASE-KURULUM.md`](FIREBASE-KURULUM.md)
