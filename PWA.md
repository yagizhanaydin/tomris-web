# Tomris — PWA ve Bildirim Yol Haritası

Ana uygulama web (Next.js). Mobilde uygulama gibi kullanım ve push bildirimler için aşamalı PWA planı.

---

## Şu an (v0.2)

| Özellik | Durum |
|---------|--------|
| `manifest.json` + `icon.svg` | ✅ Ana ekrana eklenebilir (temel) |
| Uygulama içi rozetler | ✅ Arkadaş istekleri + okunmamış mesaj |
| Acil sinyal (beta) | ✅ `/sinyal` → arkadaş listesine Firestore kaydı |
| Push bildirimi | ❌ Henüz yok |
| Service Worker / offline | ❌ Henüz yok |

### Arkadaş istekleri nereye düşer?

**`/arkadaslar` → "Gelen İstekler"** bölümü. Menüde **Arkadaşlar** sekmesinde kırmızı rozet görünür.

---

## Faz 1 — Kurulabilir PWA (1–2 gün)

- [ ] `192×192` ve `512×512` PNG ikonlar
- [ ] `next-pwa` veya `@serwist/next` service worker
- [ ] `metadata` → `apple-mobile-web-app-capable`
- [ ] Vercel HTTPS (otomatik)

**Sonuç:** Telefonda "Ana ekrana ekle" → tam ekran uygulama hissi.

---

## Faz 2 — Push bildirimleri (3–5 gün)

Firebase Cloud Messaging (FCM) + Firestore `fcm_tokens/{uid}`.

| Olay | Bildirim |
|------|----------|
| Gelen arkadaş isteği | "X seni arkadaş olarak eklemek istiyor" |
| Yeni DM | "X sana mesaj gönderdi" |
| Gönderine yorum | "X gönderine yorum yaptı" |
| Acil sinyal | "X acil durum sinyali gönderdi" |

**Akış:**
1. Kullanıcı izin verir → token kaydedilir
2. Sunucu olayında (yorum/mesaj/istek) Admin SDK ile FCM gönderir
3. Service worker arka planda bildirimi gösterir

**Spark plan:** FCM ücretsiz kotası MVP için yeterli.

---

## Faz 3 — Bildirim merkezi (2–3 gün)

- Firestore `notifications/{uid}/items`
- Header'da 🔔 ikonu + liste
- Okundu işaretleme

---

## Faz 4 — Native (opsiyonel, ileride)

- Capacitor / React Native kabuğu
- App Store / Play Store

---

## Hızlı test (PWA)

1. Canlı siteyi telefonda Chrome/Safari ile aç
2. Menü → **Ana ekrana ekle**
3. Mor Tomris ikonu ile açılmalı (`/dashboard`)

Push için Faz 2 tamamlanana kadar uygulama içi rozetler kullanılır.
