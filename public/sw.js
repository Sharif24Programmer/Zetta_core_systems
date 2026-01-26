const CACHE_NAME = 'zetta-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Firebase and external requests
    if (
        url.origin !== location.origin ||
        url.pathname.includes('firebase') ||
        url.pathname.includes('__')
    ) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            // Return cached if available, fetch otherwise
            const fetchPromise = fetch(request).then((networkResponse) => {
                // Cache successful responses
                if (networkResponse.ok) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Return offline fallback for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503 });
            });

            return cachedResponse || fetchPromise;
        })
    );
});

// Background Sync for offline bills
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-bills') {
        event.waitUntil(syncPendingBills());
    }
});

async function syncPendingBills() {
    // This would sync pending bills from IndexedDB to Firebase
    console.log('🔄 Syncing pending bills...');
    // Implementation would read from IndexedDB and POST to Firebase
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const options = {
        body: data.body || 'New notification',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge.png',
        vibrate: [100, 50, 100],
        data: data.data || {}
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Zetta POS', options)
    );
});
