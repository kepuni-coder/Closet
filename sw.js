const V = 'closet-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const fonts = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (u.origin !== location.origin && !fonts) return;
  const save = res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); } return res; };
  if (r.mode === 'navigate' || u.pathname.endsWith('/index.html')) { // pages: newest copy when online, saved copy when offline
    e.respondWith(fetch(r).then(save).catch(() => caches.match(r).then(h => h || caches.match('index.html') || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(save)));
});
