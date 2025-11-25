// Service Worker for PWA
// This file will be served from /sw.js
// Version updated to force cache refresh

const CACHE_NAME = 'greenwood-city-v4';
const RUNTIME_CACHE = 'greenwood-city-runtime-v4';

// Assets to cache on install (optional - will cache if available)
const PRECACHE_ASSETS = [
  '/manifest.json',
];

// Install event - cache essential assets with error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Use Promise.allSettled to handle failures gracefully
        // Don't fail installation if some assets can't be cached
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) => 
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch((error) => {
                console.warn(`[SW] Failed to cache ${url}:`, error);
                // Don't throw - allow other assets to cache
              })
          )
        );
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Install error:', error);
        // Still skip waiting even if caching fails
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  const isHTML = event.request.destination === 'document' || 
                 url.pathname.endsWith('.html') ||
                 (!url.pathname.includes('.') && url.pathname !== '/sw.js');

  if (isHTML) {
    // Network-only strategy for HTML pages - NO cache fallback
    // Always fetch fresh content, return error if network fails
    // This ensures users always see current content or maintenance page
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
        .then((response) => {
          // Don't cache HTML pages at all - always fetch fresh
          // Return the response directly
          return response;
        })
        .catch((error) => {
          console.error('[SW] Network fetch failed - no cache fallback:', error);
          // Return error response - let the app show maintenance page
          // Don't serve cached content - always require fresh fetch
          return new Response('Network Error - Please check your connection', { 
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
              'Content-Type': 'text/html; charset=utf-8'
            }
          });
        })
    );
  } else {
    // Cache-first strategy for static assets (images, CSS, JS)
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version but also update in background
            fetch(event.request)
              .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                  const responseToCache = response.clone();
                  caches.open(RUNTIME_CACHE)
                    .then((cache) => {
                      cache.put(event.request, responseToCache);
                    });
                }
              })
              .catch(() => {
                // Ignore fetch errors for background update
              });
            return cachedResponse;
          }

          // Not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // Network failed and not in cache - return error
              return new Response('Service Unavailable', { 
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                  'Content-Type': 'text/plain'
                }
              });
            });
        })
    );
  }
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Greenwood City Block C',
        body: event.data.text() || 'You have a new notification',
      };
    }
  }

  const options = {
    title: data.title || 'Greenwood City Block C',
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    image: data.image,
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'open',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click event - handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const urlToOpen = event.notification.data?.url || '/';

  if (action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Check if any window is open, focus it
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

