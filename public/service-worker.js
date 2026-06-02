const CACHE_NAME = "groen-v6";
const APP_SHELL_ASSETS = [
  "/manifest.json",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

function shouldCacheResponse(response) {
  return response && response.ok && response.type !== "opaqueredirect";
}

function isStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_expo/static/") ||
      url.pathname.startsWith("/fonts/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname === "/apple-touch-icon.png" ||
      url.pathname === "/favicon.ico" ||
      url.pathname === "/manifest.json")
  );
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (shouldCacheResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || cache.match("/");
  }
}

async function navigationNetworkFirst(request) {
  try {
    const freshRequest = new Request(request, { cache: "no-store" });
    return await fetch(freshRequest);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (
      (await cache.match(request)) ||
      (await cache.match("/index.html")) ||
      (await cache.match("/")) ||
      new Response("Groene Vingers is offline.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (shouldCacheResponse(response)) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
