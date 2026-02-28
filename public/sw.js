const SW_VERSION = 'pos-v2'
const CACHE_NAME = `pos-cache-${SW_VERSION}`

// Static assets to cache (cache-first)
const STATIC_EXTENSIONS = ['.js', '.css', '.woff', '.woff2', '.ttf', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp']

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.includes(ext))
}

function isAPIRoute(url) {
  return url.includes('/api/')
}

self.addEventListener('install', (event) => {
  // Skip waiting immediately so new SW activates fast
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )

  // Notify all clients about the update
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SW_UPDATED', version: SW_VERSION })
    })
  })
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and non-http(s)
  if (!url.startsWith('http')) return

  if (isAPIRoute(url)) {
    // Network-first for API — always fresh, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
  } else if (isStaticAsset(url)) {
    // Cache-first for static assets (JS, CSS, fonts, images)
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
  } else {
    // Network-first for HTML pages and everything else
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
  }
})
