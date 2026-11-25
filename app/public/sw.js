const CACHE_NAME = 'jp-pilot-v13'
const PRECACHE_BUNDLES = []
const FIGURE_BUNDLES = {}
const CALCULATION_AUDIO_CACHE = 'jp-calculation-audio-v1'
const CALCULATION_AUDIO_PATH = new URL('./audio/', self.location.href).pathname
const BUNDLE_PATH = new URL('./assets/', self.location.href).pathname

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(['./', './index.html', ...PRECACHE_BUNDLES])
      await Promise.all(Object.entries(FIGURE_BUNDLES).map(([path, source]) =>
        cache.put(path, new Response(source, {
          headers: { 'Content-Type': path.endsWith('.css') ? 'text/css' : 'text/javascript' },
        })),
      ))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== CALCULATION_AUDIO_CACHE).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith(CALCULATION_AUDIO_PATH)) {
    // The player writes to this cache once playback starts. Preloads only read it.
    event.respondWith(
      caches.open(CALCULATION_AUDIO_CACHE).then((cache) => cache.match(request))
        .catch(() => undefined).then((cached) => cached || fetch(request)),
    )
    return
  }

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

  // Topic and question data change between releases: try the network first, use the saved copy offline.
  if ((url.pathname.includes('/data/') || url.pathname.startsWith(new URL('./lessons/', self.location.href).pathname)) && url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const copy = response.clone()
            await caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {})
          }
          return response
        })
        .catch(async () => (await caches.match(request)) || Response.error()),
    )
    return
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    // Precache and module requests can carry different Origin headers for the same hashed file.
    const cached = await cache.match(request, { ignoreVary: url.pathname.startsWith(BUNDLE_PATH) })
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone()).catch(() => {})
    return response
  })())
})
