# Tomris Web — Kadın Dayanışma Platformu

> **AI / Geliştirici Notu:** Bu README, projeye yeni katılan geliştiriciler ve yapay zeka asistanları için proje durumunu, mimariyi ve yol haritasını özetler. Kod yazmadan önce bu dosyayı okuyun.

**GitHub:** https://github.com/yagizhanaydin/tomris-web  
**Firebase projesi:** TomrisApp (`tomrisapp`) — **Spark (ücretsiz) plan**

---

## Proje Özeti

**Tomris Web**, kadınların birbirine destek olduğu bir dayanışma platformudur.

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Auth / Veri | Firebase Auth + Firestore |
| Fotoğraf (geçici) | **Local:** `data/verifications/` · **Vercel:** Firebase Storage (Admin SDK) |
| Kadın Temsilci / Admin | Next.js API + HTTP-only cookie (Firebase auth'tan bağımsız) |

---

## Firebase Kurulum Durumu

| Adım | Durum |
|------|--------|
| Firebase projesi (TomrisApp) | ✅ |
| Authentication — E-posta/Şifre | ✅ |
| Authentication — Google | ✅ |
| Firestore Database | ✅ |
| Firestore Security Rules (`firestore.rules`) | ⚠️ Repodaki dosyayı Console'da **Publish** et — eski kısa sürümü kullanma |
| Service Account JSON (`.env.local`) | ✅ |
| Firebase Storage | ✅ Vercel deploy için (Spark yeterli) — [`DEPLOY.md`](DEPLOY.md) |
| Canlı test (`npm run dev`) | ⏳ Yapılacak |

Detaylı kurulum: [`FIREBASE-KURULUM.md`](FIREBASE-KURULUM.md)  
Doğrulama akışı: [`DOGRULAMA-AKISI.md`](DOGRULAMA-AKISI.md)  
**Canlıya alma:** [`DEPLOY.md`](DEPLOY.md)

---

## Tamamlanan Özellikler

### Kimlik Doğrulama
- [x] E-posta / şifre kayıt ve giriş
- [x] Google (Gmail) giriş ve kayıt
- [x] E-posta doğrulama (`sendEmailVerification`) — **doğrulanmadan platforma giriş kapalı** (`/eposta-dogrula`)
- [x] Google profil tamamlama (`/kayit-tamamla`)
- [x] Şifremi unuttum (`/sifremi-unuttum`)

### Doğrulama — Soft Gate (kullanıcı dostu)
- [x] **Kayıt fotoğrafsız** — kullanıcı hemen dashboard'a girer
- [x] **Kısıtlı mod:** doğrulama olmadan arkadaşlık, yorum vb. **kapalı**
- [x] `/dogrulama` — isteğe bağlı fotoğraf doğrulama + güven verici açıklama metni
- [x] 5 saniyelik geri sayım + kamera selfie
- [x] Fotoğraf **sunucuda geçici** tutulur (`data/verifications/{uid}.jpg`)
- [x] **Kadın temsilci paneli** (`/temsilci`) — yalnızca kadın temsilciler inceler
- [x] **Admin panelinin fotoğrafa erişimi yok** — teknik ve metinsel olarak ayrılmış
- [x] Onay / red / yasak sonrası fotoğraf **anında silinir**
- [x] Bekleyen: dashboard + akış okuma (turuncu banner) · Reddedilen: `/dogrulama-reddedildi` · Onaylı: tam erişim
- [x] Dashboard banner metni (`VerificationStatusBanner`) — empatik ton + **güvenli bir adım** CTA

### Ban Sistemi (troll / uygunsuz içerik)
- [x] Temsilci panelinde **Kalıcı Yasakla** (Reddet'ten ayrı)
- [x] Fotoğraf anında silinir, Firebase Auth hesabı devre dışı bırakılır
- [x] E-posta + UID `platform_bans` koleksiyonuna eklenir — **aynı mail ile tekrar kayıt olamaz**
- [x] Yasaklı kullanıcı: `/hesap-yasaklandi`
- [x] Kayıt öncesi e-posta ban kontrolü (`/api/auth/check-ban`)
- [x] **IP ban yok** — hesap + e-posta bazlı yasak (paylaşımlı IP riski nedeniyle)

### İçerik Moderasyonu (yasaklı kelime filtresi)
- [x] TR / EN şiddet, cinsiyetçi ve ırkçı kelime listesi (`src/lib/security/content-filter.ts`)
- [x] Kayıt ve kullanıcı adında kontrol (`kill`, `women killer`, `katil`, `öldür` vb.)
- [x] Gönderi ve yorum metninde kontrol (`sanitizeText`)
- [x] Birleşik yazım yakalanır (`womenkiller`, `kadınkiller`)
- [x] TR / EN hata mesajları (`contentBlocked`, `errorBannedContent`)

### Sosyal
- [x] Arkadaş ekleme / kabul / red / çıkarma / engelleme (`/arkadaslar`)
- [x] Doğrulanmamış kullanıcılar sayfayı görür, etkileşim kilitli (`VerificationGate`)
- [x] **Akış / gönderi paylaşma** (`/akis`) — Instagram tarzı metin gönderileri
- [x] Gönderiye yorum (doğrulama gerekli)
- [x] Konum: Türkiye (81 il + ilçe) ve **AB (27 ülke + şehir, ilçe yok)**
- [x] Hedef kitle filtresi: tüm kullanıcılar / yalnızca kadın / yalnızca erkek
- [x] Filtreler: bölge, il/ülke, ilçe, cinsiyet, hedef kitle, tarih aralığı

### Sohbet (canlı — Firestore onSnapshot)
- [x] **Bireysel DM** (`/mesajlar`) — arkadaş veya herkese açık (ayarlardan)
- [x] **Grup sohbeti** — kurucu yönetici, üyeler mesaj yazar
- [x] Grup konumu: TR il/ilçe, AB ülke/şehir + filtreler
- [x] **Canlı mesajlar** — `onSnapshot` ile anında güncelleme
- [x] Son 20 mesaj + eski mesajları yükle (sayfalama)
- [x] Ayarlar (`/ayarlar`) — sohbet gizliliği: arkadaşlar / herkes
- [x] Yasaklı kelime filtresi mesajlarda da aktif

### Yasal & Hesap
- [x] Kullanım Koşulları (`/kullanim-kosullari`) TR/EN
- [x] Gizlilik Politikası (`/gizlilik-politikasi`) KVKK uyumlu özet
- [x] Kayıtta sözleşme onay checkbox'ı
- [x] **Hesap silme** — Ayarlar → DELETE onayı → `/api/account/delete`

### Güvenlik
- [x] Firestore: kullanıcı `verificationStatus` self-approve **engellendi**
- [x] İmzalı admin/temsilci oturum çerezleri (`SESSION_SECRET`)
- [x] API rate limiting (login, upload, check-ban, genel API)
- [x] Middleware güvenlik başlıkları + temsilci API koruması
- [x] `signals` koleksiyonu client erişime kapalı

### UI / UX
- [x] Mobil uyumlu Tailwind tasarım
- [x] Mor Tomris teması + Tomris logosu/isim
- [x] TR / EN dil desteği (`src/lib/i18n/`)
- [x] Atatürk sözü (giriş/kayıt)

### Admin (genel yönetim — doğrulama fotoğrafı yok)
- [x] Ayrı admin girişi (`/admin/giris`)
- [x] Temel admin iskeleti (`/admin`)
- [x] Doğrulama fotoğraflarına **erişemez** (yalnızca `/temsilci`)

---

## Planlanan Özellikler (Yapılacaklar)

### Sosyal
- [ ] Gönderiye fotoğraf ekleme
- [ ] Beğeni / etkileşim sayacı

### Acil Durum
- [ ] Sinyal gönderme — arkadaşlara acil bildirim

### Panel / Yönetim
- [ ] Admin moderasyon araçları
- [ ] PWA / mobil uygulama kabuğu

---

## Sayfa Haritası

| URL | Açıklama |
|-----|----------|
| `/giris` | Kullanıcı girişi |
| `/eposta-dogrula` | E-posta doğrulama (e-posta/şifre kayıtları) |
| `/kayit` | Kayıt (fotoğrafsız) |
| `/kayit-tamamla` | Google kayıt sonrası profil |
| `/sifremi-unuttum` | Şifre sıfırlama |
| `/dashboard` | Ana sayfa (doğrulanmamış: kısıtlı mod + banner) |
| `/akis` | Topluluk akışı — gönderi, yorum, filtreler (paylaşım: doğrulama gerekli) |
| `/dogrulama` | Fotoğraf doğrulama (isteğe bağlı adım) |
| `/dogrulama-bekliyor` | Eski bekleme URL'si → dashboard'a yönlendirir |
| `/dogrulama-reddedildi` | Doğrulama reddedildi — tekrar denenebilir |
| `/hesap-yasaklandi` | Kalıcı ban |
| `/arkadaslar` | Arkadaşlık yönetimi (doğrulama gerekli) |
| `/mesajlar` | DM + gruplar (canlı sohbet) |
| `/mesajlar/[id]` | Sohbet ekranı |
| `/ayarlar` | Sohbet gizliliği (arkadaş / herkes) |
| `/kullanim-kosullari` | Kullanım koşulları |
| `/gizlilik-politikasi` | Gizlilik politikası (KVKK) |
| `/temsilci/giris` | **Kadın temsilci** girişi |
| `/temsilci` | Kadın temsilci paneli (onay / red / yasak) |
| `/admin/giris` | Admin girişi (fotoğraf erişimi yok) |
| `/admin` | Admin paneli |

---

## Roller

| Rol | Giriş | Görev |
|-----|-------|-------|
| Kullanıcı | Firebase Auth | Platform kullanımı |
| **Kadın Temsilci** | `.env` → `REP_USERNAME` / `REP_PASSWORD` | Fotoğraf inceleme, onay / red / **kalıcı yasak** |
| **Admin** | `.env` → `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Genel yönetim — **doğrulama fotoğrafına erişemez** |

---

## Doğrulama Akışı (Soft Gate)

```
Kayıt (fotoğrafsız) → verificationStatus = "unverified" → /dashboard (kısıtlı)
       ↓
İsteğe bağlı /dogrulama → selfie → data/verifications/{uid}.jpg (geçici)
       ↓
Firestore: verificationStatus = "pending"
       ↓
Dashboard + akış (okuma) — turuncu banner: "Doğrulaman inceleniyor"
Yazma / arkadaş / mesaj kapalı (onay sonrası otomatik açılır)
       ↓
Kadın temsilci inceler (/temsilci)
       ↓
Onayla & Sil  →  "approved"  →  tam erişim
Reddet & Sil  →  "rejected"  →  tekrar /dogrulama
Kalıcı Yasakla → "banned"   →  Auth devre dışı, e-posta + UID ban listesinde (IP ban yok)
       ↓
Fotoğraf diskten silinir — kalıcı kalmaz
```

### Kullanıcıya gösterilen güven metni (özet)

**Dashboard banner** (`src/lib/i18n/tr.ts` → `verification.bannerTitle` / `bannerBody`):

> **Başlık:** Kadınların güvenliği için güvenli bir adım  
> **Metin:** Bir kadın olarak dijital alanlarda ve gerçek hayatta yaşadığın zorlukları ve yorgunluğu biliyoruz, seni anlıyoruz. Tomris boş bir uygulama değil, gerçek bir kadın dayanışma alanı. Seni burada rahat ve konforlu hissettirmek istiyoruz. Şimdilik siteyi gezebilirsin; kadın temsilcilerimiz seni doğruladıktan sonra paylaşım, yorum ve mesajlaşma açılır. Bu önlemi yalnızca senin huzurun ve güvenliğin için alıyoruz — umarız bunu anlayışla karşılarsın.

**Genel doğrulama iletişimi:**

> **Kullanıcı / müşteri iletişimi (doğrulama):** Tomris boş bir uygulama değildir — kadınların birbirine destek olduğu, gerçek bir **kadın dayanışma platformudur**. Bir kadın olarak dijital alanlarda ve gerçek hayatta yaşadığınız zorlukları ve yorgunluğu biliyoruz; sizi bu uygulamada **rahat ve konforlu** hissettirmek istiyoruz. Doğrulama sizi yargılamak için değil, topluluğu güvende tutmak içindir. Kadın temsilcilerimiz her başvuruda görselin yapay zeka (AI) üretimi olmadığını, başka hesaptan alınmadığını ve kötü niyetli sahte profil olmadığını kontrol eder. Fotoğrafa yalnızca kadın temsilciler bakar; erkek adminler erişemez. İnceleme sonrası fotoğraf kalıcı olarak silinir. Onay gelene kadar kullanıcı akışı okuyabilir; paylaşım ve mesajlaşma onay sonrası açılır.

> Bir kadın olarak ne kadar yorulduğunu biliyoruz. Doğrulamayı yalnızca kadın temsilciler gerçekleştirir. Erkek adminler ve genel yönetim panelinin bu fotoğraflara erişimi yoktur. Onay veya red sonrası fotoğraf kalıcı olarak silinir.

---

## Proje Yapısı

```
src/
├── app/
│   ├── giris/ kayit/ kayit-tamamla/ sifremi-unuttum/
│   ├── dashboard/ dogrulama/ dogrulama-bekliyor/ dogrulama-reddedildi/
│   ├── hesap-yasaklandi/ arkadaslar/ akis/
│   ├── temsilci/          # Kadın temsilci paneli
│   ├── admin/             # Admin paneli (fotoğraf yok)
│   └── api/
│       ├── auth/check-ban/
│       ├── verification/upload/
│       └── temsilci/      # Onay / red / ban API
├── lib/
│   ├── auth-routing.ts    # Soft gate yönlendirme
│   ├── ban/               # Kalıcı yasak servisi
│   ├── posts/             # Gönderi ve yorum servisi
│   ├── locations/         # TR iller/ilçeler + AB ülkeler/şehirler
│   ├── verification/      # local-storage, service
│   ├── friends/           # Arkadaşlık servisi
│   ├── i18n/              # TR / EN
│   └── security/
│       ├── validate.ts
│       └── content-filter.ts  # Yasaklı kelime listesi
├── components/
│   ├── posts/             # PostComposer, PostCard, PostFilters
│   ├── VerificationStatusBanner.tsx
│   ├── VerificationGate.tsx
│   ├── VerificationIntro.tsx
│   └── ...
└── middleware.ts            # /admin ve /temsilci koruması

data/verifications/          # Geçici fotoğraflar (git'e girmez)
firestore.rules              # users, friendships, posts, comments, platform_bans...
firestore.indexes.json       # Mesajlar / gruplar composite index tanımları
```

---

## Firestore Rules — Hangi dosya? (ÖNEMLİ)

> **Kuralları terminale yapıştırma.** Firestore rules yalnızca [Firebase Console](https://console.firebase.google.com/project/tomrisapp/firestore/rules) → **Rules** sekmesine yapıştırılır ve **Publish** edilir. PowerShell / CMD'ye yapıştırırsan komut hatası alırsın — projeye veya Firebase'e zarar vermez, yok say.

### Kullanılacak dosya: repodaki `firestore.rules`

Chat'te veya eski notlarda dolaşan kısa rules sürümü **güncel değildir — onu kullanma.** Aşağıdaki farklar kritik:

| Konu | Eski / yapıştırdığın sürüm | Repodaki `firestore.rules` |
|------|---------------------------|----------------------------|
| `users` update | Her owner istediğini yazar → **kendini `approved` yapabilir** | Sadece `chatVisibility` veya `pending` fotoğraf gönderimi |
| `users` create | Her alan serbest | `unverified` zorunlu, ban alanları engelli |
| `friendships` / `blocks` | Sadece `isSignedIn()` | **`isApproved()`** — doğrulanmadan arkadaşlık yok |
| `conversations` update | Participant her alanı değiştirebilir | Sadece `lastMessage*` veya kontrollü gruba katılma |
| `signals` | Herkes yazabilir | Client kapalı (henüz feature yok) |

### Console'a doğru yükleme (3 adım)

1. Bu repodaki [`firestore.rules`](firestore.rules) dosyasını aç — **tüm içeriği** kopyala
2. Firebase Console → TomrisApp → **Firestore Database** → **Rules**
3. Editörü temizle → yapıştır → **Publish**

Doğru sürümde şu satırlar **mutlaka** görünmeli:

```
function userSelfUpdateAllowed() { ... }
function groupJoinAllowed() { ... }
function lastMessageUpdateAllowed() { ... }
match /signals/{signalId} {
  allow read, write: if false;
}
```

Eski sürümde `allow update: if isOwner(userId);` ve `signals` için `allow write: if isSignedIn();` varsa — **yanlış rules yayında demektir**, hemen `firestore.rules` ile değiştir.

### Index (mesajlar hatası)

Rules'tan ayrı: `/mesajlar` için [`firestore.indexes.json`](firestore.indexes.json) index'leri Console'da oluştur. Detay: [`FIREBASE-KURULUM.md`](FIREBASE-KURULUM.md).

---

## Firestore Koleksiyonları

### `users`

```typescript
{
  uid: string;
  username: string;
  email: string;
  gender: "kadin" | "erkek";
  verificationPhotoPath: string;   // boş = henüz foto yok
  verificationStatus: "unverified" | "pending" | "approved" | "rejected" | "banned";
  genderVerified: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  bannedAt?: string;
  bannedBy?: string;
  banReason?: string;
  authProvider: "email" | "google";
  createdAt: string;
}
```

### `platform_bans` (yalnızca sunucu — Admin SDK)

```typescript
{
  uid: string;
  email: string;       // tekrar kayıt engeli
  username: string;
  reason: string;
  bannedAt: string;
  bannedBy: string;
}
```

Koleksiyonlar kayıt olunca **otomatik** oluşur — Firebase Console'dan elle oluşturma.

### `posts`

```typescript
{
  authorUid: string;
  authorUsername: string;
  authorGender: "kadin" | "erkek";
  content: string;
  region: "tr" | "eu";
  country: string;       // TR için "TR"
  city: string;
  district: string;      // AB gönderilerinde boş
  audience: "all" | "kadin" | "erkek";
  createdAt: string;
}
```

### `comments`

```typescript
{
  postId: string;
  authorUid: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}
```

> Gönderi ve yorum oluşturmak için Firestore rules: `verificationStatus == "approved"` (`isApproved()`).

---

## Kurulum

```bash
npm install
cp .env.local.example .env.local
# .env.local dosyasını doldur (aşağıya bak)
npm run dev
```

---

## Ortam Değişkenleri (`.env.local`)

```env
# Firebase web config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Admin (genel yönetim — fotoğraf erişimi yok)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=

# Kadın temsilci (fotoğraf onay / red / yasak)
REP_USERNAME=temsilci
REP_PASSWORD=

# Oturum imzası (admin/temsilci — production zorunlu)
SESSION_SECRET=

# Service Account — Firebase Console > Service Accounts > private key
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...tek satır...}

# local = disk (npm run dev / VPS) | firebase = Storage (Vercel)
VERIFICATION_PHOTO_STORAGE=local
```

> ⚠️ `.env.local` ve indirilen JSON dosyasını asla Git'e commit etme.

---

## Güvenlik

- Firestore kuralları: kullanıcı kendi verisini yazar; `platform_bans` yalnızca sunucu
- Doğrulama fotoğrafları: `data/verifications/` — dışarıdan erişilemez
- Fotoğraf API'si yalnızca **temsilci oturumu** ile (`isRepSession`) — admin erişemez
- Onay / red / yasak sonrası fotoğraf diskten silinir
- Kalıcı yasak: Firebase Auth `disabled: true` + e-posta/UID ban listesi (**IP ban yok**)
- İçerik filtresi: `src/lib/security/content-filter.ts` — kayıt, kullanıcı adı, gönderi, yorum
- Input doğrulama: `src/lib/security/validate.ts`
- Şifre temsilciye veya Firestore'a **asla** yazılmaz

---

## Test Senaryosu

1. `npm run dev`
2. `/kayit` → kayıt ol → `/eposta-dogrula` → maildeki link → `/giris` → `/dashboard` (mor banner görünür)
3. `/akis` → akışı gör; gönderi/yorum kilitli (doğrulama gerekli)
4. `/arkadaslar` → kilitli form
5. `/dogrulama` → fotoğraf çek
6. `/temsilci/giris` → kadın temsilci → **Onayla & Sil** (veya troll için **Kalıcı Yasakla**)
7. `/giris` → kullanıcı giriş → `/akis` üzerinden gönderi + yorum dene
8. Yasaklı kelime testi: kayıt veya gönderide `kill` vb. → engellenmeli
9. Firestore → `users`, `posts`, `comments` + gerekirse `platform_bans`

---

## Sonraki Öncelikler

1. ⏳ Uçtan uca test + **git commit/push**
2. Canlı deploy — adımlar: [`DEPLOY.md`](DEPLOY.md) (Vercel + Firebase Storage **veya** VPS + disk)
3. Acil durum sinyali + push bildirim
5. PWA / mobil uygulama dönüşümü
