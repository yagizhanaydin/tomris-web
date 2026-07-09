import sharp from "sharp";
import { FIRESTORE_PHOTO_MAX_BYTES } from "./firestore-storage";

const JPEG_SOI = Buffer.from([0xff, 0xd8]);

function assertJpegHeader(buffer: Buffer): void {
  if (buffer.length < 4 || !buffer.subarray(0, 2).equals(JPEG_SOI)) {
    throw new Error("Yalnızca JPEG fotoğraflar kabul edilir.");
  }
}

/** Firestore için sıkıştır — Vercel/canlı ortamda büyük webcam fotoğrafları */
export async function prepareVerificationPhoto(buffer: Buffer): Promise<Buffer> {
  assertJpegHeader(buffer);

  if (buffer.length <= FIRESTORE_PHOTO_MAX_BYTES) {
    return buffer;
  }

  let quality = 82;
  let width = 1280;
  let output = buffer;

  for (let attempt = 0; attempt < 8; attempt++) {
    output = await sharp(buffer)
      .rotate()
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (output.length <= FIRESTORE_PHOTO_MAX_BYTES) {
      return output;
    }

    if (quality > 50) {
      quality -= 8;
    } else if (width > 640) {
      width = Math.round(width * 0.75);
      quality = 78;
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
}
