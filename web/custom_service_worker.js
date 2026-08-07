'use strict';

// Change this version string every deploy to trigger an update.
// The build script will replace this automatically.
const CACHE_VERSION = 'talloc-v1';
const CACHE_NAME = `flutter-app-${CACHE_VERSION}`;

// Files to cache for offline use
const RESOURCES_TO_CACHE = [
  '/',
  '/talloc/',
  '/talloc/index.html',
  '/talloc/main.dart.js',
  '/talloc/flutter_bootstrap.js',
  '/talloc/flutter.js',
  '/talloc/manifest.json',
  '/talloc/favicon.png',
  '/talloc/icons/Icon-192.png',
  '/talloc/icons/Icon-512.png',
];

// Install: cache core resources
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RESOURCES_TO_CACHE);
    })
  );
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first strategy for navigation, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // For navigation requests (HTML pages): network first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update the cache with the fresh response
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For other requests: network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
