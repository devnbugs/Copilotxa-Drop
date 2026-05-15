// Example fix for a fetch listener in a Service Worker
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(error => {
      // Handle the error: return a cached response or a custom offline page
      console.error('Fetch failed; returning offline page instead.', error);
      return caches.match('/offline.html');
    })
  );
});
