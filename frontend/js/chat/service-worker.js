// importScripts("/js/chat/variableChat.js")

self.addEventListener('push', event => {
    const title = "The Chat";
    const options = {
        body: event.data.text(),
        tag: "the-chat",
        icon: "/static/img/logo.png"
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then((clientList) => {
        for (const client of clientList) {
            if (client.url === '/chat' && 'focus' in client)
                return client.focus();
        }
        if (clients.openWindow)
            return clients.openWindow('/chat');
    }));
})