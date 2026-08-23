/**
 * Serves the service worker from /sw.js. The script is generated at build
 * time with a per-build version so a new deploy always installs a fresh
 * worker and drops the previous cache.
 *
 * Strategy (deliberately simple and conservative):
 *  - navigations:      network-first, fall back to the cached page (or "/")
 *  - /_next/static/*:  cache-first (content-hashed, immutable)
 *  - icons/manifest:   cache-first
 *  - RSC payloads:     never cached (pass-through)
 *  - everything else:  network, cache as fallback
 */

export const dynamic = "force-static";

const BUILD_VERSION =
  process.env.NEXT_PUBLIC_BUILD_VERSION ??
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
  String(Date.now());

function source(version: string): string {
  return `/* MalluImposter service worker — build ${version} */
const VERSION = ${JSON.stringify(version)};
const CACHE = "malluimposter-" + VERSION;
const PRECACHE = [
  "/",
  "/game",
  "/how-to-play",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];
const MAX_RUNTIME_ENTRIES = 120;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("malluimposter-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname)
  );
}

async function trim(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_RUNTIME_ENTRIES) return;
  const excess = keys.length - MAX_RUNTIME_ENTRIES;
  for (let i = 0; i < excess; i++) {
    const key = keys[i];
    if (PRECACHE.includes(new URL(key.url).pathname)) continue;
    await cache.delete(key);
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
    trim(cache);
  }
  return response;
}

async function networkFirstPage(request, pathname) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(pathname, response.clone());
    return response;
  } catch (error) {
    const cached = (await cache.match(pathname)) || (await cache.match("/"));
    if (cached) return cached;
    throw error;
  }
}

async function networkWithCacheFallback(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
      trim(cache);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache React Server Component payloads or the worker itself.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1" || url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request, url.pathname));
    return;
  }
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(networkWithCacheFallback(request));
});
`;
}

export function GET() {
  return new Response(source(BUILD_VERSION), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
