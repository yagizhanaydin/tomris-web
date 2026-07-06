/** Basit bellek içi rate limit — tek sunucu / Spark plan için yeterli. */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec?: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= maxRequests) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function rateLimitResponse(retryAfterSec: number) {
  return new Response(
    JSON.stringify({
      error: "Çok fazla istek. Lütfen bir süre bekleyin.",
      retryAfter: retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}
