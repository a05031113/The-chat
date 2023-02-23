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
    console.log(event.notification.body)
    console.log(userData)
})