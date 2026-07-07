const STORAGE_KEY = "tomris-permissions-v1";

export type PermissionResult = {
  camera: boolean;
  location: boolean;
};

export function permissionsAlreadyHandled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function markPermissionsHandled(): void {
  localStorage.setItem(STORAGE_KEY, "1");
}

export async function requestCameraPermission(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export async function requestLocationPermission(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return false;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  });
}

export async function requestTomrisPermissions(): Promise<PermissionResult> {
  const camera = await requestCameraPermission();
  const location = await requestLocationPermission();
  return { camera, location };
}
