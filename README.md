# Tomris Web — Kadın Dayanışma Platformu

> **AI / Geliştirici Notu:** Bu README, projeye yeni katılan geliştiriciler ve yapay zeka asistanları için proje durumunu, mimariyi ve yol haritasını özetler. Kod yazmadan önce bu dosyayı okuyun.

**GitHub:** https://github.com/yagizhanaydin/tomris-web  
**Firebase projesi:** TomrisApp (`tomrisapp`) — **Spark (ücretsiz) plan**

---

## Proje Özeti

**Tomris Web**, kadınların birbirine destek olduğu bir **güvenli dayanışma platformudur**.

**Marka mesajı (5 dil):** *“Kadın dayanışma platformu — kadınların birbirini duyduğu güvenli alan”* — giriş/kayıt, tagline ve logo altı; **kadın** vurgusu açık.

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Auth / Veri | Firebase Auth + Firestore |
| Fotoğraf (geçici) | **Local:** `data/verifications/` · **Vercel:** Firestore geçici belge (Spark, kart gerekmez) |
| Kadın Temsilci / Admin | Next.js API + HTTP-only cookie (Firebase auth'tan bağımsız) |

---

## Firebase Kurulum Durumu

| Adım | Durum |
|------|--------|
| Firebase projesi (TomrisApp) | ✅ |
| Authentication — E-posta/Şifre | ✅ |
| Authentication — Google | ✅ |
| Firestore Database | ✅ |
| Firestore Security Rules (`firestore.rules`) | ✅ Güncel — `reps` dahil; Console'da **Publish** et |
| Firestore Indexes (7 composite + 1 önerilen) | ✅ 7/7 Enabled — isteğe bağlı 8.: `comments` (postId + createdAt) |
| Service Account JSON (`.env.local`) | ✅ |
| Firebase Storage | ⚪ Opsiyonel (Blaze) — varsayılan Vercel yolu **Firestore** — [`DEPLOY.md`](DEPLOY.md) |
| GitHub (`master`) | ✅ Push edildi — son commit: `a378c72` |
| Canlı site (Vercel) | ⏳ Henüz deploy edilmedi |
| Local test (`npm run dev`) | ✅ Hazır |

Detaylı kurulum: [`FIREBASE-KURULUM.md`](FIREBASE-KURULUM.md)  
Doğrulama akışı: [`DOGRULAMA-AKISI.md`](DOGRULAMA-AKISI.md)  
**Canlıya alma:** [`DEPLOY.md`](DEPLOY.md)

---

## Envanter (Kontrol Listesi)

> Deploy öncesi ve Firebase Console'da tek bakışta durum. ✅ = kodda hazır · ⏳ = senin yapman gereken.

### Firebase Console

| Madde | Durum | Not |
|-------|--------|-----|
| Authentication (E-posta + Google) | ✅ | |
| Firestore Database | ✅ | |
| **Rules Publish** (`firestore.rules`) | ⏳ | Grup: yalnızca üye okur; `join_requests` client kapalı; `groupJoinAllowed` **yok** |
| **Indexes (7 zorunlu)** | ✅ | conversations×2, signals×2, fcm_tokens, reports, users |
| Index #8 `comments` (postId + createdAt) | ⚪ Önerilen | Yorum açılırken index hatası alırsan ekle — [`firestore.indexes.json`](firestore.indexes.json) |
| Cloud Messaging → Web Push (VAPID) | ⏳ | Key → `NEXT_PUBLIC_FIREBASE_VAPID_KEY` |
| Blaze / Storage | ⚪ Opsiyonel | Varsayılan Vercel yolu **Firestore** selfie |

### Ortam değişkenleri (`.env.local` / Vercel)

| Değişken | Zorunlu | Durum |
|----------|---------|--------|
| `NEXT_PUBLIC_FIREBASE_*` (6 adet) | ✅ Evet | Firebase Console → Project settings |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅ Evet | Service Accounts → private key (tek satır JSON) |
| `SESSION_SECRET` | ✅ Production | Admin + temsilci oturum imzası (32+ karakter) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | ✅ Evet | `/admin/giris` |
| `REP_USERNAME` / `REP_PASSWORD` | ⚪ Yedek | Env temsilci; **veya** admin panelden Firestore `reps` |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | ⏳ Push için | Yoksa push çalışmaz, site açılır |
| `VERIFICATION_PHOTO_STORAGE` | Local/Vercel | `local` (dev) · `firestore` (Vercel/Spark) |

### Özellik envanteri (kod)

| Özellik | Durum |
|---------|--------|
| Kayıt / giriş / e-posta doğrulama | ✅ |
| Soft gate doğrulama (fotoğraf → temsilci) | ✅ |
| Doğrulama: KVKK checkbox + gizlilik §9 push | ✅ |
| Doğrulama: kullanabilir / kullanamaz paneli | ✅ |
| Doğrulama: kuyruk sırası (Sırada N. kişi) | ✅ |
| Dashboard onboarding checklist (4 adım) | ✅ |
| Kadın temsilci paneli (onay/red/yasak) | ✅ |
| Admin: istatistik + şikayet moderasyonu | ✅ |
| Admin: yorum / mesaj / gönderi silme | ✅ |
| Admin: Firestore temsilci ekleme (`reps`) | ✅ |
| PWA (Serwist, offline, install ipucu) | ✅ |
| Push: acil sinyal | ✅ |
| Push: doğrulama onayı | ✅ |
| Push: yeni mesaj | ✅ |
| Push: gönderiye yorum | ✅ |
| Push: arkadaş isteği | ❌ Sırada |
| **Grup: onaylı katılım + lider** | ✅ Lider istek kabul/red; üye çıkarma; lider ayrılınca devretme |
| **Grup: metadata gizliliği** | ✅ Liste `/api/groups`; Firestore'da grup doc yalnızca üyelere |
| **Profil ziyareti + süre (Reddit tarzı)** | ✅ `/profil/[username]` — "N gündür Tomris'te" |
| **UI: marka ikonu + sade nav (4 + Daha fazla)** | ✅ `TomrisMark` · `NavMoreSheet` |
| **UI: boş durum ekranları** | ✅ `EmptyState` — akış, mesaj, grup, arkadaş |
| **UI: iOS ana ekrana ekle kılavuzu** | ✅ Safari 3 adım (`PwaInstallHint`) |
| **UI: Neden Tomris? sayfası** | ✅ `/neden-biz` |
| Karanlık mod | ⏳ Yakında (placeholder + bilgi metni) |
| Üç parmak selfie UI (i18n hazır) | ⏳ Component bağlanmadı |
| Vercel canlı deploy | ⏳ |

### API rotaları (yeni / önemli)

| Rota | Kim |
|------|-----|
| `GET /api/verification/queue` | Bekleyen kullanıcı — sıra numarası |
| `POST /api/verification/upload` | Fotoğraf + KVKK onayı + `pending` (sunucu) |
| `GET/POST /api/admin/reps` | Admin — temsilci listele/ekle |
| `DELETE /api/admin/reps/[username]` | Admin — temsilci devre dışı |
| `GET /api/admin/reports` · `POST /api/admin/moderation` | Admin — şikayet + içerik sil |
| `GET /api/admin/stats` | Admin — kullanıcı/şikayet sayıları |
| `POST /api/push/notify` | Onaylı kullanıcı — mesaj/yorum push tetikle |
| `POST /api/push/register` | FCM token kaydı |
| `GET /api/groups` | Onaylı kullanıcı — public grup listesi (üye sayısı, konum; metadata sızıntısı yok) |
| `POST /api/groups/[id]/join` | Katılma isteği veya anında katılım (`joinMode`) |
| `GET /api/groups/[id]/join-requests` | Grup lideri — bekleyen istekler |
| `POST .../join-requests/[uid]/approve` · `reject` | Lider — istek kabul/red |
| `POST /api/groups/[id]/members/[uid]/kick` | Lider — üyeyi gruptan çıkar |
| `POST /api/groups/[id]/leave` | Üye ayrılır; lider ise liderlik devredilir |
| `GET /api/users/profile` | Onaylı profil — `memberSinceDays` (Reddit tarzı süre) |
| `GET /api/users/lookup` · `search` | Kullanıcı arama — süre bilgisi dahil |

---

## Güncel Durum Özeti

| Alan | Durum |
|------|--------|
| Kod (GitHub) | ✅ master ile senkron |
| Firestore rules | ✅ Güncel — `canReadAudienceContent`, `usernames`, `reports`, `signals` |
| Audience okuma (onaysız) | ✅ Yalnızca `all` gönderiler; kadın/erkek içerik onay şart |
| Kullanıcı adı benzersizliği | ✅ `usernames/{username}` koleksiyonu |
| Şikayet / raporlama | ✅ Gönderilerde "Şikayet et" (`reports`) |
| Sinyal nav + rozet + kapat | ✅ Ana nav'da Sinyal; "Gördüm — kapat" API |
| Engelleme → akış filtresi | ✅ Engellenen kullanıcı gönderileri gizlenir |
| Doğrulama fotoğrafı (local) | ✅ Disk → `data/verifications/{uid}.jpg` |
| Doğrulama fotoğrafı (Vercel) | ✅ Firestore `verification_photos/{uid}` — **Spark, kart gerekmez** |
| 5 dil (TR / EN / DE / FR / ES) | ✅ Tam — arama, sinyal, konum metinleri dahil |
| Marka dili (dayanışma vitrin) | ✅ Giriş/kayıt + tagline — 5 dil; şiddet sloganı kaldırıldı |
| Dil seçici | ✅ Header 🌐 → alttan sheet · Ayarlar'da da var |
| Kullanıcı adı arama (öneriler) | ✅ `papa` → `papatyakız` — Arkadaşlar + Yeni DM |
| Türkçe kullanıcı adı | ✅ ç, ğ, ı, ö, ş, ü destekli |
| Acil sinyal + konum | ✅ GPS → arkadaşlara anlık (onSnapshot) |
| Sinyal hukuki onay | ✅ İlk `/sinyal` bilgi kutusu + gönderim öncesi checkbox (sunucu kaydı) |
| PWA (Serwist) | ✅ Manifest, PNG ikonlar, SW, offline, ana ekrana ekle ipucu |
| Push (sinyal + onay + mesaj + yorum) | ✅ FCM — VAPID key + bildirim izni gerekir |
| Doğrulama KVKK onayı + genişletilmiş gizlilik | ✅ Checkbox `/dogrulama` · §6–§9 gizlilik |
| Doğrulama kuyruk + erişim paneli | ✅ Sırada N. kişi · kullanabilir/kullanamaz listesi |
| Dashboard onboarding checklist | ✅ 4 adım (e-posta, doğrulama, arkadaş, gönderi) |
| Admin panel (moderasyon + temsilci) | ✅ Şikayet, içerik silme, `reps` CRUD |
| **Grup: onaylı katılım + lider moderasyonu** | ✅ İstek kabul/red, üye çıkarma, lider devri |
| **Grup metadata gizliliği** | ✅ Public liste API; Firestore grup doc yalnızca üyeler |
| **Profil ziyareti + platform süresi** | ✅ `/profil/[username]` — "N gündür Tomris'te" |
| **Marka ikonu (dayanışma simgesi)** | ✅ `TomrisMark` + maskable PWA ikonları |
| **Nav 4 + Daha fazla** | ✅ Ana Sayfa · Akış · Mesajlar · sheet (Arkadaş/Sinyal/Ayarlar/Neden) |
| **Boş durum illüstrasyonları** | ✅ Akış, sohbet, grup, arkadaş, thread |
| **iOS PWA kılavuzu** | ✅ Safari ana ekrana ekle adımları |
| **Neden Tomris?** | ✅ `/neden-biz` — dayanışma, güvenlik, gizlilik |
| Karanlık mod | ⏳ Yakında |
| Vercel deploy | ❌ Sırada — local test devam |

**Tek cümle:** Kod ve Firebase hazır; site şu an yalnızca `npm run dev` ile local'de çalışır. İnternete açmak için Vercel deploy gerekir.

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
- [x] **KVKK onay checkbox'ı** — gizlilik linki; upload sunucuda `verificationPrivacyConsentAt`
- [x] **Erişim paneli** — manuel inceleme; şu an kullanabilir / onay sonrası açılır listesi
- [x] **Kuyruk sırası** — "Sırada N. kişisiniz" (`/api/verification/queue`, ~30 sn yenileme)
- [x] **Dashboard onboarding** — 4 adımlı checklist (`OnboardingChecklist`)
- [x] 5 saniyelik geri sayım + kamera selfie
- [x] Fotoğraf **sunucuda geçici** tutulur — **local:** `data/verifications/{uid}.jpg` · **Vercel:** Firestore `verification_photos/{uid}` (Spark)
- [x] **Kadın temsilci paneli** (`/temsilci`) — yalnızca kadın temsilciler inceler
- [x] **Admin panelinin fotoğrafa erişimi yok** — teknik ve metinsel olarak ayrılmış
- [x] Onay / red / yasak sonrası fotoğraf **anında silinir**
- [x] Bekleyen: dashboard + akış okuma (turuncu banner) · Reddedilen: **soft gate** (gezebilir, banner + tekrar dene) · Onaylı: tam erişim
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
- [x] **Kullanıcı adı arama + öneriler** — yazdıkça eşleşen isimler + **platform süresi** (`UsernameSearchInput`)
- [x] **Profil ziyareti** — `/profil/[username]`; Reddit tarzı **"N gündür Tomris'te"** (`memberSinceDays`)
- [x] **Türkçe kullanıcı adı** — `papatyakız`, `gülkız` vb. (`src/lib/security/username.ts`, `tr-TR` normalizasyon)
- [x] **Kullanıcı adı benzersizliği** — `usernames/{username}` rezervasyonu; çakışmada `USERNAME_TAKEN`
- [x] **Şikayet et** — gönderilerde raporlama (`ReportButton` → `reports` koleksiyonu)
- [x] **Engellenen kullanıcı** gönderileri akışta gizlenir
- [x] Doğrulanmamış kullanıcılar sayfayı görür, etkileşim kilitli (`VerificationGate`)
- [x] **Akış / gönderi paylaşma** (`/akis`) — Instagram tarzı metin gönderileri
- [x] Gönderiye yorum (doğrulama gerekli)
- [x] Konum: Türkiye (81 il + ilçe) ve **AB (27 ülke + şehir, ilçe yok)**
- [x] Hedef kitle filtresi: tüm kullanıcılar / yalnızca kadın / yalnızca erkek
- [x] Filtreler: bölge, il/ülke, ilçe, cinsiyet, hedef kitle, tarih aralığı
- [x] Gönderi sahibi cinsiyeti: **♀ / ♂ rozeti** (`AuthorGenderBadge`) — "Kadın/Erkek" metni yok

### Sohbet (canlı — Firestore onSnapshot)
- [x] **Bireysel DM** (`/mesajlar`) — arkadaş veya herkese açık (ayarlardan)
- [x] **Grup sohbeti** — kurucu **lider**; üyeler mesaj yazar
- [x] **Onaylı grup katılımı** — varsayılan `joinMode: approval`; lider istek kabul/red eder
- [x] **Lider moderasyonu** — üye çıkarma (`kick`); lider ayrılınca liderlik sıradaki üyeye geçer
- [x] **Grup listesi güvenliği** — public liste `GET /api/groups`; Firestore grup metadata yalnızca üyelere
- [x] Grup konumu: TR il/ilçe, AB ülke/şehir + filtreler
- [x] **Canlı mesajlar** — `onSnapshot` ile anında güncelleme
- [x] Son 20 mesaj + eski mesajları yükle (sayfalama)
- [x] Ayarlar (`/ayarlar`) — sohbet gizliliği, **dil**, hesap silme
- [x] Yasaklı kelime filtresi mesajlarda da aktif

### Yasal & Hesap
- [x] Kullanım Koşulları (`/kullanim-kosullari`) TR/EN
- [x] Gizlilik Politikası (`/gizlilik-politikasi`) KVKK uyumlu — veri sorumlusu, özel nitelikli veri, push §9
- [x] Kayıtta sözleşme onay checkbox'ı
- [x] **Hesap silme** — Ayarlar → DELETE onayı → `/api/account/delete`

### Güvenlik
- [x] Firestore: kullanıcı `verificationStatus` self-approve **engellendi**
- [x] **`canReadAudienceContent`** — onaysız kullanıcı yalnızca `audience: all` okur; sahte cinsiyetle kadın içeriği **okuyamaz**
- [x] **Audience kuralları** — onaylı kullanıcıda kadın/erkek hedef kitle SDK bypass edilemez
- [x] **Profil gizliliği** — `users` okuma: yalnızca kendi profil veya onaylı kullanıcılar
- [x] **Yazar bütünlüğü** — `authorGender` / `authorUsername` profille eşleşmek zorunda (`authorIntegrity`)
- [x] **E-posta KVKK** — yeni kayıtlarda email Firestore'a yazılmaz (yalnızca Firebase Auth)
- [x] Gmail ban normalizasyonu (`+alias`, nokta stripping)
- [x] Doğrulama fotoğraf yolu yalnızca `uid` olabilir; onaylı/banlı hesap upload engeli
- [x] İçerik uzunluk limitleri rules'ta (gönderi 2000, yorum 500, mesaj 2000)
- [x] CSP header (middleware)
- [x] Production'da `SESSION_SECRET` yoksa admin/temsilci oturumu reddedilir
- [x] İmzalı admin/temsilci oturum çerezleri (`SESSION_SECRET`)
- [x] API rate limiting (login, upload, check-ban, genel API)
- [x] Middleware güvenlik başlıkları + temsilci API koruması
- [x] `signals` — alıcı (`notifyUids`) + gönderen (`uid`) okuyabilir; yazma kapalı (API Admin SDK)
- [x] `fcm_tokens` — client kapalı; push token yalnızca sunucu
- [x] `reports` — onaylı kullanıcı yazabilir; okuma kapalı (moderasyon ileride)
- [x] `usernames` — benzersiz isim indeksi; client create, update/delete kapalı
- [x] `reps` — client kapalı; admin panelden temsilci (scrypt hash)
- [x] **Grup güvenliği** — `conversations` okuma yalnızca üyeler; istemciden katılma/çıkarma kapalı (`groupJoinAllowed` kaldırıldı)
- [x] **`join_requests`** alt koleksiyonu — client kapalı; katılma istekleri Admin SDK (sunucu API)
- [x] `verification_photos` / `platform_bans` client kapalı
- [x] Middleware — `/api/admin/*` oturum koruması (login/logout hariç)

### UI / UX
- [x] Mobil uyumlu Tailwind tasarım
- [x] Mor Tomris teması + **dayanışma marka ikonu** (`TomrisMark` — üç birleşen daire; maskable PWA)
- [x] **Sade navigasyon** — 4 sekme (Ana Sayfa, Akış, Mesajlar) + **Daha fazla** bottom sheet
- [x] **Boş durum ekranları** — illüstrasyonlu `EmptyState` (akış, inbox, grup, arkadaş, mesaj)
- [x] **Neden Tomris?** — `/neden-biz` (dayanışma, güvenlik, gizlilik, doğrulama açıklaması)
- [x] **iOS ana ekrana ekle** — Safari için 3 adımlık kılavuz (`PwaInstallHint`)
- [x] TR / EN / DE / FR / ES (`src/lib/i18n/`) — DE/FR/ES tam override dosyaları
- [x] Dil seçici: header **🌐 TR** → alttan bottom sheet (`LanguageSheet`) · Ayarlar'da `LanguageSetting`
- [x] Atatürk sözü (giriş/kayıt)
- [x] **Giriş izinleri** — kamera + konum bir kez (`PermissionPrompt`); sonra uğraşmaz
- [ ] **Karanlık mod** — planlandı (`globals.css` placeholder)

### Admin (genel yönetim — doğrulama fotoğrafı yok)
- [x] Ayrı admin girişi (`/admin/giris`)
- [x] **Admin paneli** — Genel bakış (istatistik), Moderasyon (şikayet + yorum/mesaj/gönderi sil), Temsilciler
- [x] **Firestore `reps`** — panelden yeni temsilci; env `REP_*` yedek olarak çalışır
- [x] Doğrulama fotoğraflarına **erişemez** (yalnızca `/temsilci`)

---

## Henüz Yapılmayan / Sırada

| Özellik | Not |
|---------|-----|
| **Vercel deploy** | GitHub hazır — env + deploy: [`DEPLOY.md`](DEPLOY.md) |
| Push: arkadaş isteği | Planlanmış |
| **Karanlık mod** | Planlandı — gece teması |
| Üç parmak selfie UI | i18n hazır — `GenderVerification` bağlanmadı |
| Bildirim merkezi | Planlanmış (uygulama içi sinyal banner + nav rozeti var) |
| Profil fotoğrafı | Planlanmış |
| Analytics | Yok |

---

## Planlanan Özellikler (Yol Haritası)

### Sosyal
- [ ] Gönderiye fotoğraf ekleme
- [ ] Beğeni / etkileşim sayacı

### Acil Durum
- [x] Sinyal gönderme (beta) — `/sinyal`, tüm arkadaşlara kayıt
- [x] **Konum paylaşımı** — tarayıcı GPS izni → lat/lng arkadaşlara kaydedilir (`src/lib/geolocation.ts`)
- [x] **Anlık alıcı bildirimi** — Dashboard / Arkadaşlar / Sinyal sayfasında kırmızı kutu (`IncomingSignalsBanner`, Firestore `onSnapshot`)
- [x] **Sinyal ana navigasyonda** — kırmızı vurgu + gelen sinyal rozeti
- [x] **Sinyal kapatma** — alıcı "Gördüm — kapat" / API `POST /api/signals/[id]/resolve`
- [x] **Harita linki** — alıcı 📍 Haritada aç → Google Maps
- [x] **Sinyal güvenlik onayı** — ilk ziyaret bilgi kutusu (`SignalIntroAck`) + gönderim modalı (`SignalSendConsentModal`); Firestore'da `senderSafetyAck` + kullanıcı `signalSafetyIntroAckAt`
- [x] **112 uyarısı** — gönder/al ekranlarında sabit banner (`SignalSafetyNotice`); dashboard'da dönen popup yok
- [ ] Push: arkadaş isteği

### PWA & Bildirimler
- [x] **PWA Faz 1** — `@serwist/next`, `manifest.json`, 192/512 PNG ikonlar, `/~offline`, dashboard install ipucu — [`PWA.md`](PWA.md)
- [x] **Push: acil sinyal** — FCM + `fcm_tokens` + `PushOptIn`
- [x] **Push: doğrulama onayı, mesaj, yorum** — `/api/push/notify` + onay sonrası tetikleme
- [x] Uygulama içi rozetler (arkadaş isteği + mesaj + sinyal)

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
| `/profil/[username]` | Kullanıcı profili — platform süresi, arkadaş ekle / mesaj |
| `/neden-biz` | Neden Tomris? — dayanışma, güvenlik, gizlilik, doğrulama |
| `/mesajlar` | DM + gruplar (canlı sohbet) |
| `/mesajlar/[id]` | Sohbet ekranı |
| `/ayarlar` | Sohbet gizliliği, dil, hesap silme |
| `/sinyal` | Acil durum sinyali (beta — arkadaşlara) |
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
| **Kadın Temsilci** | `.env` `REP_*` **veya** admin panelden `reps` | Fotoğraf inceleme, onay / red / **kalıcı yasak** |
| **Admin** | `.env` → `ADMIN_USERNAME` / `ADMIN_PASSWORD` | İstatistik, şikayet moderasyonu, temsilci ekleme — **fotoğrafa erişemez** |

---

## Doğrulama Akışı (Soft Gate)

```
Kayıt (fotoğrafsız) → verificationStatus = "unverified" → /dashboard (kısıtlı)
       ↓
İsteğe bağlı /dogrulama → selfie → geçici depolama (local disk veya Firestore)
       ↓
Firestore: verificationStatus = "pending" + verificationSubmittedAt (sunucu)
       ↓
Dashboard + akış (okuma) — turuncu banner + **kuyruk sırası** + kullanabilir/kullanamaz paneli
Yazma / arkadaş / mesaj kapalı (onay sonrası otomatik açılır)
       ↓
Kadın temsilci inceler (/temsilci)
       ↓
Onayla & Sil  →  "approved"  →  tam erişim + **push bildirimi** (izin varsa)
Reddet & Sil  →  "rejected"  →  tekrar /dogrulama
Kalıcı Yasakla → "banned"   →  Auth devre dışı, e-posta + UID ban listesinde (IP ban yok)
       ↓
Fotoğraf silinir — kalıcı kalmaz (disk veya Firestore `verification_photos`)
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
│       ├── verification/upload/  verification/queue/
│       ├── push/register/  push/notify/
│       ├── admin/         # reps, reports, moderation, stats
│       └── temsilci/      # Onay / red / ban API
├── lib/
│   ├── auth-routing.ts    # Soft gate yönlendirme
│   ├── ban/               # Kalıcı yasak servisi
│   ├── posts/             # Gönderi ve yorum servisi
│   ├── locations/         # TR iller/ilçeler + AB ülkeler/şehirler
│   ├── verification/      # local | firestore | firebase storage
│   ├── friends/           # Arkadaşlık servisi
│   ├── i18n/              # TR / EN / DE / FR / ES
│   └── security/
│       ├── validate.ts
│       └── content-filter.ts  # Yasaklı kelime listesi
├── components/
│   ├── posts/             # PostComposer, PostCard, PostFilters
│   ├── AuthorGenderBadge.tsx
│   ├── LanguageSheet.tsx
│   ├── LanguageSwitcher.tsx
│   ├── settings/LanguageSetting.tsx
│   ├── VerificationStatusBanner.tsx
│   ├── VerificationGate.tsx
│   ├── VerificationIntro.tsx
│   └── ...
└── middleware.ts            # /admin ve /temsilci koruması

data/verifications/          # Local geçici fotoğraflar (git'e girmez)
firestore.rules              # users, friendships, posts, verification_photos...
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
| `signals` | Herkes yazabilir | Client yazma kapalı; okuma: `notifyUids` **veya** gönderen `uid` |
| `fcm_tokens` | Yok | Client kapalı — yalnızca Admin SDK (push) |
| `verification_photos` | Yok | Client kapalı — yalnızca Admin SDK (Vercel selfie) |
| `posts` read | Her giriş yapan okur | **Hedef kitle (`audience`) rules'ta zorunlu** |
| `posts` create | `authorGender` serbest | **`authorGender` + `authorUsername` = profil** |
| `users` create | Email alanı serbest | **`email` alanı yasak** (KVKK) |
| `users` pending foto | Her path kabul | **`verificationPhotoPath == uid`** |

### Güvenlik sıkılaştırması — 7 Temmuz 2026

**Firestore rules (`firestore.rules`) — Console'da yeniden Publish et:**

| Kapatılan açık | Nasıl |
|----------------|--------|
| Kadınlara özel gönderi SDK okuma | `canViewAudience()` — erkek `kadin` audience okuyamaz |
| Sahte ♀ rozeti | `authorGender == me().gender` zorunlu |
| Sahte kullanıcı adı | `authorUsername == me().username` zorunlu |
| Sahte arkadaşlık isteği | `fromUsername` / `toUsername` profille eşleşmeli |
| Sahte pending doğrulama | `verificationPhotoPath` yalnızca `uid` |
| E-posta Firestore sızıntısı | Yeni kayıtlarda `email` yazılmaz |

**Uygulama kodu:**

| Dosya | Değişiklik |
|-------|------------|
| `src/lib/ban/service.ts` | Gmail normalizasyonu; ban e-postası Auth'tan |
| `src/lib/auth-helpers.ts` | Profilde email yok; check-ban `{ allowed }` |
| `src/app/api/verification/upload` | Onaylı/banlı upload engeli |
| `src/app/api/signals/send` | Küfür filtresi |
| `src/lib/auth/session-edge.ts` | Production'da secret zorunlu |
| `src/middleware.ts` | CSP header |
| `src/lib/account/delete-service.ts` | Signals temizliği |
| `scripts/strip-public-emails.mjs` | Eski hesaplardan email silme |

**Eski hesaplar (bir kez):**
```bash
npm run strip:emails
```

**Rules test:**
```bash
npm run test:rules
```

**Bilinçli kalan (ileri seviye):** Küfür filtresi SDK bypass (Cloud Function gerekir), rate limit bellek içi (Vercel'de Upstash önerilir), username benzersizliği (Admin SDK kayıt API).

### Console'da Publish görünmüyorsa

Solda **⭐ işaretli sürüm** zaten yayında demektir. Publish yalnızca editörde **değişiklik yaptığında** çıkar. **Deploy** diye bir buton yok — adı **Publish**.

### Console'a doğru yükleme (3 adım)

1. Bu repodaki [`firestore.rules`](firestore.rules) dosyasını aç — **tüm içeriği** kopyala
2. Firebase Console → TomrisApp → **Firestore Database** → **Rules**
3. Editörü temizle → yapıştır → **Publish**

Doğru sürümde şu satırlar **mutlaka** görünmeli:

```
function userSelfUpdateAllowed() { ... }
function canViewAudience() { ... }
function authorIntegrity() { ... }
function me() { ... }
function lastMessageUpdateAllowed() { ... }
match /conversations/{conversationId} {
  allow read: if isSignedIn() &&
    request.auth.uid in resource.data.participantUids;
  ...
  match /join_requests/{requestUid} {
    allow read, write: if false;
  }
}
match /signals/{signalId} {
  allow read: if isSignedIn() &&
    (request.auth.uid in resource.data.notifyUids ||
     resource.data.uid == request.auth.uid);
  allow write: if false;
}
match /fcm_tokens/{tokenId} {
  allow read, write: if false;
}
match /verification_photos/{uid} {
  allow read, write: if false;
}
!('email' in request.resource.data)   // users create içinde
```

Eski sürümde `allow update: if isOwner(userId);` veya `verification_photos` bloğu yoksa — **yanlış rules yayında**, hemen `firestore.rules` ile değiştir.

### Index (mesajlar hatası)

Rules'tan ayrı: `/mesajlar` için [`firestore.indexes.json`](firestore.indexes.json) index'leri Console'da oluştur. Detay: [`FIREBASE-KURULUM.md`](FIREBASE-KURULUM.md).

---

## Firestore Koleksiyonları

### `users`

```typescript
{
  uid: string;
  username: string;
  /** Yalnızca Firebase Auth — Firestore'a yeni kayıtta yazılmaz (KVKK) */
  email?: string;
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

### `verification_photos` (yalnızca sunucu — Admin SDK, Vercel)

```typescript
{
  image: Buffer;           // JPEG, ~500KB altı
  contentType: "image/jpeg";
  createdAt: string;
}
```

Onay / red / ban / hesap silme sonrası belge silinir. Client erişemez.

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

# Push — Firebase Console > Cloud Messaging > Web Push certificates
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Admin (genel yönetim — fotoğraf erişimi yok)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=

# Kadın temsilci (fotoğraf onay / red / yasak) — veya admin panelden Firestore reps
REP_USERNAME=temsilci
REP_PASSWORD=

# Oturum imzası (admin/temsilci — production zorunlu)
SESSION_SECRET=

# Service Account — Firebase Console > Service Accounts > private key
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...tek satır...}

# local = disk (npm run dev / VPS) | firestore = Firestore (Vercel/Spark) | firebase = Storage (Blaze)
VERIFICATION_PHOTO_STORAGE=local
```

> ⚠️ `.env.local` ve indirilen JSON dosyasını asla Git'e commit etme.

---

## Güvenlik

- Firestore kuralları: audience, yazar bütünlüğü, metin uzunluğu — [`firestore.rules`](firestore.rules)
- E-posta yalnızca Firebase Auth'ta; dashboard `user.email` gösterir
- Doğrulama fotoğrafları: local disk veya Firestore `verification_photos` — client erişemez
- Fotoğraf API'si yalnızca **temsilci oturumu** ile (`isRepSession`) — admin erişemez
- Onay / red / yasak sonrası fotoğraf silinir
- Kalıcı yasak: Firebase Auth `disabled: true` + Gmail-normalize e-posta/UID ban listesi
- İçerik filtresi: `src/lib/security/content-filter.ts` — kayıt, gönderi, yorum, sinyal, grup başlığı
- CSP + X-Frame-Options + nosniff: `src/middleware.ts`
- Input doğrulama: `src/lib/security/validate.ts`
- Şifre temsilciye veya Firestore'a **asla** yazılmaz
- Eski Firestore email temizliği: `npm run strip:emails`

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

1. ⏳ **Vercel deploy** — [`DEPLOY.md`](DEPLOY.md) + tüm env (VAPID dahil)
2. ⏳ Firebase Console → **Rules Publish** (`reps` bloğu)
3. ⏳ Local/production test: PWA + push (onay, mesaj, yorum, sinyal)
4. Üç parmak doğrulama selfie UI (metinler hazır)
5. ⚪ İsteğe bağlı: `comments` composite index (yorum hatası alırsan)

---

## Oturum Notu — 6–7 Temmuz 2026

> Bugünlük kapanış özeti. Yarın buradan devam.

### Bu oturumda yapılanlar

**Spark / Vercel (0 TL canlı deploy yolu)**
- Doğrulama selfie'leri Vercel için **Firestore** `verification_photos/{uid}` — Blaze / kart gerekmez
- Local'de disk: `data/verifications/` (`VERIFICATION_PHOTO_STORAGE=local`)
- `src/lib/verification/firestore-storage.ts`, sıkıştırma, upload route güncellendi
- [`DEPLOY.md`](DEPLOY.md) Vercel + Spark yolu olarak yeniden yazıldı

**Firebase Firestore Rules**
- Repodaki `firestore.rules` = Console'daki sürüm (**güncel, yayında**)
- `verification_photos` → `allow read, write: if false` (yalnızca Admin SDK)
- Publish görünmüyorsa normal: ⭐ işaretli sürüm zaten aktif; Deploy diye buton yok

**5 dil (TR / EN / DE / FR / ES)**
- `src/lib/i18n/locales/*-overrides.ts` — tam çeviriler
- Dil seçici: header 🌐 → **alttan bottom sheet** (`LanguageSheet`)
- Ayarlar → Dil bölümü (`LanguageSetting`)

**UX**
- Akışta cinsiyet: **♀ / ♂ rozeti** — "Kadın/Erkek" metni kaldırıldı
- Filtreler: "Kadın üyeler / Erkek üyeler"

**Git**
- Son push: **`5b5b9ff`** — master, GitHub ile senkron
- Yanlışlıkla silinen local dosyalar `git restore .` ile geri alındı

### Doğrulandı / tamam sayılan

| Madde | Durum |
|-------|--------|
| Firestore rules (Console) | ✅ `verification_photos` en altta görüldü |
| Firestore indexes | ✅ Enabled |
| GitHub kod | ✅ `5b5b9ff` |
| Blaze / Storage | ❌ Bilerek yapılmadı |

### Yarın / sonraki oturum

1. `npm run dev` → local uçtan uca test (kayıt → selfie → temsilci onay → akış)
2. **Vercel deploy** — repo bağla, env:
   - `VERIFICATION_PHOTO_STORAGE=firestore`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`, `SESSION_SECRET`, `NEXT_PUBLIC_FIREBASE_*`
   - Storage bucket **gerekmez**
3. Canlıda 2–3 kişiyle gerçek test

### Bilinçli olarak ertelenen

- Push bildirimleri, tam PWA, bildirim merkezi
- Profil fotoğrafı, gönderiye fotoğraf, beğeni
- Sinyal push bildirimi (uygulama içi anlık banner var)
- Admin moderasyon araçları genişletme

### Hızlı komutlar

```bash
npm run dev                    # local
npm run backfill:usernames     # mevcut hesaplar için isim indeksi (bir kez)
npm run strip:emails           # eski Firestore email temizliği (bir kez)
npm run test:rules             # Firestore rules test (emulator)
# Vercel: DEPLOY.md oku
```

**Durum cümlesi:** Kod + Firebase hazır; site yalnızca local'de. Canlı = Vercel deploy.

---

## Oturum Notu — 7 Temmuz 2026 (güvenlik)

### Yapılanlar
- Firestore rules sıkılaştırıldı: audience, authorIntegrity, email yasağı, uid foto path
- E-posta Firestore'dan çıkarıldı (yeni kayıtlar); `npm run strip:emails` eski hesaplar için
- Gmail ban bypass kapatıldı; check-ban enumerasyonu azaltıldı
- Upload/signals/session/CSP/delete-service yamaları
- Rules test suite güncellendi (`npm run test:rules`)

### Senin yapman gereken
1. Firebase Console → **Rules Publish** (yeni `firestore.rules`)
2. `npm run strip:emails` (eski kullanıcılar varsa)
3. Local test → Vercel deploy

---

## Oturum Notu — 7 Temmuz 2026 (arama, Türkçe, sinyal konumu)

### Yapılanlar
- **Kullanıcı arama önerileri** — `UsernameSearchInput`, prefix sorgusu; Arkadaşlar + Yeni DM
- **Türkçe kullanıcı adı** — ç/ğ/ı/ö/ş/ü + `toLocaleLowerCase('tr-TR')`
- **Acil sinyal konumu** — GPS ile gönderim; arkadaşlarda anlık kırmızı banner + harita linki
- **5 dil** — arama, sinyal ve konum metinleri TR/EN/DE/FR/ES
- Firestore: `signals` okuma (`notifyUids`), `signals` composite index

### Senin yapman gereken
1. Firebase Console → **Rules Publish** (`signals` okuma kuralı)
2. Firebase Console → **Indexes** — `signals` (notifyUids + status + createdAt) etkinleştir
3. İki hesapla test: arkadaş ol → sinyal gönder → konum izni ver → diğer hesapta banner + harita

---

## Oturum Notu — 7 Temmuz 2026 (güvenlik denetimi düzeltmeleri)

### Yapılanlar (kritik güvenlik + UX)
1. **`canReadAudienceContent`** — onaysız kullanıcı kadın/erkek gönderileri okuyamaz (sahte cinsiyet açığı kapatıldı)
2. **`usernames` koleksiyonu** — benzersiz kullanıcı adı; `npm run backfill:usernames`
3. **`users` okuma kısıtı** — yalnızca kendi profil veya onaylı kullanıcılar
4. **Şikayet/raporlama** — `ReportButton`, `reports` rules
5. **Sinyal UX** — ana nav, rozet, kapatma API'si
6. **Engelleme** — engellenen kullanıcı gönderileri akıştan filtrelenir

### Firestore rules — Console'a yapıştırılacak tam sürüm
Repodaki [`firestore.rules`](firestore.rules) = güncel. İçermesi gerekenler:
- `canReadAudienceContent()`
- `match /usernames/{username}`
- `match /reports/{reportId}`
- `match /signals` → okuma `notifyUids`, yazma kapalı

### Senin yapman gereken
1. Firebase Console → **Rules Publish** (tam sürüm)
2. Firebase Console → **Indexes** — `signals`: notifyUids + status + createdAt
3. `npm run backfill:usernames`

---

## Oturum Notu — 7 Temmuz 2026 (PWA, push, sinyal onayı)

### Yapılanlar
- **PWA Faz 1** — `@serwist/next`, service worker, offline sayfa, PNG ikonlar (`npm run icons:pwa`), dashboard install ipucu
- **Push (acil sinyal)** — FCM token kaydı (`/api/push/register`), sinyal gönderiminde `sendSignalPush`, `PushOptIn` modal
- **Sinyal hukuki onay** — `SignalIntroAck` (ilk ziyaret, sunucu kaydı), `SignalSendConsentModal` (her gönderim checkbox), `ActiveSignalReminder`
- **Firestore** — `signals` okuma: gönderen + alıcı; `fcm_tokens` client kapalı; 7 composite index
- **Koşullar / i18n** — sinyal güvenlik metinleri; dashboard dönen uyarı yok (moment-of-action consent)

### Senin yapman gereken
1. Firebase Console → **Rules Publish** + **Indexes** (7/7 Enabled) — ✅ tamamlandıysa atla
2. `.env.local` + Vercel → `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
3. `npm run build && npm start` ile PWA test (dev'de SW kapalı)
4. 2 hesap: bildirim izni → sinyal → push + banner

### Bilinçli ertelenen
- Push: mesaj, arkadaş isteği, yorum
- Üç parmak selfie UI (i18n hazır, component bağlanmadı)
- Bildirim merkezi (🔔)

---

## Oturum Notu — 7 Temmuz 2026 (marka dili)

### Yapılanlar
- **Marka repositioning** — “kadına şiddet” sloganı kaldırıldı; vitrin: **kadın dayanışma platformu** (kadın vurgusu açık)
- **5 dil** — `brand.tagline`, giriş/kayıt `subtitle`, içerik filtresi kullanıcı mesajları (TR/EN/DE/FR/ES)
- **manifest.json** + `layout.tsx` meta description güncellendi
- Instagram / sosyal medya ile hizalı ton: korku değil dayanışma

### Dokunulmayanlar
- Kullanım koşulları / gizlilik (hukuki metinler)
- Sinyal, 112, doğrulama güvenlik katmanı
- `content-filter.ts` kelime listesi (sadece UI mesajları yumuşatıldı)

---

## Oturum Notu — 8 Temmuz 2026 (onboarding, admin, push genişletme)

### Yapılanlar
- **Onboarding checklist** — dashboard 4 adım (`OnboardingChecklist`)
- **KVKK** — doğrulama checkbox; gizlilik §6–§9 (push dahil)
- **Doğrulama UX** — kullanabilir/kullanamaz paneli; kuyruk sırası (`verificationSubmittedAt`, `/api/verification/queue`)
- **Admin panel** — istatistik, şikayet moderasyonu (yorum/mesaj/gönderi sil), Firestore `reps` temsilci ekleme
- **Push** — doğrulama onayı, yeni mesaj, gönderiye yorum (+ mevcut sinyal)
- **Firestore rules** — `match /reps/{repId}` client kapalı

### Senin yapman gereken
1. Firebase Console → **Rules Publish** (`reps` en altta)
2. `.env.local` + Vercel → `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
3. Admin → Temsilciler'den ilk Firestore temsilcisi (veya env `REP_*`)
4. ⚪ Yorum index hatası alırsan → `comments`: postId + createdAt
5. Vercel deploy

---

## Oturum Notu — 8 Temmuz 2026 (gruplar, profil süresi)

### Yapılanlar
- **Onaylı grup katılımı** — varsayılan `joinMode: approval`; lider kabul/red (`GroupLeaderPanel`)
- **Lider moderasyonu** — üye çıkarma; lider ayrılınca liderlik sıradaki üyeye devredilir
- **Grup metadata gizliliği** — Firestore grup doc yalnızca üyeler okur; public liste `GET /api/groups`
- **Katılma istekleri** — `conversations/{id}/join_requests` (Admin SDK); istemci yazamaz
- **Profil ziyareti** — `/profil/[username]`; Reddit tarzı **"N gündür Tomris'te"** (`memberSinceDays`)
- **Arama/lookup** — kullanıcı önerilerinde ve profil API'de süre bilgisi

### Yeni API rotaları
- `GET /api/groups` · `POST /api/groups/[id]/join`
- `GET /api/groups/[id]/join-requests` · `approve` / `reject`
- `POST /api/groups/[id]/members/[uid]/kick` · `POST .../leave`
- `GET /api/users/profile`

### Senin yapman gereken
1. Firebase Console → **Rules Publish** — `groupJoinAllowed` **olmamalı**; `join_requests` client kapalı olmalı
2. İki hesapla test: grup kur → istek gönder → lider onayla → mesaj; lider üye çıkarsın
3. `/profil/kullaniciadi` — süre metnini kontrol et
4. Vercel deploy (env aynı)

---

## Oturum Notu — 8 Temmuz 2026 (UI 8.5+ cilası)

### Yapılanlar
- **Marka ikonu** — `TomrisMark` (üç daire dayanışma); `icon.svg` + maskable PWA PNG'ler (`npm run icons:pwa`)
- **Nav sadeleştirme** — 4 sekme + **Daha fazla** sheet (`NavMoreSheet`): Arkadaşlar, Sinyal, Neden Tomris?, Ayarlar
- **Boş durumlar** — `EmptyState` bileşeni; akış, inbox, grup, arkadaş, thread
- **iOS PWA** — Safari ana ekrana ekle 3 adım (`PwaInstallHint`)
- **Neden Tomris?** — `/neden-biz` sayfası (4 sütun + doğrulama + karanlık mod yakında notu)

### Senin yapman gereken
1. iPhone Safari → Dashboard → ana ekrana ekle metnini kontrol et
2. Nav → Daha fazla → Neden Tomris?
3. Boş akış / boş sohbet görünümü
4. Vercel deploy
