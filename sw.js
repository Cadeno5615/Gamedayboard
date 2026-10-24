// Gameday Board: helper for notifications. Put this file in the same folder as index.html.
// It shows notifications sent by your Worker (they arrive even when the site is closed or the phone is locked),
// and brings the site forward when one is tapped. It does not cache or change any request.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });
self.addEventListener('push', function (event) {
  var msg = {};
  try { msg = event.data ? event.data.json() : {}; } catch (e) { msg = { body: event.data ? event.data.text() : '' }; }
  // A notification is always shown for a push: phones turn push off for sites that receive one without showing it.
  // An announcement: tell any open copy of the site to show it straight away.
  if (/^gb-ann-/.test(String(msg.tag || ''))) self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) { list.forEach(function (c) { c.postMessage({ gamedayAnn: true }); }); });
  event.waitUntil(self.registration.showNotification(String(msg.title || 'Gameday Board').slice(0, 120), {
    body: String(msg.body || '').slice(0, 300), tag: String(msg.tag || 'gb'), data: msg.data || null, icon: 'icon-192.png', badge: 'icon-192.png'
  }));
});
self.addEventListener('notificationclick', function (event) {
  var data = event.notification.data || null;
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    var page = list[0];
    if (page) { page.postMessage({ gameday: data }); return page.focus(); }
    var to = data && data.lg ? './#' + encodeURIComponent(data.lg) + '/scores' : './';
    return self.clients.openWindow(to);
  }));
});
