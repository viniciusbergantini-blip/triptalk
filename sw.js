// ── TripTalk Service Worker ──
// Mude o número da versão sempre que subir arquivos novos no servidor
// Ex: v1 → v2 → v3 ...
const CACHE_NAME = "triptalk-v3"

const FILES = [
  "./",
  "./app.html",
  "./icon.png",
  "./manifest.json"
]

// Instala e guarda os arquivos em cache
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  )
  self.skipWaiting()
})

// Ativa e apaga caches antigos automaticamente
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("TripTalk: apagando cache antigo →", key)
            return caches.delete(key)
          })
      )
    )
  )
  self.clients.claim()
})

// Busca os arquivos — tenta o servidor primeiro, usa cache se offline
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy))
        return response
      })
      .catch(() => caches.match(e.request))
  )
})
