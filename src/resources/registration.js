window.onload = function () {
    //パーミッションを取得するボタンクリック時
    document.getElementById("btnWebPush").onclick = installServiceWorker;
};

var installServiceWorker = async function () {
    Notification.requestPermission(function (result) {
        console.log('requestPermission: ' + result);
        if (result !== 'granted') {
            throw new Error('Request permission failed.');
        }
    })

    const serviceWorkerRegistration = await window.navigator.serviceWorker.register('./service-worker.js', { scope: '/' });

    if (serviceWorkerRegistration.installing) {
        console.log('Service Worker を初回登録しています…', serviceWorkerRegistration);
        const installingServiceWorker = serviceWorkerRegistration.installing;
        installingServiceWorker.addEventListener('statechange', (event) => {
            console.log('Service Worker の初回インストール状況 : ', installingServiceWorker.state, event);
        });
    } else {
        console.log('Service Worker はインストール済のようです', serviceWorkerRegistration);
    }

    await navigator.serviceWorker.ready;

    const applicationServerPublicKey = '';

    const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(applicationServerPublicKey)
    });

    let json = pushSubscription.toJSON();
    let url = new URL(window.location.href);
    const response = await window.fetch(`/subscribe?${url.searchParams}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
    });
    document.getElementById("txtIIToken").value = response.statusText;
}

var urlBase64ToUint8Array = function (base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace((/\-/g), '+').replace((/_/g), '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
}