const CACHE_NAME = 'afinancecalc-v36-cache';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './contact.html',
  './about.html',
  './css/styles.css',
  './css/terminal.css',
  './css/noir.css',
  './css/cinematic.css',
  './css/lender-context.css',
  './css/afc-nerd.css',
  './css/afc-rates.css',
  './css/infographics.css',
  './css/usage-illustrations.css',
  './css/tailwind.min.css',
  './js/banking_data.js',
  './js/mechanics.js',
  './js/afc-verticals.js',
  './js/wallet-news.js',
  './js/afc-rates-board.js',
  './js/afc-card-compare.js',
  './js/high-traffic-calcs.js',
  './js/lender-catalog.js',
  './js/lender-pages.js',
  './js/market-rates.js',
  './js/lender-context.js',
  './js/infographics.js',
  './js/usage-illustrations.js',
  './js/cinematic.js',
  './js/growth.js',
  './data/market-rates.json',
  './data/credit-cards.json',
  './data/wallet-news.json',
  './news/',
  './mortgage-rates-today/',
  './banking-rates/',
  './compare-credit-cards/',
  './money-market-calculator/',
  './manifest.json',
  './favicon.svg',
  './favicon.ico',
  './og-image.png',
  './sitemap.xml',
  './robots.txt',
  './ads.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Bypass Service Worker completely for cross-origin / third-party requests
  // (Google Analytics, Google Tag Manager, Google AdSense, external CDNs, fonts)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Network-First strategy for HTML navigation requests
  // Guarantees visitors always receive fresh HTML and live tracking tags
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // 3. Stale-While-Revalidate for local static assets (CSS, JS, icons)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {});

      return cachedResponse || fetchPromise;
    })
  );
});
