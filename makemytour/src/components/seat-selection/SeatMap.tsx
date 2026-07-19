import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Armchair, Info } from "lucide-react";
import { getSeatMap, getBookingPreferences } from "@/api";

interface Seat {
  id: string;
  seatNumber: string;
  seatClass: "ECONOMY" | "PREMIUM";
  surcharge: number;
  status: "AVAILABLE" | "BOOKED";
}

interface Props {
  flightId: string;
  quantity: number;
  onChange: (seatNumbers: string[], surcharge: number) => void;
  rememberPreference: boolean;
  onRememberPreferenceChange: (checked: boolean) => void;
}

const COLUMN_ORDER = ["A", "B", "C", "D", "E", "F"];
const WINDOW_COLS = new Set(["A", "F"]);
const AISLE_COLS = new Set(["C", "D"]);

// Refresh the seat map periodically so seats taken by other users
// disappear from availability without needing a manual reload.
const POLL_INTERVAL_MS = 15 * 1000;

export default function SeatMap({
  flightId,
  quantity,
  onChange,
  rememberPreference,
  onRememberPreferenceChange,
}: Props) {
  const user = useSelector((state: any) => state.user.user);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferredType, setPreferredType] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getSeatMap(flightId);
      setSeats(data);
    } catch {
      setSeats([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightId]);

  useEffect(() => {
    if (!user) return;
    getBookingPreferences(user.id)
      .then((pref) => {
        if (pref?.preferredSeatType && pref.preferredSeatType !== "NONE") {
          setPreferredType(pref.preferredSeatType);
        }
      })
      .catch(() => {});
  }, [user]);

  // Reset selection if it no longer matches the required quantity (e.g. user changed ticket count)
  useEffect(() => {
    if (selected.length > quantity) {
      setSelected(selected.slice(0, quantity));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity]);

  const rows = useMemo(() => {
    const byRow: Record<string, Seat[]> = {};
    for (const seat of seats) {
      const rowNum = seat.seatNumber.match(/^\d+/)?.[0] || "0";
      if (!byRow[rowNum]) byRow[rowNum] = [];
      byRow[rowNum].push(seat);
    }
    return Object.entries(byRow)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([rowNum, rowSeats]) => ({
        rowNum,
        seats: COLUMN_ORDER.map((col) => rowSeats.find((s) => s.seatNumber.endsWith(col))).filter(
          Boolean
        ) as Seat[],
      }));
  }, [seats]);

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== "AVAILABLE") return;

    if (selected.includes(seat.seatNumber)) {
      const next = selected.filter((s) => s !== seat.seatNumber);
      setSelected(next);
      emitChange(next);
      return;
    }

    if (selected.length >= quantity) {
      alert(`You can only select ${quantity} seat${quantity > 1 ? "s" : ""} for this booking.`);
      return;
    }

    const next = [...selected, seat.seatNumber];
    setSelected(next);
    emitChange(next);
  };

  const emitChange = (seatNumbers: string[]) => {
    const surcharge = seats
      .filter((s) => seatNumbers.includes(s.seatNumber))
      .reduce((sum, s) => sum + s.surcharge, 0);
    onChange(seatNumbers, surcharge);
  };

  const isRecommended = (col: string) => {
    if (!preferredType) return false;
    if (preferredType === "WINDOW") return WINDOW_COLS.has(col);
    if (preferredType === "AISLE") return AISLE_COLS.has(col);
    if (preferredType === "MIDDLE") return !WINDOW_COLS.has(col) && !AISLE_COLS.has(col);
    return false;
  };

  const seatClasses = (seat: Seat, col: string) => {
    if (seat.status === "BOOKED") return "bg-gray-200 text-gray-400 cursor-not-allowed";
    if (selected.includes(seat.seatNumber)) return "bg-blue-600 text-white border-blue-600";
    if (seat.seatClass === "PREMIUM")
      return "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100";
    if (isRecommended(col)) return "bg-green-50 text-green-700 border-green-300 hover:bg-green-100";
    return "bg-white text-gray-700 border-gray-300 hover:border-blue-400";
  };

  if (loading) {
    return <div className="text-sm text-gray-400 py-6 text-center">Loading seat map...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Select {quantity} seat{quantity > 1 ? "s" : ""} ({selected.length}/{quantity} selected)
        </span>
        {preferredType && (
          <span className="text-xs text-green-700 flex items-center gap-1">
            <Info size={12} /> Highlighted seats match your saved preference
          </span>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
        {rows.map(({ rowNum, seats: rowSeats }) => (
          <div key={rowNum} className="flex items-center gap-1.5 justify-center">
            <span className="w-5 text-xs text-gray-400">{rowNum}</span>
            {rowSeats.map((seat, idx) => (
              <div key={seat.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={seat.status !== "AVAILABLE"}
                  onClick={() => toggleSeat(seat)}
                  title={
                    seat.seatClass === "PREMIUM"
                      ? `${seat.seatNumber} — Premium (+₹${seat.surcharge})`
                      : seat.seatNumber
                  }
                  className={`w-8 h-8 rounded border flex items-center justify-center text-[10px] font-medium transition-colors ${seatClasses(
                    seat,
                    COLUMN_ORDER[idx]
                  )}`}
                >
                  <Armchair size={14} />
                </button>
                {COLUMN_ORDER[idx] === "C" && <span className="w-3" />}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" /> Premium
          (+₹500)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Booked
        </span>
      </div>

      {user && (
        <label className="flex items-center gap-2 text-xs text-gray-600 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberPreference}
            onChange={(e) => onRememberPreferenceChange(e.target.checked)}
          />
          Remember my seat preference for future bookings
        </label>
      )}
    </div>
  );
}