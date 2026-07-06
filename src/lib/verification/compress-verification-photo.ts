import { FIRESTORE_PHOTO_MAX_BYTES } from "./firestore-storage";

const JPEG_SOI = Buffer.from([0xff, 0xd8]);
const JPEG_EOI = Buffer.from([0xff, 0xd9]);

/** Basit JPEG doğrulama — ek bağımlılık olmadan boyut kontrolü */
export function assertValidJpeg(buffer: Buffer): void {
  if (buffer.length < 4) {
    throw new Error("Geçersiz fotoğraf dosyası.");
  }
  if (!buffer.subarray(0, 2).equals(JPEG_SOI)) {
    throw new Error("Yalnızca JPEG fotoğraflar kabul edilir.");
  }
  if (!buffer.subarray(buffer.length - 2).equals(JPEG_EOI)) {
    throw new Error("Geçersiz JPEG dosyası.");
  }
}

export function prepareVerificationPhoto(buffer: Buffer): Buffer {
  assertValidJpeg(buffer);
  if (buffer.length > FIRESTORE_PHOTO_MAX_BYTES) {
    throw new Error(
      `Fotoğraf çok büyük (max ${Math.round(FIRESTORE_PHOTO_MAX_BYTES / 1024)}KB). Lütfen daha yakından tekrar çekin.`
    );
  }
  return buffer;
}
