import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Plane, MapPin, ArrowRight, Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrackedFlights, untrackFlight } from "@/api";
import FlightStatusBadge from "@/components/flight-tracking/FlightStatusBadge";

// Refresh the dashboard periodically so status/estimated-arrival changes
// show up live while the page is open, in addition to push notifications.
const POLL_INTERVAL_MS = 30 * 1000;

export default function TrackFlightsPage() {
  const user = useSelector((state: any) => state.user.user);
  const [tracked, setTracked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getTrackedFlights(user.id);
      setTracked(data || []);
    } catch {
      setTracked([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUntrack = async (flightId: string) => {
    if (!user) return;
    await untrackFlight(user.id, flightId);
    setTracked((prev) => prev.filter((t) => t.flightId !== flightId));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Plane className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-500">Please log in to track your flights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <BellRing className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold">Live Flight Tracking</h1>
        </div>
        <p className="text-gray-500 mb-6">
          Live status updates for every flight you're tracking. You'll also get a browser
          notification whenever something changes.
        </p>

        {loading ? (
          <div className="text-gray-400 text-center py-12">Loading...</div>
        ) : tracked.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <Bell className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500 mb-4">
              You're not tracking any flights yet.
            </p>
            <Link href="/">
              <Button>Browse Flights</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tracked.map((entry) => (
              <div key={entry.flightId} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-lg">
                      <Plane size={18} className="text-blue-600" />
                      {entry.flight?.flightName || "Flight"}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" />
                      {entry.flight?.from}
                      <ArrowRight size={14} className="mx-2" />
                      {entry.flight?.to}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUntrack(entry.flightId)}
                  >
                    Stop Tracking
                  </Button>
                </div>

                <div className="mt-4">
                  <FlightStatusBadge status={entry.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}