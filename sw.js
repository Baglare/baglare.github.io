// DersOyun servis çalışanı şablonu. scripts/pwa-build.ts sürüm ve önbellek listesi yer tutucularını derleme sonunda doldurur.
// Kabuk kurulumda, ders parçaları kullanıldıkça önbelleğe alınır. Özgün PDF/JPEG kaynakları
// hiçbir zaman önbelleğe alınmaz ve web yayınında zaten bulunmaz. Yeni sürüm, kullanıcı onaylayana dek BEKLER; çalışan
// sekme kendi sürümünün dosyalarıyla tutarlı kalır ve çözülmemiş bir çalışma yenileme ile bölünmez.
const CACHE = 'dersoyun-1729ef65adde7c4e';
const PRECACHE = ["/","/assets/index-BJQQaN1A.js","/assets/index-DLf2qVaI.css","/assets/katex-uLN8M5ZI.js","/icons/apple-touch-icon.png","/icons/favicon-32.png","/icons/icon-192.png","/icons/icon-512.png","/icons/icon-maskable-512.png","/icons/icon.svg","/manifest.webmanifest","/robots.txt","/theme-init.js"];
const RUNTIME = new Set(["/assets/Architecture-B2NlAim0.css","/assets/Architecture-C0YzvLdE.js","/assets/BigDataFoundationsWorkshop-xIOsWIm_.js","/assets/BigDataWeekWorkshops-DtnOTxM9.js","/assets/DLV2-BleL8gM_.js","/assets/IsgWorkshop-DHaTAiQd.js","/assets/IsgWorkshop-tQsJfJEf.css","/assets/KaTeX_AMS-Regular-BQhdFMY1.woff2","/assets/KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2","/assets/KaTeX_Caligraphic-Regular-Di6jR-x-.woff2","/assets/KaTeX_Fraktur-Bold-CL6g_b3V.woff2","/assets/KaTeX_Fraktur-Regular-CTYiF6lA.woff2","/assets/KaTeX_Main-Bold-Cx986IdX.woff2","/assets/KaTeX_Main-BoldItalic-DxDJ3AOS.woff2","/assets/KaTeX_Main-Italic-NWA7e6Wa.woff2","/assets/KaTeX_Main-Regular-B22Nviop.woff2","/assets/KaTeX_Math-BoldItalic-CZnvNsCZ.woff2","/assets/KaTeX_Math-Italic-t53AETM-.woff2","/assets/KaTeX_SansSerif-Bold-D1sUS0GD.woff2","/assets/KaTeX_SansSerif-Italic-C3H0VqGB.woff2","/assets/KaTeX_SansSerif-Regular-DDBCnlJ7.woff2","/assets/KaTeX_Script-Regular-D3wIWfF6.woff2","/assets/KaTeX_Size1-Regular-mCD8mA8B.woff2","/assets/KaTeX_Size2-Regular-Dy4dx90m.woff2","/assets/KaTeX_Size3-Regular-CTq5MqoE.woff","/assets/KaTeX_Size3-Regular-DgpXs0kz.ttf","/assets/KaTeX_Size4-Regular-Dl5lxZxV.woff2","/assets/KaTeX_Typewriter-Regular-CO6r4hn1.woff2","/assets/MixedExamReview-Cs8Pjf3h.js","/assets/OpenCase-DN1GF7q9.js","/assets/PrivacyModelsWorkshop-jYGVsYKs.js","/assets/ProbabilityCourse-5I0qYRrX.css","/assets/ProbabilityCourse-BnBwWIkB.js","/assets/StageFiveWorkshops-DQfnzOzM.js","/assets/Vize-dXRqB6dh.js","/assets/Workshops-D1a_b17O.js","/assets/ai-software-development-BMeSHANr.js","/assets/ataturk-ilkeleri-ve-inkilap-tarihi-1-CQ2unsKh.js","/assets/big-data-3Cjbehxo.js","/assets/computer-architecture-BXk9zVND.js","/assets/deep-learning-CrKeFCE2.js","/assets/isg-Br4oQGU4.js","/assets/labs-DsFtdhTa.js","/assets/machine-learning-v2-CMiXRZij.js","/assets/math-DCSExhw-.js","/assets/probability-statistics-CLjZVfPU.js"]);
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
async function precacheMissing(cache, urls = PRECACHE) {
  const missing = [];
  for (const url of urls) if (!(await cache.match(url, { ignoreVary: true }))) missing.push(url);
  await Promise.all(missing.map(async url => cache.put(url, await fetchFresh(url))));
  return missing.length;
}

const reusableRuntime = url => RUNTIME.has(url) && /-[\w-]{8}\./.test(url);
const previousCaches = async () => (await caches.keys()).filter(key => key.startsWith('dersoyun-') && key !== CACHE).reverse();

async function transferRuntime(cache, previous) {
  for (const key of previous) {
    const old = await caches.open(key);
    for (const request of await old.keys()) {
      const url = new URL(request.url);
      if (url.origin !== self.location.origin || url.search || !reusableRuntime(url.pathname)) continue;
      if (await cache.match(url.pathname, { ignoreVary: true })) continue;
      const hit = await old.match(request, { ignoreVary: true });
      if (hit) await cache.put(url.pathname, hit);
    }
  }
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => precacheMissing(cache)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const previous = await previousCaches();
    try {
      await transferRuntime(await caches.open(CACHE), previous);
      await Promise.all(previous.map(key => caches.delete(key)));
    } catch {
      // Kota gibi bir hata aktarımı keserse kalan kopyalar eski önbellekten okunabilir.
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (data.type === 'GET_VERSION') { event.ports[0]?.postMessage({ version: '1729ef65adde7c4e' }); return; }
  if (data.type === 'CACHE_VISITED' && Array.isArray(data.urls)) {
    const urls = [...new Set(data.urls.filter(url => RUNTIME.has(url)))];
    event.waitUntil(caches.open(CACHE).then(cache => precacheMissing(cache, urls)).catch(() => {}));
    return;
  }
  if (data.type === 'CACHE_LEARNING') {
    // Eksik/silinmiş girdiler varsa yeniden tamamlar; bütün girdiler yerindeyse hemen ok döner.
    event.waitUntil(caches.open(CACHE).then(cache => precacheMissing(cache, [...PRECACHE, ...RUNTIME])).then(() => event.ports[0]?.postMessage({ ok: true })).catch(() => event.ports[0]?.postMessage({ ok: false })));
  }
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/sources/') || url.pathname === '/sw.js') return;
  if (request.mode === 'navigate') {
    // Hash yönlendirmeli tek sayfa: her gezinme kabuğa gider; kabuk yoksa ağ denenir.
    event.respondWith(caches.open(CACHE).then(cache => cache.match(SHELL, { ignoreVary: true })).then(hit => hit || fetch(request)));
    return;
  }
  if (!PRECACHE.includes(url.pathname) && !RUNTIME.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(url.pathname, { ignoreVary: true });
    if (hit) return hit;
    if (!url.search && reusableRuntime(url.pathname)) {
      for (const cacheName of await previousCaches()) {
        const retained = await caches.match(url.pathname, { cacheName, ignoreVary: true });
        if (retained) return retained;
      }
    }
    const response = await fetch(request);
    if (!url.search && response.ok && !response.redirected && !response.headers.get('content-type')?.startsWith('text/html')) {
      await cache.put(url.pathname, response.clone()).catch(() => {});
    }
    return response;
  })());
});
