self.addEventListener('install', (event) => {
    console.log('【SW】Install : Service Worker のインストールが開始された', event);
});

self.addEventListener('push', (event) => {
    console.log('【SW】Push : メッセージを受信した', event, event.data.json());
    self.registration.showNotification(event.data.json().title, {
        body: event.data.json().body,
        icon: event.data.json().icon,
        data: event.data.json().data,
        requireInteraction: false
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    clients.openWindow(event.notification.data);
});