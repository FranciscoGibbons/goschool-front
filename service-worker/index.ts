/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  if (!data) return;

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/images/icon-192x192.png',
      badge: data.badge || '/images/badge-72x72.png',
      tag: data.tag,
      data: data.data,
      vibrate: [100, 50, 100],
    })
  );
});

// Notification click handler — navigate to the correct page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If there's already an open window, focus it and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // Otherwise, open a new window
        return self.clients.openWindow(url);
      })
  );
});
