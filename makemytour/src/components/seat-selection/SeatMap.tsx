import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Armchair, Sofa, BedSingle, BedDouble, Briefcase, Info, Check } from "lucide-react";
import { getSeatMap, getBookingPreferences } from "@/api";

interface Seat {
  id: string;
  seatNumber: string;
  seatClass: "Economy" | "Premium Economy" | "Business" | "First Class";
  surcharge: number;
  status: "AVAILABLE" | "BOOKED";
}

interface Props {
  flightId: string;
  quantity: number;
  travelClass: string;
  onChange: (seatNumbers: string[], surcharge: number) => void;
  rememberPreference: boolean;
  onRememberPreferenceChange: (checked: boolean) => void;
}

const COLUMN_ORDER = ["A", "B", "C", "D", "E", "F"];
const WINDOW_COLS = new Set(["A", "F"]);
const AISLE_COLS = new Set(["C", "D"]);

// Each cabin gets a visually distinct seat icon so the class you're picking
// seats in is obvious at a glance, not just a color/label difference.
function SeatIcon({ seatClass, size = 14 }: { seatClass: Seat["seatClass"]; size?: number }) {
  switch (seatClass) {
    case "First Class":
      return <BedDouble size={size} />; // fully flat suite
    case "Business":
      return <BedSingle size={size} />; // lie-flat / convertible recliner
    case "Premium Economy":
      return <Sofa size={size} />; // extra cushioned, more room
    default:
      return <Armchair size={size} />; // standard economy seat
  }
}

// Refresh the seat map periodically so seats taken by other users
// disappear from availability without needing a manual reload.
const POLL_INTERVAL_MS = 30 * 1000;

export default function SeatMap({
  flightId,
  quantity,
  travelClass,
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

  // Reset seat selection whenever the chosen cabin class changes - a seat
  // picked in one section of the plane isn't valid once you switch cabins.
  useEffect(() => {
    setSelected([]);
    onChange([], 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelClass]);

  const seatsInClass = useMemo(
    () => seats.filter((s) => s.seatClass === travelClass),
    [seats, travelClass]
  );

  const rows = useMemo(() => {
    const byRow: Record<string, Seat[]> = {};
    for (const seat of seatsInClass) {
      // Seat numbers may have a class prefix (F1A, J1A, W1A) or none (Economy: 1A) -
      // strip any leading letters before reading the row number.
      const rowNum = seat.seatNumber.replace(/^[A-Za-z]*/, "").match(/^\d+/)?.[0] || "0";
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
  }, [seatsInClass]);

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
    if (selected.includes(seat.seatNumber))
      return "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300 ring-offset-1 scale-110";
    if (isRecommended(col)) return "bg-green-50 text-green-700 border-green-300 hover:bg-green-100";
    return "bg-white text-gray-700 border-gray-300 hover:border-blue-400";
  };

  if (loading) {
    return <div className="text-sm text-gray-400 py-6 text-center">Loading seat map...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <SeatIcon seatClass={travelClass as Seat["seatClass"]} size={15} />
          {travelClass} — select {quantity} seat{quantity > 1 ? "s" : ""} ({selected.length}/{quantity} selected)
        </span>
        {preferredType && (
          <span className="text-xs text-green-700 flex items-center gap-1">
            <Info size={12} /> Highlighted seats match your saved preference
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">
        {travelClass === "First Class" && "Fully flat private suite with dedicated storage compartment."}
        {travelClass === "Business" && "Lie-flat, convertible recliner seat with extra personal space."}
        {travelClass === "Premium Economy" && "Wider, extra-cushioned seat with additional legroom."}
        {travelClass === "Economy" && "Standard seat and baggage allowance."}
      </p>

      {rows.length === 0 ? (
        <div className="text-sm text-gray-500 py-6 text-center border border-dashed rounded-lg">
          This flight doesn't have a {travelClass} cabin. Choose a different class above to select seats.
        </div>
      ) : (
      <div className="space-y-1.5">
        {rows.map(({ rowNum, seats: rowSeats }) => (
          <div key={rowNum} className="flex items-center gap-1.5 justify-center">
            <span className="w-5 text-xs text-gray-400">{rowNum}</span>
            {rowSeats.map((seat, idx) => {
              const isSelected = selected.includes(seat.seatNumber);
              return (
                <div key={seat.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={seat.status !== "AVAILABLE"}
                    onClick={() => toggleSeat(seat)}
                    title={seat.seatNumber}
                    style={
                      isSelected
                        ? {
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.35)",
                            transform: "scale(1.12)",
                          }
                        : undefined
                    }
                    className={`relative w-8 h-8 rounded border flex items-center justify-center text-[10px] font-medium transition-all ${
                      isSelected ? "" : seatClasses(seat, COLUMN_ORDER[idx])
                    }`}
                  >
                    {isSelected ? <Check size={14} /> : <SeatIcon seatClass={seat.seatClass} />}
                    {!isSelected && seat.seatClass === "First Class" && (
                      <Briefcase
                        size={9}
                        className="absolute -top-1.5 -right-1.5 bg-white text-gray-400 rounded-full p-[1px] border border-gray-200"
                      />
                    )}
                  </button>
                  {COLUMN_ORDER[idx] === "C" && <span className="w-3" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      )}

      <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-50 border border-green-300 inline-block" /> Matches your preference
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