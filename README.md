# Tomris Web — Kadın Dayanışma Platformu

> **AI / Geliştirici Notu:** Bu README, projeye yeni katılan geliştiriciler ve yapay zeka asistanları için proje durumunu, mimariyi ve yol haritasını özetler. Kod yazmadan önce bu dosyayı okuyun.

## Proje Özeti

**Tomris Web**, kadınların birbirine destek olduğu bir dayanışma platformudur. Backend tamamen **Firebase** üzerinde çalışır. Frontend **Next.js 16 (App Router)** + **TypeScript** + **Tailwind CSS** ile geliştirilmektedir.

Firebase projesi: **TomrisApp** (`tomrisapp`)

---

## Tamamlanan Özellikler

### Kimlik Doğrulama (Auth)
- [x] E-posta / şifre ile kayıt ve giriş
- [x] Google (Gmail) ile giriş
- [x] Kayıt sonrası e-posta doğrulama (Firebase `sendEmailVerification`)
- [x] Google ile giriş yapan kullanıcılar için profil tamamlama akışı (`/kayit-tamamla`)
- [ ] Şifremi unuttum (Gmail doğrulama ile sıfırlama) — **planlandı, henüz yapılmadı**

### Cinsiyet Doğrulama
- [x] Kayıt sırasında cinsiyet seçimi (kadın / erkek)
- [x] 5 saniyelik geri sayım ile kamera selfie doğrulaması
- [x] Doğrulama fotoğrafı Firebase Storage'a yüklenir
- [x] Kullanıcı profili Firestore `users` koleksiyonuna kaydedilir

### UI / UX
- [x] Mobil uyumlu (responsive) tasarım
- [x] Giriş ve kayıt ekranlarında Atatürk sözü:
  > *"Şuna inanmak lazımdır ki, dünya yüzünde gördüğümüz her şey kadının eseridir."*
- [x] Kullanıcı dashboard (`/dashboard`)

### Admin Paneli
- [x] Normal kullanıcı hesaplarından **tamamen ayrı** admin girişi (`/admin/giris`)
- [x] Admin oturumu HTTP-only cookie ile yönetilir
- [x] Temel admin panel iskeleti (`/admin`)
- [ ] Admin panelinde kullanıcı listesi / moderasyon — **planlandı**

---

## Planlanan Özellikler (Yapılacaklar)

### Sosyal Özellikler
- [ ] Arkadaş ekleme
- [ ] Arkadaş çıkarma
- [ ] Kullanıcı engelleme
- [ ] Gönderi paylaşma
- [ ] Gönderiye yorum atma
- [ ] Gönderi için **il / ilçe seçme**

### Acil Durum
- [ ] **Sinyal gönderme** — acil durumda kayıtlı arkadaşlara bildirim / sinyal

### Auth Ek
- [ ] **Şifremi unuttum** — Firebase `sendPasswordResetEmail` ile Gmail doğrulama / şifre sıfırlama

---

## Sayfa Haritası

