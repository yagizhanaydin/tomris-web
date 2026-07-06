# Firebase Kurulum Rehberi — TomrisApp

> **Not:** Fotoğraflar Firebase Storage'da DEĞİL, sunucuda geçici tutulur. **Blaze plan / Storage gerekmez.**

---

## Tamamlanan Adımlar

- [x] Firebase projesi oluşturuldu
- [x] Authentication — E-posta/Şifre + Google
- [x] Firestore Database oluşturuldu
- [x] Firestore Rules yapıştırıldı (`firestore.rules`)
- [x] Service Account JSON indirildi → `.env.local`
- [x] `.env.local` yapılandırıldı

## Gerekli Olmayan

- [ ] ~~Firebase Storage~~ — kullanılmıyor
- [ ] ~~Blaze plan yükseltme~~ — gerek yok

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

## Sık Hatalar

| Hata | Çözüm |
|------|-------|
| `FIREBASE_SERVICE_ACCOUNT_JSON eksik` | JSON'u `.env.local`'e tek satır ekle |
| `Missing or insufficient permissions` | Firestore Rules yapıştır + Publish |
| Fotoğraf yüklenemedi | `npm run dev` yeniden başlat |

Detaylı doğrulama akışı: [`DOGRULAMA-AKISI.md`](DOGRULAMA-AKISI.md)
