# Doğrulama Fotoğrafı Akışı

Fotoğraflar **kalıcı tutulmaz**. Sunucuda geçici klasörde durur, temsilci karar verince silinir.

> **Firebase Storage gerekmez** — Ücretsiz Spark planında çalışır. Blaze / faturalandırma yok.

## Akış

```
Kayıt → Kamera selfie → Sunucu: data/verifications/{uid}.jpg (git'e girmez)
                              ↓
                    Firestore: verificationStatus = "pending"
                              ↓
              Temsilci paneli (/temsilci) — korumalı API ile fotoğraf görür
                              ↓
            ┌─────────────────┴─────────────────┐
       ONAYLA & SİL                      REDDET & SİL
            ↓                                  ↓
  genderVerified: true              genderVerified: false
  dosya sunucudan silinir           dosya sunucudan silinir
```

## Temsilci ne görür?

- Kullanıcı adı (@ceyda)
- Beyan edilen cinsiyet (Kadın/Erkek)
- Fotoğraf (eşleşiyor mu diye bakar)

**Görmez:** şifre, e-posta

## Kurulum

1. Firestore + Auth (Spark plan yeterli)
2. **Storage açmana gerek yok**
3. Service Account indir → `.env.local`:
   ```env
   REP_USERNAME=temsilci
   REP_PASSWORD=guclu_sifre
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```

## Güvenlik

- Fotoğraflar `data/verifications/` — `.gitignore`'da, dışarıdan erişilemez
- Temsilci fotoğrafı sadece oturum açıkken API'den alır (`/api/temsilci/verifications/{uid}/photo`)
- Onay/red sonrası dosya diskten silinir

## Not (canlıya alırken)

Vercel gibi serverless ortamlarda disk geçicidir. Çok kullanıcı olunca Storage veya VPS düşünürsün — başta 10–50 kişi için `npm run dev` / kendi sunucun yeterli.
