import type { SignalLocation } from "@/types/signal";

export async function getCurrentPosition(timeoutMs = 10000): Promise<SignalLocation | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30_000 }
    );
  });
}

export function mapsUrl(location: SignalLocation): string {
  return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
}

export function isValidSignalLocation(value: unknown): value is SignalLocation {
  if (!value || typeof value !== "object") return false;
  const loc = value as SignalLocation;
  return (
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    loc.lat >= -90 &&
    loc.lat <= 90 &&
    loc.lng >= -180 &&
    loc.lng <= 180 &&
    (loc.accuracy === undefined || (typeof loc.accuracy === "number" && loc.accuracy >= 0))
  );
}
