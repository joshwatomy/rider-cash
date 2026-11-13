const CACHE = "rider-cash-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Serve from cache first so the app opens instantly and offline; refresh the copy in the background.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const key = e.request.mode === "navigate" ? "./" : e.request;
      const hit = await cache.match(key);
      const fresh = fetch(e.request).then((res) => {
        if (res && (res.ok || res.type === "opaque")) cache.put(key, res.clone());
        return res;
      }).catch(() => hit);
      return hit || fresh;
    })
  );
});
