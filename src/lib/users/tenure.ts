/** Reddit-style: whole days since account creation (UTC calendar days). */
export function daysOnPlatform(createdAt: string | undefined | null, now = new Date()): number {
  if (!createdAt) return 0;
  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) return 0;

  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = Math.floor((nowUtc - startUtc) / (24 * 60 * 60 * 1000));
  return Math.max(0, diff);
}
