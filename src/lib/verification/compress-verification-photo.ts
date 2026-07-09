import { FIRESTORE_PHOTO_MAX_BYTES } from "./firestore-storage";

const JPEG_SOI = Buffer.from([0xff, 0xd8]);

function assertJpegHeader(buffer: Buffer): void {
  if (buffer.length < 4 || !buffer.subarray(0, 2).equals(JPEG_SOI)) {
    throw new Error("Yalnızca JPEG fotoğraflar kabul edilir.");
  }
}

/** Firestore için sıkıştır — yalnızca local/VPS; Vercel'de sharp kullanılmaz */
export async function prepareVerificationPhoto(buffer: Buffer): Promise<Buffer> {
  assertJpegHeader(buffer);

  if (buffer.length <= FIRESTORE_PHOTO_MAX_BYTES) {
    return buffer;
  }

  // Vercel serverless: sharp native modülü sık çöker — client sıkıştırmaya güven
  if (process.env.VERCEL === "1") {
    throw new Error(
      `Fotoğraf çok büyük (${Math.round(buffer.length / 1024)}KB, max ${Math.round(FIRESTORE_PHOTO_MAX_BYTES / 1024)}KB). Tekrar çekin.`
    );
  }

  try {
    const sharp = (await import("sharp")).default;
    let quality = 80;
    let width = 960;
    let output = buffer;

    for (let attempt = 0; attempt < 10; attempt++) {
      output = await sharp(buffer)
        .rotate()
        .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();

      if (output.length <= FIRESTORE_PHOTO_MAX_BYTES) {
        return output;
      }

      if (quality > 45) {
        quality -= 7;
      } else if (width > 480) {
        width = Math.round(width * 0.75);
        quality = 72;
      } else {
        break;
      }
    }

    if (output.length > FIRESTORE_PHOTO_MAX_BYTES) {
      throw new Error(
        `Fotoğraf çok büyük (max ${Math.round(FIRESTORE_PHOTO_MAX_BYTES / 1024)}KB). Lütfen daha yakından tekrar çekin.`
      );
    }

    return output;
  } catch (err) {
    if (buffer.length <= FIRESTORE_PHOTO_MAX_BYTES) {
      return buffer;
    }
    const detail = err instanceof Error ? err.message : "sharp modülü yüklenemedi";
    throw new Error(`Fotoğraf sıkıştırılamadı (sharp): ${detail}`);
  }
}
