// importScripts("/js/chat/variableChat.js")

self.addEventListener('push', event => {
    console.log("receive", event.data.text())
    const title = "The Chat";
    const options = {
        body: event.data.text(),
        tag: "the-chat"
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then((clientList) => {
        console.log(clientList)
        for (const client of clientList) {
            if (client.url === '/chat' && 'focus' in client)
                return client.focus();
        }
        if (clients.openWindow)
            return clients.openWindow('/');
    }));
})