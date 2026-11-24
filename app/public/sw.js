const CACHE_NAME = 'jp-pilot-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const assets = new Set(['./', './index.html'])
      try {
        const res = await fetch('./index.html', { cache: 'no-store' })
        if (res.ok) {
          const html = await res.text()
          const matches = html.matchAll(/(?:src|href)=["']([^"']+)["']/g)
          for (const [, raw] of matches) {
            if (!raw || raw.startsWith('data:')) continue
            const resolved = new URL(raw, self.location.href)
            if (resolved.origin === self.location.origin) {
              assets.add(resolved.href)
            }
          }
        }
      } catch {
        // Offline during install; fall back to caching core shell URLs.
      }
      await Promise.allSettled([...assets].map((url) => cache.add(url)))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            void caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy))
          }
          return response
        })
        .catch(async () => (await caches.match('./index.html')) || (await caches.match('./'))),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
