/** Firestore geçici belge limiti (~480KB) — tarayıcıda güvenli JPEG boyutu */
export const CLIENT_VERIFICATION_JPEG_TARGET_BYTES = 400_000;

const JPEG_QUALITIES = [0.62, 0.52, 0.42, 0.32, 0.24] as const;

function blobFromCanvas(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

function scaleCanvas(source: HTMLCanvasElement, maxDim: number): HTMLCanvasElement {
  let w = source.width;
  let h = source.height;
  if (w <= maxDim && h <= maxDim) return source;

  const ratio = maxDim / Math.max(w, h);
  w = Math.max(1, Math.round(w * ratio));
  h = Math.max(1, Math.round(h * ratio));

  const scaled = document.createElement("canvas");
  scaled.width = w;
  scaled.height = h;
  const ctx = scaled.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(source, 0, 0, w, h);
  return scaled;
}

/** Webcam canvas → Firestore'a sığacak JPEG (sharp/sunucu sıkıştırması gerekmez) */
export async function canvasToVerificationJpeg(
  canvas: HTMLCanvasElement,
  maxBytes = CLIENT_VERIFICATION_JPEG_TARGET_BYTES
): Promise<Blob> {
  for (const maxDim of [640, 480, 360]) {
    const target = scaleCanvas(canvas, maxDim);

    for (const quality of JPEG_QUALITIES) {
      const blob = await blobFromCanvas(target, quality);
      if (blob && blob.size <= maxBytes) return blob;
    }
  }

  const fallback = await blobFromCanvas(scaleCanvas(canvas, 320), 0.2);
  if (fallback) return fallback;

  throw new Error("Fotoğraf sıkıştırılamadı.");
}
