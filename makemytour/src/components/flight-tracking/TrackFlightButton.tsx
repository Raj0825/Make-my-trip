import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackFlight, untrackFlight, getTrackedFlights } from "@/api";
import { enablePushNotifications } from "@/lib/push";

export default function TrackFlightButton({ flightId }: { flightId: string }) {
  const user = useSelector((state: any) => state.user.user);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkTracking = async () => {
      if (!user) {
        setChecked(true);
        return;
      }
      try {
        const tracked = await getTrackedFlights(user.id);
        setTracking(tracked.some((t: any) => t.flightId === flightId));
      } catch {
        // ignore
      }
      setChecked(true);
    };
    checkTracking();
  }, [user, flightId]);

  const handleToggle = async () => {
    if (!user) {
      alert("Please log in to track this flight.");
      return;
    }
    setLoading(true);
    try {
      if (tracking) {
        await untrackFlight(user.id, flightId);
        setTracking(false);
      } else {
        const granted = await enablePushNotifications(user.id);
        if (!granted) {
          alert("Notification permission is needed to track flights and receive live updates.");
          setLoading(false);
          return;
        }
        await trackFlight(user.id, flightId);
        setTracking(true);
      }
    } catch (e) {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  if (!checked) return null;

  return (
    <Button
      variant={tracking ? "outline" : "default"}
      onClick={handleToggle}
      disabled={loading}
      className={
        tracking
          ? "w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 rounded-lg transition-all"
          : "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all"
      }
    >
      {loading ? (
        <Loader2 className="animate-spin mr-2" size={16} />
      ) : tracking ? (
        <BellOff className="mr-2 text-blue-600" size={16} />
      ) : (
        <Bell className="mr-2" size={16} />
      )}
      {tracking ? "Stop Tracking Flight" : "Track Flight"}
    </Button>
  );
}