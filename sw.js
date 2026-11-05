/* Inkpane service worker: cache-first for the app shell, versioned cache.
   Bump CACHE_VERSION (and VERSION in js/app.js) on every release: the browser sees a changed sw.js,
   installs the new cache in the background and the next reload serves the new files. */
const CACHE_VERSION = "1.0.0";
const CACHE = "inkpane-" + CACHE_VERSION;

const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/fonts.css",
  "css/app.css",
  "js/i18n.js",
  "js/app.js",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "vendor/pdfjs-3.11.174/pdf.min.js",
  "vendor/pdfjs-3.11.174/pdf.worker.min.js",
  "vendor/pdf-lib-1.17.1/pdf-lib.min.js",
  ...["FoxitDingbats.pfb", "FoxitFixed.pfb", "FoxitFixedBold.pfb", "FoxitFixedBoldItalic.pfb", "FoxitFixedItalic.pfb",
    "FoxitSerif.pfb", "FoxitSerifBold.pfb", "FoxitSerifBoldItalic.pfb", "FoxitSerifItalic.pfb", "FoxitSymbol.pfb",
    "LiberationSans-Bold.ttf", "LiberationSans-BoldItalic.ttf", "LiberationSans-Italic.ttf", "LiberationSans-Regular.ttf"]
    .map(f => "vendor/pdfjs-3.11.174/standard_fonts/" + f),
  ...["bricolage-grotesque-latin-600", "bricolage-grotesque-latin-ext-600",
    "ibm-plex-sans-latin-400", "ibm-plex-sans-latin-ext-400", "ibm-plex-sans-latin-500", "ibm-plex-sans-latin-ext-500",
    "ibm-plex-sans-latin-600", "ibm-plex-sans-latin-ext-600",
    "ibm-plex-mono-latin-400", "ibm-plex-mono-latin-ext-400", "ibm-plex-mono-latin-500", "ibm-plex-mono-latin-ext-500"]
    .map(f => "vendor/fonts/" + f + "-normal.woff2"),
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("inkpane-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations (start_url, "?source=pwa", file-handler launches) always get the cached shell.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("index.html", { cacheName: CACHE }).then(hit => hit || fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req, { cacheName: CACHE, ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
