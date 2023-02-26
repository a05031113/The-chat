let controller = {
    refresh: async function refresh(){
        try{    
            const response = await fetch("/api/refresh", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (response.status === 200){
                return true;
            }else{
                window.location.href = "/";
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    postSubscription: async function(data){
        try{
            let auth = await controller.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/notification/subscribe", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json();
        }catch(err){
            console.log(err)
        }    
    },
    subscribe: function(){
        navigator.serviceWorker.register('/static/js/chat/service-worker.js', {scope: "/static/js/chat/"})
        .then(function(registration){
            const vapidPublicKey = "BP4Gr911IgbUc0w07ByT9X0QfWnVdfwCl0PBXklAxsZBMAg5lDSxgQ6GCmWc8UC6b0bd-v7X83NHN1OsFXJLru0";
    
            return registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: controller.urlBase64ToUint8Array(vapidPublicKey),
            });
        }).then(function(subscription) {
            const data = {
                "subscription": JSON.stringify(subscription),
            }
            controller.postSubscription(data);
            // console.log(
            // JSON.stringify({
            //     subscription: subscription,
            // }));
        }).catch(err => console.error(err));    
    },
    urlBase64ToUint8Array: function(base64String){
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    
    }
}


if ('serviceWorker' in navigator) {
    Notification.requestPermission((result) => {
        if (result === "granted") {
            navigator.serviceWorker.register('/static/js/chat/service-worker.js', {scope: "/static/js/chat/"})
            .then(function(registration) {
                return registration.pushManager.getSubscription();
            }).then(function(subscription) {
                if (!subscription) {
                    controller.subscribe();
                } else {
                    const data = {
                        "subscription": JSON.stringify(subscription),
                    }
                    controller.postSubscription(data)
                    // console.log(
                    // JSON.stringify({
                    //     subscription: subscription,
                    // }));
                }
            });
        }
    })
}

