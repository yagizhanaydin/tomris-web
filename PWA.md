# Tomris — PWA ve Bildirim Yol Haritası

Ana uygulama web (Next.js). Mobilde uygulama gibi kullanım ve push bildirimler için aşamalı PWA planı.

---

## Şu an (v0.3)

| Özellik | Durum |
|---------|--------|
| `manifest.json` + PNG ikonlar (192/512/maskable) | ✅ |
| Service Worker (`@serwist/next`) | ✅ Production build |
| Offline fallback (`/~offline`) | ✅ |
| Ana ekrana ekle ipucu (Chrome) | ✅ Dashboard |
| Uygulama içi rozetler | ✅ Arkadaş + mesaj + sinyal |
| Acil sinyal push (FCM) | ✅ Arkadaşlara — bildirim izni gerekir |
| Push: mesaj / arkadaş isteği / yorum | ⏳ Sırada |
| Bildirim merkezi (🔔) | ❌ Faz 3 |

### Gerekli env

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=   # Firebase Console → Cloud Messaging → Web Push
```

Firebase Console’da **Cloud Messaging API** açık olmalı. Service account JSON zaten var (`FIREBASE_SERVICE_ACCOUNT_JSON`).

### Firestore

- `fcm_tokens/{hash}` — sunucu yazar (push token)
- Rules + index repoda — Console’dan publish et

---

## Kurulum testi

1. `npm run build && npm start` (dev’de SW kapalı — production gibi test et)
2. Telefonda HTTPS siteyi aç
3. Dashboard → **Tomris’i telefona ekle** (Chrome) veya Safari → Paylaş → Ana Ekrana Ekle
4. Bildirim izni ver → başka hesapla acil sinyal gönder → push gelmeli

---

## Faz 1 — Kurulabilir PWA ✅

- [x] `192×192` ve `512×512` PNG ikonlar (`npm run icons:pwa`)
- [x] `@serwist/next` service worker
- [x] `metadata` → `apple-mobile-web-app-capable`
- [x] Vercel HTTPS (otomatik)

---

## Faz 2 — Push bildirimleri (kısmen ✅)

Firebase Cloud Messaging (FCM) + Firestore `fcm_tokens`.

| Olay | Bildirim |
|------|----------|
| Acil sinyal | ✅ `@user acil sinyal gönderdi` |
| Gelen arkadaş isteği | ⏳ |
| Yeni DM | ⏳ |
| Gönderine yorum | ⏳ |

**Akış:**
1. Kullanıcı izin verir → `PushOptIn` → token `/api/push/register`
2. Sinyal gönderilince Admin SDK `sendEachForMulticast`
3. Service worker arka planda bildirimi gösterir → tıklayınca `/sinyal`

---

## Faz 3 — Bildirim merkezi (2–3 gün)

- Firestore `notifications/{uid}/items`
- Header'da 🔔 ikonu + liste
- Okundu işaretleme

---

## Faz 4 — Native (opsiyonel)

- Capacitor / React Native kabuğu
- App Store / Play Store

---

## Notlar

- **Development:** Service worker dev modda kapalı (`next.config.ts`) — SW testi için `npm run build && npm start`
- Push olmadan sinyal yine Firestore’da; uygulama içi banner + rozet çalışır
- iOS Safari: PWA + push kısıtlı; en iyi deneyim Android Chrome + ana ekrana ekle
