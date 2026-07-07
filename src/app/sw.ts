import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

type PushPayload = {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  notification?: { title?: string; body?: string };
  data?: { url?: string; type?: string };
};

function parsePushPayload(raw: PushEvent): PushPayload {
  if (!raw.data) return {};
  try {
    return raw.data.json() as PushPayload;
  } catch {
    return { body: raw.data.text() };
  }
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  const title = payload.title ?? payload.notification?.title ?? "Tomris";
  const body = payload.body ?? payload.notification?.body ?? "";
  const url = payload.url ?? payload.data?.url ?? "/sinyal";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
      tag: payload.tag ?? payload.data?.type ?? "tomris",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data?.url as string | undefined) ?? "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus().then(() => {
            if ("navigate" in client && typeof client.navigate === "function") {
              return client.navigate(url);
            }
            return undefined;
          });
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
