import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, XCircle, CreditCard, Plane, Bus, Train, Car, Building2, Home, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";

// ---------------------------------------------------------------------------
// Derives a notification feed from the user's bookings in Redux state.
// No extra backend needed — each booking becomes a set of events.
// "Unread" count is driven by a `lastSeenAt` timestamp in localStorage.
// ---------------------------------------------------------------------------

const LAST_SEEN_KEY = "notif_last_seen";

const TYPE_ICONS: Record<string, any> = {
  Flight:   Plane,
  Bus:      Bus,
  Train:    Train,
  Cab:      Car,
  Hotel:    Building2,
  Homestay: Home,
};

interface Notification {
  id: string;
  icon: any;
  iconColor: string;
  bg: string;
  title: string;
  body: string;
  ts: number;
  timeLabel: string;
}

function timeLabel(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function buildNotifications(bookings: any[]): Notification[] {
  const notifs: Notification[] = [];
  (bookings || []).forEach((b: any) => {
    if (!b) return;
    const Icon = TYPE_ICONS[b.type] || CreditCard;
    const ts = b.date ? new Date(b.date).getTime() : 0;

    if (b.cancelled) {
      notifs.push({
        id: `cancel-${b.bookingId}`,
        icon: XCircle,
        iconColor: "text-red-500",
        bg: "bg-red-50",
        title: `${b.type} booking cancelled`,
        body: b.cancellationReason ? `Reason: ${b.cancellationReason}` : "Your booking has been cancelled.",
        ts: b.cancelledAt ? new Date(b.cancelledAt).getTime() : ts,
        timeLabel: "",
      });
      if (b.refundStatus === "COMPLETED") {
        notifs.push({
          id: `refund-${b.bookingId}`,
          icon: RefreshCw,
          iconColor: "text-emerald-600",
          bg: "bg-emerald-50",
          title: "Refund credited",
          body: `₹${b.refundAmount?.toLocaleString("en-IN")} has been credited to your account.`,
          ts: ts + 1,
          timeLabel: "",
        });
      }
    } else {
      notifs.push({
        id: `booked-${b.bookingId}`,
        icon: CheckCircle2,
        iconColor: "text-green-600",
        bg: "bg-green-50",
        title: `${b.type} booking confirmed`,
        body: `Booking #${b.bookingId?.slice(-6).toUpperCase()} · ₹${b.totalPrice?.toLocaleString("en-IN")}`,
        ts,
        timeLabel: "",
      });
    }
  });

  // Sort newest first, add time labels
  notifs.sort((a, b) => b.ts - a.ts);
  notifs.forEach((n) => { n.timeLabel = timeLabel(n.ts); });
  return notifs.slice(0, 20);
}

export default function NotificationBell() {
  const user = useSelector((state: any) => state.user.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem(LAST_SEEN_KEY) || "0", 10);
  });

  const notifs = buildNotifications(user?.bookings || []);
  const unread = notifs.filter((n) => n.ts > lastSeen).length;

  const handleOpen = () => {
    const now = Date.now();
    setLastSeen(now);
    if (typeof window !== "undefined") localStorage.setItem(LAST_SEEN_KEY, String(now));
    setOpen((p) => !p);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-700" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
            {unread === 0 && <span className="text-xs text-gray-400">All caught up</span>}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifs.map((n) => {
                const Icon = n.icon;
                const isNew = n.ts > lastSeen - 1;
                return (
                  <div key={n.id} className={`flex gap-3 px-4 py-3.5 ${isNew ? "bg-blue-50/40" : ""}`}>
                    <div className={`w-8 h-8 rounded-full ${n.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={14} className={n.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">{n.timeLabel}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
