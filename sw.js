self.addEventListener('install', (event) => {
  // 立即激活 Service Worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 立即接管所有页面
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 简单的透传请求，不进行缓存，确保数据实时性
  event.respondWith(fetch(event.request));
});