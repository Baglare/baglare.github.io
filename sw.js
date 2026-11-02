// DersOyun servis çalışanı şablonu. scripts/pwa-build.ts sürüm ve önbellek listesi yer tutucularını derleme sonunda doldurur.
// İlke: kabuk + dört dersin tüm içeriği kurulumda önbelleğe alınır (çevrimdışı tam çalışma). Özgün PDF/JPEG kaynakları
// hiçbir zaman önbelleğe alınmaz ve web yayınında zaten bulunmaz. Yeni sürüm, kullanıcı onaylayana dek BEKLER; çalışan
// sekme kendi sürümünün dosyalarıyla tutarlı kalır ve çözülmemiş bir çalışma yenileme ile bölünmez.
const CACHE = 'dersoyun-9c68bcc67ed7e1d7';
const PRECACHE = ["/","/assets/KaTeX_AMS-Regular-BQhdFMY1.woff2","/assets/KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2","/assets/KaTeX_Caligraphic-Regular-Di6jR-x-.woff2","/assets/KaTeX_Fraktur-Bold-CL6g_b3V.woff2","/assets/KaTeX_Fraktur-Regular-CTYiF6lA.woff2","/assets/KaTeX_Main-Bold-Cx986IdX.woff2","/assets/KaTeX_Main-BoldItalic-DxDJ3AOS.woff2","/assets/KaTeX_Main-Italic-NWA7e6Wa.woff2","/assets/KaTeX_Main-Regular-B22Nviop.woff2","/assets/KaTeX_Math-BoldItalic-CZnvNsCZ.woff2","/assets/KaTeX_Math-Italic-t53AETM-.woff2","/assets/KaTeX_SansSerif-Bold-D1sUS0GD.woff2","/assets/KaTeX_SansSerif-Italic-C3H0VqGB.woff2","/assets/KaTeX_SansSerif-Regular-DDBCnlJ7.woff2","/assets/KaTeX_Script-Regular-D3wIWfF6.woff2","/assets/KaTeX_Size1-Regular-mCD8mA8B.woff2","/assets/KaTeX_Size2-Regular-Dy4dx90m.woff2","/assets/KaTeX_Size3-Regular-CTq5MqoE.woff","/assets/KaTeX_Size3-Regular-DgpXs0kz.ttf","/assets/KaTeX_Size4-Regular-Dl5lxZxV.woff2","/assets/KaTeX_Typewriter-Regular-CO6r4hn1.woff2","/assets/ai-software-development-DOpnkxQj.js","/assets/ataturk-ilkeleri-ve-inkilap-tarihi-1-CQ2unsKh.js","/assets/big-data-DQC6FFi4.js","/assets/computer-architecture-BXk9zVND.js","/assets/deep-learning-CrKeFCE2.js","/assets/index-BaHOuNNE.js","/assets/index-wwUyS-WB.css","/assets/machine-learning-v2-CMiXRZij.js","/icons/apple-touch-icon.png","/icons/favicon-32.png","/icons/icon-192.png","/icons/icon-512.png","/icons/icon-maskable-512.png","/icons/icon.svg","/manifest.webmanifest","/robots.txt","/theme-init.js"];
// Statik barındırıcılar /index.html adresini '/' adresine yönlendirebilir; kabuk '/' anahtarıyla saklanır.
const SHELL = '/';

async function fetchFresh(url) {
  const response = await fetch(new Request(url, { cache: 'reload', credentials: 'same-origin' }));
  // Yönlendirilmiş (ör. erişim denetimi giriş sayfası) ya da başarısız yanıt önbelleğe girmez.
  if (!response.ok || response.redirected) throw new Error(`Önbelleğe alınamadı: ${url} (${response.status})`);
  const type = response.headers.get('content-type') || '';
  if (url !== '/' && type.startsWith('text/html')) throw new Error(`Beklenmeyen HTML yanıtı: ${url}`);
  return response;
}
async function precacheMissing(cache) {
  const missing = [];
  for (const url of PRECACHE) if (!(await cache.match(url, { ignoreVary: true }))) missing.push(url);
  await Promise.all(missing.map(async url => cache.put(url, await fetchFresh(url))));
  return missing.length;
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(precacheMissing));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('dersoyun-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim(),
  ]));
});
self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (data.type === 'GET_VERSION') { event.ports[0]?.postMessage({ version: '9c68bcc67ed7e1d7' }); return; }
  if (data.type === 'CACHE_LEARNING') {
    // Eksik/silinmiş girdiler varsa yeniden tamamlar; bütün girdiler yerindeyse hemen ok döner.
    event.waitUntil(caches.open(CACHE).then(precacheMissing).then(() => event.ports[0]?.postMessage({ ok: true })).catch(() => event.ports[0]?.postMessage({ ok: false })));
  }
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/sources/') || url.pathname === '/sw.js') return;
  if (request.mode === 'navigate') {
    // Hash yönlendirmeli tek sayfa: her gezinme kabuğa gider; kabuk yoksa ağ denenir.
    event.respondWith(caches.match(SHELL, { ignoreVary: true }).then(hit => hit || fetch(request)));
    return;
  }
  event.respondWith(caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(hit => hit || fetch(request)));
});
