// Service worker for browser push notifications (flight status updates).
// Registered from the client with navigator.serviceWorker.register("/sw.js").

self.addEventListener("push", (event) => {
  let payload = { title: "Flight Update", body: "Your flight status has changed." };
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {
    // fall back to default payload above
  }

  const options = {
    body: payload.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const flightId = event.notification.data && event.notification.data.flightId;
  const targetUrl = "/track-flights";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/track-flights") && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});