| URL | Açıklama | Durum |
|-----|----------|-------|
| `/` | `/giris` yönlendirmesi | ✅ |
| `/giris` | Kullanıcı girişi (e-posta + Google) | ✅ |
| `/kayit` | Kullanıcı kaydı + cinsiyet doğrulama | ✅ |
| `/kayit-tamamla` | Google kayıt sonrası profil tamamlama | ✅ |
| `/dashboard` | Kullanıcı ana sayfası | ✅ |
| `/admin/giris` | Admin girişi (Firebase'den bağımsız) | ✅ |
| `/admin` | Admin paneli | ✅ (iskelet) |

---

## Proje Yapısı

```
src/
├── app/
│   ├── giris/page.tsx          # Login
│   ├── kayit/page.tsx          # Register
│   ├── kayit-tamamla/page.tsx  # Google profil tamamlama
│   ├── dashboard/page.tsx      # Kullanıcı paneli
│   ├── admin/
│   │   ├── giris/page.tsx      # Admin login
│   │   └── page.tsx            # Admin panel
│   └── api/admin/              # Admin oturum API
├── components/
│   ├── AtaturkQuote.tsx
│   ├── AuthLayout.tsx
│   ├── GenderVerification.tsx  # 5sn geri sayım + kamera
│   ├── GoogleSignInButton.tsx
│   └── Providers.tsx
├── context/
│   └── AuthProvider.tsx        # Firebase auth state
├── lib/
│   ├── firebase.ts             # Firebase client init
│   └── auth-helpers.ts         # Kayıt, profil, foto yükleme
├── types/
│   └── user.ts
└── middleware.ts               # Admin route koruması
```

---

## Firebase Koleksiyonları (Mevcut)

### `users`
```typescript
{
  uid: string;
  username: string;
  email: string;
  gender: "kadin" | "erkek";
  verificationPhotoUrl: string;
  genderVerified: boolean;
  createdAt: string;
  authProvider: "email" | "google";
}
```

### Planlanan koleksiyonlar
- `posts` — gönderiler (il, ilçe, içerik, yazar, tarih)
- `comments` — gönderi yorumları
- `friendships` — arkadaşlık istekleri / ilişkiler
- `blocks` — engellenen kullanıcılar
- `signals` — acil durum sinyalleri

---

## Kurulum

```bash
npm install
cp .env.local.example .env.local   # veya .env.local dosyasını düzenle
npm run dev
```

Uygulama: `http://localhost:3000`

---

## Ortam Değişkenleri (`.env.local`)

```env
# Firebase — Firebase Console > Proje ayarları > Genel > Web uygulaması
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Admin paneli — Firebase'de YOK, projede kendin belirlersin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=guclu_sifre_buraya
```

> ⚠️ `.env.local` dosyasını asla Git'e commit etme.

---

## Admin Şifresi Nasıl Ayarlanır?

Admin şifresi **Firebase'de değil**, proje kökündeki **`.env.local`** dosyasında tanımlanır.

**CEO / yönetici için adımlar (kod bilgisi gerekmez):**

1. Cursor veya Not Defteri ile `.env.local` dosyasını aç
2. Şu satırları kendi istediğin değerlerle değiştir:
   ```env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=Tomris2026!
   ```
3. Dosyayı kaydet
4. Terminalde `npm run dev` çalışıyorsa durdur (Ctrl+C) ve tekrar başlat
5. Tarayıcıda `http://localhost:3000/admin/giris` adresine git
6. Az önce belirlediğin kullanıcı adı ve şifre ile giriş yap

**Önemli:**
- Normal kullanıcı kayıtları (e-posta/şifre veya Google) admin paneline **giremez**
- Admin şifresini değiştirmek için sadece `.env.local` dosyasını düzenlemen yeterli
- Canlıya (production) alırken hosting platformunda (Vercel vb.) aynı env değişkenlerini panelden gir

---

## Firebase Console Kurulumu (Yapılması Gerekenler)

Firebase Console → **TomrisApp** projesi:

1. **Authentication** → Email/Password ✅ + Google ✅ etkinleştir
2. **Firestore Database** → oluştur (test mode ile başlanabilir)
3. **Storage** → oluştur (doğrulama fotoğrafları için)
4. **Authorized domains** → `localhost` ekli olsun

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Firebase Auth, Firestore, Storage |
| Admin auth | Next.js API Route + HTTP-only cookie (Firebase dışı) |

---

## Geliştirme Notları (AI için)

- Firebase client yalnızca tarayıcıda init edilir (`src/lib/firebase.ts` — lazy init)
- Tüm auth sayfaları `"use client"` bileşenleridir
- Cinsiyet doğrulama fotoğrafları: `Storage/verifications/{uid}/{timestamp}.jpg`
- Admin middleware: `src/middleware.ts` — `/admin/*` rotalarını korur (`/admin/giris` hariç)
- Yeni özellik eklerken mevcut `AuthLayout`, `AuthProvider` ve Firebase helper'ları kullan
- Türkçe UI dili kullanılıyor; URL'ler Türkçe (`/giris`, `/kayit`)

---

## Sonraki Öncelikler (Önerilen Sıra)

1. Firebase Console'da Auth + Firestore + Storage'ı tam aç
2. Şifremi unuttum akışı
3. Arkadaşlık sistemi (ekle / çıkar / engelle)
4. Gönderi + yorum + il/ilçe
5. Acil durum sinyali
6. Admin panelinde moderasyon araçları
