/**
 * Service Worker para Push Notifications (personalizadas, com imagem).
 * Registrado após o usuário aceitar as notificações no login.
 */
self.addEventListener('push', function (event) {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Notificação', body: event.data.text() || '' };
  }
  const title = payload.title || 'Itamoving';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/assets/icons/icon-192x192.png',
    badge: payload.badge || '/assets/icons/icon-96x96.png',
    tag: payload.tag || 'default',
    requireInteraction: false,
    data: {
      url: payload.url || '/',
      entityType: payload.entityType,
      entityId: payload.entityId,
      notificationId: payload.notificationId,
      timestamp: payload.timestamp,
    },
  };
  if (payload.image) {
    options.image = payload.image;
  }
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
