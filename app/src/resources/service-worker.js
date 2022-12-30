self.addEventListener('install', (event) => {
    console.log('【SW】Install : Service Worker のインストールが開始された', event);
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('【SW】Push : メッセージを受信した', event, event.data.json());
    return event.waitUntil(self.registration.showNotification(event.data.json().title, {
        body: event.data.json().body,
        icon: event.data.json().icon,
        data: event.data.json().data,
        requireInteraction: false
    }));
});

self.addEventListener('notificationclick', (event) => {
    event.preventDefault();
    event.notification.close();
    return event.waitUntil(clients.openWindow(event.notification.data));
});