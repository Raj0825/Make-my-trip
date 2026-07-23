import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { PRICING_WS_URL } from "@/api";

let sharedClient: Client | null = null;
let refCount = 0;

function getClient(): Client {
  if (!sharedClient) {
    sharedClient = new Client({
      webSocketFactory: () => new SockJS(PRICING_WS_URL) as any,
      reconnectDelay: 4000,
      debug: () => {},
    });
    sharedClient.activate();
  }
  return sharedClient;
}

export function subscribeToPriceUpdates(
  entityType: string,
  entityId: string,
  onUpdate: (update: { price: number; multiplier: number; reason: string; timestamp: number }) => void
): () => void {
  const client = getClient();
  refCount++;

  let stompSub: { unsubscribe: () => void } | null = null;
  let cancelled = false;

  const trySubscribe = () => {
    if (cancelled) return;
    if (client.connected) {
      stompSub = client.subscribe(`/topic/prices/${entityType}/${entityId}`, (message) => {
        try {
          onUpdate(JSON.parse(message.body));
        } catch {
          // ignore malformed frames
        }
      });
    } else {
      client.onConnect = trySubscribe;
    }
  };
  trySubscribe();

  return () => {
    cancelled = true;
    stompSub?.unsubscribe();
    refCount--;
    if (refCount <= 0 && sharedClient) {
      sharedClient.deactivate();
      sharedClient = null;
      refCount = 0;
    }
  };
}