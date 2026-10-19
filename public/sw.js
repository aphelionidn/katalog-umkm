const CACHE_NAME = "katalog-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Tahap Install: cache aset statis penting
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

// Tahap Activate: bersihkan cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Tahap Fetch: Network-first untuk menjaga kebaruan data server Supabase
self.addEventListener("fetch", (event) => {
  // Hanya proses request GET yang berasal dari protokol HTTP/HTTPS
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  // Lewatkan request admin atau request API Supabase tanpa dicegat
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/admin") || url.hostname.includes("supabase.co")) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

