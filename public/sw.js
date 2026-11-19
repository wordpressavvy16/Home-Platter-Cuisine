const APP_SHELL_CACHE = 'homeplatter-shell-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
];

// 1. Install the service worker and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache => cache.addAll(urlsToCache))
      .catch(() => undefined)
  );
});

// 2. Activate and purge all stale v1 caches (including any poisoned /api/ caches)
self.addEventListener('activate', event => {
  const cacheWhitelist = [APP_SHELL_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return undefined;
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Intercept fetch requests (NEVER cache or intercept /api/ requests)
self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// --- PUSH NOTIFICATION LOGIC ---
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Home Platter', body: 'New update available.' };
  const options = {
    body: data.body,
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_TEST_NOTIFICATION') {
    event.waitUntil(
      self.registration.showNotification('Test Notification', {
        body: 'This is a test push notification from Home Platter!',
      })
    );
  }
});