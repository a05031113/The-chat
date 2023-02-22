function subscribe() {
    navigator.serviceWorker.ready.then(function(registration) {
        const vapidPublicKey = "BP4Gr911IgbUc0w07ByT9X0QfWnVdfwCl0PBXklAxsZBMAg5lDSxgQ6GCmWc8UC6b0bd-v7X83NHN1OsFXJLru0";

        return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
    }).then(function(subscription) {
        console.log(
        JSON.stringify({
            subscription: subscription,
        })
        );
    }).catch(err => console.error(err));
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/js/chat/service-worker.js', {scope: "/static/js/chat/"});
    navigator.serviceWorker.ready.then(function(registration) {
        return registration.pushManager.getSubscription();
    }).then(function(subscription) {
        if (!subscription) {
            console.log("subscribe")
            subscribe();
        } else {
            console.log("else")
            console.log(
            JSON.stringify({
                subscription: subscription,
            }));
        }
    });
}