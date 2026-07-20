const CACHE = "anotai-v1";
const ASSETS = ["index.html", "app.html", "settings.html", "style.css", "firebase-init.js", "favicon.svg", "manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const isHTML = event.request.mode === "navigate" || (event.request.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // Páginas: prioriza a rede (fica sempre atualizado); só usa o cache se estiver offline.
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Arquivos estáticos: usa o cache primeiro, mais rápido.
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
  }
});
