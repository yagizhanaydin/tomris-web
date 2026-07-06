# Firebase Kurulum Rehberi — TomrisApp

> **Not:** Local'de fotoğraflar `data/verifications/` diskine yazılır. **Vercel deploy** için Firebase Storage kullanılır (Spark yeterli). Detay: [`DEPLOY.md`](DEPLOY.md)

---

## Tamamlanan Adımlar

- [x] Firebase projesi oluşturuldu
- [x] Authentication — E-posta/Şifre + Google
- [x] Firestore Database oluşturuldu
- [ ] Firestore Rules — repodaki **`firestore.rules`** Console'da Publish (eski sürüm değil!)
- [ ] Firestore Index — `firestore.indexes.json` (mesajlar / gruplar)
- [x] Service Account JSON indirildi → `.env.local`
- [x] `.env.local` yapılandırıldı

## Gerekli Olmayan

- [ ] ~~Blaze plan yükseltme~~ — MVP için Spark yeterli (Storage dahil)

---

## `.env.local` Kontrol Listesi

```env
NEXT_PUBLIC_FIREBASE_*     # 6 satır — Firebase web config
ADMIN_USERNAME / PASSWORD    # Admin paneli
REP_USERNAME / PASSWORD      # Temsilci paneli
FIREBASE_SERVICE_ACCOUNT_JSON  # Service Account JSON (tek satır)
```

---

## Test

```bash
npm run dev
```

| URL | Test |
|-----|------|
| `/kayit` | Kayıt + fotoğraf |
| `/temsilci/giris` | Temsilci onayı |
| `/giris` | Kullanıcı girişi |

---

## Firestore Rules — Nereye yapıştırılır?

| Yere | Yapıştır? |
|------|-----------|
| **Firebase Console → Firestore → Rules** | ✅ Evet — repodaki `firestore.rules` |
| PowerShell / terminal | ❌ Hayır — komut hatası olur, Firebase etkilenmez |
| `.env.local` | ❌ Hayır |

### Eski kısa rules ≠ repodaki `firestore.rules`

Daha önce kullandığın kısa sürümde:
- Kullanıcı kendini **`approved`** yapabilir (kritik açık)
- Doğrulanmadan **arkadaşlık / engelleme** açık
- **`signals`** herkese açık

**Yapman gereken:** [`firestore.rules`](firestore.rules) dosyasının tamamını Console'a yapıştır → **Publish**.

Kontrol: Publish sonrası rules editöründe `userSelfUpdateAllowed` ve `signals` → `if false` görünmeli.

---

## Sık Hatalar

| Hata | Çözüm |
|------|-------|
| `FIREBASE_SERVICE_ACCOUNT_JSON eksik` | JSON'u `.env.local`'e tek satır ekle |
| `Missing or insufficient permissions` | Repodaki `firestore.rules` yapıştır + Publish (eski kısa sürüm yetmez) |
| `The query requires an index` | Aşağıdaki **Firestore Index** adımını uygula |
| Fotoğraf yüklenemedi | `npm run dev` yeniden başlat |

---

## Firestore Index (Mesajlar / Gruplar)

Sohbet sayfası (`/mesajlar`) composite index ister. **Bir kez** oluşturman yeterli:

1. [Firebase Console → Firestore → Indexes](https://console.firebase.google.com/project/tomrisapp/firestore/indexes)
2. Terminaldeki linke tıkla **veya** repodaki `firestore.indexes.json` ile deploy et
3. Index durumu **Enabled** olana kadar 1–5 dk bekle

Gerekli indexler (`firestore.indexes.json`):
- `conversations`: `participantUids` (array) + `updatedAt` desc — gelen kutusu
- `conversations`: `type` + `updatedAt` desc — grup listesi

Detaylı doğrulama akışı: [`DOGRULAMA-AKISI.md`](DOGRULAMA-AKISI.md)  
Canlıya alma (Vercel / VPS): [`DEPLOY.md`](DEPLOY.md)
