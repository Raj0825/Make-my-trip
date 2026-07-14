import { getVapidPublicKey, subscribeToPush } from "@/api";

// Converts a URL-safe base64 VAPID key into the Uint8Array format
// required by PushManager.subscribe's applicationServerKey option.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

// Registers the service worker, asks for notification permission, subscribes
// to push, and sends the subscription to the backend for this user.
// Returns true on success, false if permission was denied or unsupported.
export async function enablePushNotifications(userId: string): Promise<boolean> {
  if (!isPushSupported()) {
    alert("Push notifications aren't supported in this browser.");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return false;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const { publicKey } = await getVapidPublicKey();
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }

  const subJson = subscription.toJSON();
  await subscribeToPush(userId, subJson.endpoint as string, {
    p256dh: subJson.keys!.p256dh,
    auth: subJson.keys!.auth,
  });

  return true;
}