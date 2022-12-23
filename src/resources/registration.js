(function () {
    'use strict';

    window.onload = function () {
        //パーミッションを取得するボタンクリック時
        document.getElementById("registration_button").onclick = installServiceWorker;
        document.getElementById("unsubscribe").onclick = unsubscribe;
    };

    const url = new URL(window.location.href);
    let installServiceWorker = async function () {
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
        const response = await window.fetch(`/subscribe?${url.searchParams}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        });
        if (response.status === 200) {
            showSuccess();
        } else {
            showFailed();
        }
    }

    let unsubscribe = async () => {
        let subscription = null;
        try {
            const reg = await navigator.serviceWorker.ready;
            subscription = await reg.pushManager.getSubscription();
            if (!subscription) {
                showSuccess();
                return;
            }
            if (await subscription.unsubscribe()) {
                // 登録解除が成功
                const response = await window.fetch(`/unsubscribe?${url.searchParams}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription.toJSON())
                });
                if (response.status === 200) {
                    showSuccess();
                } else {
                    showFailed();
                }
            } else {
                showFailed();
            }
        } catch (e) {
            // 登録解除が失敗
            console.log('Unsubscribe failed: ' + subscription);
        }
    }

    let urlBase64ToUint8Array = function (base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace((/\-/g), '+').replace((/_/g), '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
        return outputArray;
    }
})();