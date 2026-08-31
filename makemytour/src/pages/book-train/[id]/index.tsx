import { useRouter } from "next/router";
import DynamicPriceCard from "@/components/pricing/DynamicPriceCard";
import ReviewSection from "@/components/reviews/ReviewSection";
import {
  TrainFront,
  Clock,
  Calendar,
  MapPin,
  CreditCard,
  Ticket,
  Zap,
  Armchair,
  Users,
  UtensilsCrossed,
  Plus,
  Minus,
  Printer,
  Download,
  QrCode,
  CheckCircle2,
  Navigation,
  Info,
  X,
  Leaf,
  Drumstick,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { gettrain, handletrainbooking } from "@/api";
import { useDispatch, useSelector } from "react-redux";
import InsuranceAddOn, { InsuranceReceiptBlock, INSURANCE_PREMIUM, generateInsurancePolicyNo } from "@/components/insurance/InsuranceAddOn";
import WishlistButton from "@/components/wishlist/WishlistButton";
interface Train {
  id: string;
  trainName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";

// ---------------------------------------------------------------------------
// Coach classes. Each has a price multiplier applied to the base train fare,
// and a seat layout — "berth" classes (Sleeper/AC) get Lower/Middle/Upper/
// Side Lower/Side Upper berths, non-berth classes get Window/Middle/Aisle.
// ---------------------------------------------------------------------------
interface CoachClass {
  key: string;
  code: string;
  label: string;
  multiplier: number;
  berth: boolean;
  coachPrefix: string;
  coachCount: number;
  units: number; // bays (berth classes) or rows (seat classes)
}

const COACH_CLASSES: CoachClass[] = [
  { key: "general", code: "GEN", label: "General", multiplier: 0.45, berth: false, coachPrefix: "GS", coachCount: 3, units: 9 },
  { key: "local", code: "2S", label: "Local / Passenger", multiplier: 0.3, berth: false, coachPrefix: "D", coachCount: 4, units: 10 },
  { key: "sleeper", code: "SL", label: "Sleeper", multiplier: 1, berth: true, coachPrefix: "S", coachCount: 5, units: 9 },
  { key: "3ac", code: "3A", label: "AC 3 Tier", multiplier: 2.4, berth: true, coachPrefix: "B", coachCount: 4, units: 8 },
  { key: "2ac", code: "2A", label: "AC 2 Tier", multiplier: 3.3, berth: true, coachPrefix: "A", coachCount: 2, units: 8 },
  { key: "1ac", code: "1A", label: "AC First Class", multiplier: 5, berth: true, coachPrefix: "H", coachCount: 1, units: 6 },
  { key: "fc", code: "FC", label: "First Class", multiplier: 3.6, berth: false, coachPrefix: "FC", coachCount: 2, units: 6 },
];

// A "bay" pattern is one compartment as seen in a real coach: a set of
// facing berths plus the two side berths running along the corridor.
interface BerthSlot {
  type: string;
  side: boolean;
}

const BAY_8: BerthSlot[] = [
  { type: "Lower", side: false },
  { type: "Middle", side: false },
  { type: "Upper", side: false },
  { type: "Lower", side: false },
  { type: "Middle", side: false },
  { type: "Upper", side: false },
  { type: "Side Lower", side: true },
  { type: "Side Upper", side: true },
];
const BAY_6: BerthSlot[] = [
  { type: "Lower", side: false },
  { type: "Upper", side: false },
  { type: "Lower", side: false },
  { type: "Upper", side: false },
  { type: "Side Lower", side: true },
  { type: "Side Upper", side: true },
];
const CABIN_4: BerthSlot[] = [
  { type: "Lower", side: false },
  { type: "Upper", side: false },
  { type: "Lower", side: false },
  { type: "Upper", side: false },
];
// A "row" is one bench across the aisle, as in general/chair-car coaches.
const ROW_6: BerthSlot[] = [
  { type: "Window", side: false },
  { type: "Middle", side: false },
  { type: "Aisle", side: false },
  { type: "Aisle", side: false },
  { type: "Middle", side: false },
  { type: "Window", side: false },
];

function bayPatternFor(coachClass: CoachClass): BerthSlot[] {
  if (!coachClass.berth) return ROW_6;
  if (coachClass.key === "2ac") return BAY_6;
  if (coachClass.key === "1ac") return CABIN_4;
  return BAY_8;
}

interface Seat {
  number: string;
  type: string;
  booked: boolean;
  side: boolean;
  bay: number;
}

interface Coach {
  number: string;
  seats: Seat[];
  berth: boolean;
  unitLabel: string; // "Bay" or "Row"
}

function generateCoaches(coachClass: CoachClass, trainId: string): Coach[] {
  const pattern = bayPatternFor(coachClass);
  const seed = (trainId || "").length + coachClass.key.length;
  const coaches: Coach[] = [];

  for (let c = 1; c <= coachClass.coachCount; c++) {
    const coachNumber = `${coachClass.coachPrefix}${c}`;
    const seats: Seat[] = [];
    let seatNum = 1;
    for (let u = 1; u <= coachClass.units; u++) {
      pattern.forEach((slot) => {
        const booked = (seatNum * 7 + seed + c * 3) % 5 === 0;
        seats.push({
          number: `${coachNumber}-${seatNum}`,
          type: slot.type,
          booked,
          side: slot.side,
          bay: u,
        });
        seatNum++;
      });
    }
    coaches.push({
      number: coachNumber,
      seats,
      berth: coachClass.berth,
      unitLabel: coachClass.berth ? "Bay" : "Row",
    });
  }
  return coaches;
}


// ---------------------------------------------------------------------------
// Food menu for e-catering during the journey
// ---------------------------------------------------------------------------
interface FoodItem {
  id: string;
  name: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snacks & Beverages";
  veg: boolean;
  price: number;
}

const FOOD_MENU: FoodItem[] = [
  { id: "f1", name: "Poha with Sev & Chai", category: "Breakfast", veg: true, price: 90 },
  { id: "f2", name: "Idli Sambhar", category: "Breakfast", veg: true, price: 100 },
  { id: "f3", name: "Masala Omelette with Toast", category: "Breakfast", veg: false, price: 120 },
  { id: "f4", name: "Keema Paratha", category: "Breakfast", veg: false, price: 140 },
  { id: "f5", name: "Veg Thali (Dal, Sabzi, Rice, Roti)", category: "Lunch", veg: true, price: 180 },
  { id: "f6", name: "Rajma Chawal", category: "Lunch", veg: true, price: 150 },
  { id: "f7", name: "Chicken Biryani", category: "Lunch", veg: false, price: 240 },
  { id: "f8", name: "Mutton Curry with Rice", category: "Lunch", veg: false, price: 280 },
  { id: "f9", name: "Paneer Butter Masala with Rice", category: "Dinner", veg: true, price: 210 },
  { id: "f10", name: "Veg Pulao with Raita", category: "Dinner", veg: true, price: 170 },
  { id: "f11", name: "Egg Curry with Rice", category: "Dinner", veg: false, price: 190 },
  { id: "f12", name: "Chicken Curry with Roti", category: "Dinner", veg: false, price: 230 },
  { id: "f13", name: "Veg Sandwich", category: "Snacks & Beverages", veg: true, price: 70 },
  { id: "f14", name: "Samosa (2 pcs)", category: "Snacks & Beverages", veg: true, price: 40 },
  { id: "f15", name: "Chicken Sandwich", category: "Snacks & Beverages", veg: false, price: 100 },
  { id: "f16", name: "Chicken Roll", category: "Snacks & Beverages", veg: false, price: 120 },
  { id: "f17", name: "Tea / Coffee", category: "Snacks & Beverages", veg: true, price: 25 },
  { id: "f18", name: "Packaged Drinking Water", category: "Snacks & Beverages", veg: true, price: 20 },
];

function hashToIndex(id: string | undefined, mod: number) {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000003;
  }
  return hash % mod;
}

function generatePNR(bookingId?: string) {
  if (bookingId) return bookingId.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase().padStart(10, "0");
  return Math.floor(1000000000 + Math.random() * 8999999999).toString();
}

// ---------------------------------------------------------------------------
// Live train tracking — mocked from current time vs departure/arrival, since
// there is no real GPS feed. Shows progress, current status and next station.
// ---------------------------------------------------------------------------
function LiveTracking({ train }: { train: Train }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const dep = new Date(train.departureTime).getTime();
  const arr = new Date(train.arrivalTime).getTime();
  const cur = now.getTime();

  let status: "upcoming" | "running" | "completed" = "upcoming";
  let progress = 0;
  if (cur < dep) status = "upcoming";
  else if (cur >= dep && cur <= arr) {
    status = "running";
    progress = arr > dep ? Math.min(100, Math.max(0, ((cur - dep) / (arr - dep)) * 100)) : 0;
  } else {
    status = "completed";
    progress = 100;
  }

  const stationsCount = 5;
  const currentStationIdx = Math.min(
    stationsCount - 1,
    Math.floor((progress / 100) * stationsCount)
  );
  const stationNames = [
    train.from,
    "Junction A",
    "Junction B",
    "Junction C",
    train.to,
  ];
  const delayMinutes = hashToIndex(train.id, 3) * 5; // deterministic mock delay: 0, 5 or 10 min

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-800 font-semibold flex items-center">
          <Navigation className="w-4 h-4 mr-2 text-blue-600" />
          Live Train Status
        </h4>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            status === "running"
              ? "bg-green-100 text-green-700"
              : status === "completed"
              ? "bg-gray-100 text-gray-600"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {status === "running" ? "Running" : status === "completed" ? "Journey Completed" : "Not Yet Started"}
        </span>
      </div>

      <div className="relative mb-2">
        <div className="h-1.5 bg-gray-200 rounded-full">
          <div
            className="h-1.5 bg-blue-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {stationNames.map((s, i) => (
            <div key={s + i} className="flex flex-col items-center" style={{ width: `${100 / stationsCount}%` }}>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  i <= currentStationIdx && status !== "upcoming" ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
              <span className="text-[10px] text-gray-500 mt-1 text-center truncate w-full">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        {status === "running" &&
          `Currently near ${stationNames[currentStationIdx]}${
            delayMinutes > 0 ? ` · Running ${delayMinutes} min late` : " · Running on time"
          }`}
        {status === "upcoming" && "Tracking will begin once the train departs."}
        {status === "completed" && "This train has reached its destination."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// E-Ticket shown after a successful booking, with Print + Download.
// ---------------------------------------------------------------------------
function ETicket({
  train,
  coachClass,
  seats,
  quota,
  pnr,
  grandTotal,
  foodItems,
  insured,
  onClose,
}: {
  train: Train;
  coachClass: CoachClass;
  seats: Seat[];
  quota: "general" | "tatkal";
  pnr: string;
  grandTotal: number;
  foodItems: { name: string; veg: boolean; qty: number; price: number }[];
  insured: boolean;
  onClose: () => void;
}) {
  const insurancePolicyNo = useMemo(() => (insured ? generateInsurancePolicyNo(pnr) : ""), [insured, pnr]);
  const handlePrint = () => window.print();

  const handleDownload = () => {
    const foodRows = foodItems.length
      ? `<tr><td class="label">Meals Ordered</td><td>${foodItems
          .map((f) => `${f.name} × ${f.qty} (${f.veg ? "Veg" : "Non-Veg"}) — ₹${f.price * f.qty}`)
          .join("<br/>")}</td></tr>`
      : "";
    const insuranceRow = insured ? `<tr><td class="label">Travel Insurance</td><td>Policy ${insurancePolicyNo} · ₹${INSURANCE_PREMIUM}</td></tr>` : "";
    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>E-Ticket ${pnr}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111}
        .card{border:1px solid #e5e7eb;border-radius:12px;padding:20px;max-width:560px}
        h1{font-size:18px;margin:0 0 4px}
        .muted{color:#6b7280;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        td{padding:6px 0;font-size:13px;vertical-align:top}
        .label{color:#6b7280;white-space:nowrap;padding-right:12px}
        .total{font-size:16px;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
      </style></head><body>
      <div class="card">
        <h1>${train.trainName}</h1>
        <p class="muted">PNR: ${pnr}</p>
        <table>
          <tr><td class="label">From</td><td>${train.from}</td></tr>
          <tr><td class="label">To</td><td>${train.to}</td></tr>
          <tr><td class="label">Departure</td><td>${new Date(train.departureTime).toLocaleString()}</td></tr>
          <tr><td class="label">Arrival</td><td>${new Date(train.arrivalTime).toLocaleString()}</td></tr>
          <tr><td class="label">Class</td><td>${coachClass.label} (${coachClass.code})</td></tr>
          <tr><td class="label">Quota</td><td>${quota === "tatkal" ? "Tatkal" : "General"}</td></tr>
          <tr><td class="label">Seats</td><td>${seats.map((s) => `${s.number} (${s.type})`).join(", ")}</td></tr>
          ${foodRows}
          ${insuranceRow}
        </table>
        <p class="total">Total Paid: ₹ ${grandTotal.toLocaleString()}</p>
      </div>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${pnr}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:static print:p-0">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={20} />
            Booking Confirmed
          </div>
          <button onClick={onClose} className="hover:opacity-80">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{train.trainName}</h3>
              <p className="text-gray-500 text-sm">PNR: <span className="font-mono font-semibold text-gray-800">{pnr}</span></p>
            </div>
            <div className="border border-gray-200 rounded-lg p-1.5">
              <QrCode size={56} className="text-gray-800" />
            </div>
          </div>

          <div className="flex items-center justify-between border-y border-dashed border-gray-200 py-3 mb-3">
            <div>
              <p className="text-lg font-bold">{train.from}</p>
              <p className="text-xs text-gray-500">{new Date(train.departureTime).toLocaleString()}</p>
            </div>
            <TrainFront className="text-blue-600" size={20} />
            <div className="text-right">
              <p className="text-lg font-bold">{train.to}</p>
              <p className="text-xs text-gray-500">{new Date(train.arrivalTime).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-400 text-[11px] uppercase">Class</p>
              <p className="font-medium">{coachClass.label} ({coachClass.code})</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px] uppercase">Quota</p>
              <p className="font-medium flex items-center gap-1">
                {quota === "tatkal" && <Zap size={13} className="text-amber-500" />}
                {quota === "tatkal" ? "Tatkal" : "General"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 text-[11px] uppercase">Seats</p>
              <p className="font-medium">{seats.map((s) => `${s.number} (${s.type})`).join(", ")}</p>
            </div>
          </div>

          {foodItems.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-400 text-[11px] uppercase mb-1.5">Meals Ordered</p>
              <div className="space-y-1">
                {foodItems.map((f) => (
                  <div key={f.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      {f.veg ? (
                        <Leaf size={12} className="text-green-600" />
                      ) : (
                        <Drumstick size={12} className="text-red-500" />
                      )}
                      {f.name} × {f.qty}
                    </span>
                    <span className="text-gray-500">₹{f.price * f.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insured && <InsuranceReceiptBlock policyNo={insurancePolicyNo} />}

          <div className="flex justify-between items-center border-t border-gray-100 pt-3 mb-5">
            <span className="text-gray-600 text-sm">Total Paid</span>
            <span className="text-xl font-bold">₹ {grandTotal.toLocaleString()}</span>
          </div>

          <div className="flex gap-3 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex-1 flex items-center gap-2">
              <Printer size={16} /> Print
            </Button>
            <Button onClick={handleDownload} className="flex-1 flex items-center gap-2 bg-blue-600 text-white">
              <Download size={16} /> Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const BookTrainPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setopem] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  const [coachKey, setCoachKey] = useState<string>("sleeper");
  const [quota, setQuota] = useState<"general" | "tatkal">("general");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [foodEnabled, setFoodEnabled] = useState(false);
  const [foodCart, setFoodCart] = useState<Record<string, number>>({});
  const [foodFilter, setFoodFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [insured, setInsured] = useState(false);
  const [ticketData, setTicketData] = useState<{
    coachClass: CoachClass;
    seats: Seat[];
    quota: "general" | "tatkal";
    pnr: string;
    grandTotal: number;
    foodItems: { name: string; veg: boolean; qty: number; price: number }[];
    insured: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const data = await gettrain();
        const filteredData = data.filter((train: any) => train.id === id);
        setTrains(filteredData);
      } catch (error) {
        console.error("Error fetching trains:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrains();
  }, [id, user]);

  const coachClass = COACH_CLASSES.find((c) => c.key === coachKey) || COACH_CLASSES[2];
  const train = trains[0];

  const coaches = useMemo(() => {
    if (!train) return [];
    return generateCoaches(coachClass, train.id);
  }, [train, coachClass]);

  const [activeCoachNumber, setActiveCoachNumber] = useState<string>("");
  useEffect(() => {
    if (coaches.length > 0) setActiveCoachNumber(coaches[0].number);
  }, [coaches]);

  const activeCoach = coaches.find((c) => c.number === activeCoachNumber) || coaches[0];
  const seats = activeCoach?.seats || [];

  // reset seat selection whenever the class, quota, or active coach changes
  useEffect(() => {
    setSelectedSeats([]);
  }, [coachKey, quota, activeCoachNumber]);

  if (loading) {
    return <Loader />;
  }
  if (!train) {
    return <div>No train data available for this ID.</div>;
  }

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options);
  };

  const durationLabel = (() => {
    const ms = new Date(train.arrivalTime).getTime() - new Date(train.departureTime).getTime();
    if (isNaN(ms) || ms <= 0) return null;
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.round((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  })();

  const toggleSeat = (seat: Seat) => {
    if (seat.booked) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seat.number)) return prev.filter((s) => s !== seat.number);
      if (prev.length >= passengerCount) {
        // replace the earliest pick so selection count stays == passengerCount
        return [...prev.slice(1), seat.number];
      }
      return [...prev, seat.number];
    });
  };

  const changeFoodQty = (id: string, delta: number) => {
    setFoodCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] || 0) + delta;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const perSeatFare = Math.round(train.price * coachClass.multiplier);
  const tatkalPremium = quota === "tatkal" ? Math.round(perSeatFare * 0.3) : 0;
  const seatFareTotal = (perSeatFare + tatkalPremium) * passengerCount;
  const foodTotal = Object.entries(foodCart).reduce((sum, [id, qty]) => {
    const item = FOOD_MENU.find((f) => f.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const subtotal = seatFareTotal + foodTotal;
  const taxes = Math.round(subtotal * 0.05);
  const insuranceFee = insured ? INSURANCE_PREMIUM : 0;
  const grandTotal = subtotal + taxes + insuranceFee;

  const seatsReady = selectedSeats.length === passengerCount;

  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handletrainbooking(
        user?.id,
        train?.id,
        passengerCount,
        grandTotal,
        perSeatFare + tatkalPremium
      );
      const updateuser = {
        ...user,
        bookings: [...user.bookings, data],
      };
      dispatch(setUser(updateuser));
      setopem(false);
      const bookedSeats = seats.filter((s) => selectedSeats.includes(s.number));
      const orderedFoodItems = Object.entries(foodCart)
        .map(([fid, qty]) => {
          const item = FOOD_MENU.find((f) => f.id === fid);
          return item ? { name: item.name, veg: item.veg, qty, price: item.price } : null;
        })
        .filter((f): f is { name: string; veg: boolean; qty: number; price: number } => f !== null);
      setTicketData({
        coachClass,
        seats: bookedSeats,
        quota,
        pnr: generatePNR(data?.id),
        grandTotal,
        foodItems: orderedFoodItems,
        insured,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const BookingContent = () => (
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <TrainFront className="w-6 h-6 mr-2" />
          Confirm Train Booking
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center">
              <TrainFront className="w-4 h-4 mr-2" />
              Train Name
            </Label>
            <Input value={train?.trainName} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Route
            </Label>
            <Input value={`${train?.from} → ${train?.to}`} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <Armchair className="w-4 h-4 mr-2" />
              Class & Quota
            </Label>
            <Input value={`${coachClass.label} (${coachClass.code}) · Coach ${activeCoachNumber} · ${quota === "tatkal" ? "Tatkal" : "General"}`} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              Seats
            </Label>
            <Input value={selectedSeats.join(", ")} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Departure
            </Label>
            <Input value={new Date(train.departureTime).toLocaleString()} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Arrival
            </Label>
            <Input value={new Date(train.arrivalTime).toLocaleString()} readOnly />
          </div>
        </div>

        {foodTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1 flex items-center">
              <UtensilsCrossed size={14} className="mr-1.5" /> Meals ordered
            </p>
            {Object.entries(foodCart).map(([id, qty]) => {
              const item = FOOD_MENU.find((f) => f.id === id);
              if (!item) return null;
              return (
                <div key={id} className="flex justify-between text-gray-600">
                  <span>{item.name} × {qty}</span>
                  <span>₹{item.price * qty}</span>
                </div>
              );
            })}
          </div>
        )}

        <InsuranceAddOn checked={insured} onChange={setInsured} />

        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Fare Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Seat Fare ({passengerCount} × ₹{perSeatFare + tatkalPremium})</span>
              <span className="font-medium">₹ {seatFareTotal.toLocaleString()}</span>
            </div>
            {foodTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Food & Beverages</span>
                <span className="font-medium">₹ {foodTotal.toLocaleString()}</span>
              </div>
            )}
            {insured && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Travel Insurance</span>
                <span className="font-medium">₹ {insuranceFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxes and Fees</span>
              <span className="font-medium">₹ {taxes.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-lg">₹ {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <Button className="w-full bg-blue-600 text-white" onClick={handlebooking}>
          Confirm & Pay
        </Button>
      </div>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrainFront className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold">{train.trainName}</h1>
                  <p className="text-gray-600">
                    {train.from} → {train.to}
                  </p>
                </div>
              </div>
              <WishlistButton userId={user?.id} type="Train" entityId={train.id} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Departure: {formatDate(train.departureTime)}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Arrival: {formatDate(train.arrivalTime)}
              </div>
            </div>
            {durationLabel && (
              <p className="text-xs text-gray-400 mb-4">Journey duration: {durationLabel}</p>
            )}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-600 text-sm">Available Seats: </span>
                <span className="font-semibold">{train.availableSeats}</span>
              </div>
              <div className="text-xl font-bold">₹ {train.price.toLocaleString()} base</div>
            </div>
          </div>

          <LiveTracking train={train} />

          {/* Quota */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
              <Ticket className="w-4 h-4 mr-2 text-blue-600" />
              Booking Quota
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQuota("general")}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  quota === "general" ? "border-blue-600 shadow-md" : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <p className="font-semibold text-sm">General Quota</p>
                <p className="text-xs text-gray-500">Standard fare, opens as soon as booking starts</p>
              </button>
              <button
                type="button"
                onClick={() => setQuota("tatkal")}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  quota === "tatkal" ? "border-amber-500 shadow-md bg-amber-50" : "border-gray-200 hover:border-amber-300"
                }`}
              >
                <p className="font-semibold text-sm flex items-center gap-1">
                  <Zap size={13} className="text-amber-500" /> Tatkal
                </p>
                <p className="text-xs text-gray-500">+30% premium · opens 1 day before journey, 10/11 AM</p>
              </button>
            </div>
          </div>

          {/* Coach class */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
              <Armchair className="w-4 h-4 mr-2 text-blue-600" />
              Choose Coach / Class
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COACH_CLASSES.map((c) => {
                const fare = Math.round(train.price * c.multiplier);
                const isSelected = c.key === coachKey;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCoachKey(c.key)}
                    className={`rounded-xl border-2 p-3 text-left transition-all bg-white ${
                      isSelected ? "border-blue-600 shadow-md" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <p className="font-semibold text-sm">{c.code}</p>
                    <p className="text-[11px] text-gray-500 mb-1.5">{c.label}</p>
                    <p className="font-bold text-blue-700 text-sm">₹{fare.toLocaleString()}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Passengers + seat map */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-gray-800 font-semibold flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Passengers & Seat Selection
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  onClick={() => setPassengerCount((n) => Math.max(1, n - 1))}
                >
                  <Minus size={14} />
                </button>
                <span className="font-semibold w-5 text-center">{passengerCount}</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  onClick={() => setPassengerCount((n) => Math.min(6, n + 1))}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Coach tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              {coaches.map((c) => (
                <button
                  key={c.number}
                  type="button"
                  onClick={() => setActiveCoachNumber(c.number)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                    activeCoachNumber === c.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  <TrainFront size={14} />
                  Coach {c.number}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Selected</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300 inline-block" /> Booked</span>
            </div>

            {activeCoach && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60 mb-2 overflow-x-auto">
                <p className="text-xs font-semibold text-gray-500 mb-3">
                  Coach {activeCoach.number} layout
                  {activeCoach.berth ? " — facing berths + side berths per bay" : " — bench seating either side of the aisle"}
                </p>

                <div className="space-y-3 min-w-[420px]">
                  {Array.from(new Set(seats.map((s) => s.bay))).map((bayNum) => {
                    const baySeats = seats.filter((s) => s.bay === bayNum);
                    const mainSeats = baySeats.filter((s) => !s.side);
                    const sideSeats = baySeats.filter((s) => s.side);

                    const SeatBtn = ({ seat }: { seat: Seat }) => {
                      const isSelected = selectedSeats.includes(seat.number);
                      return (
                        <button
                          type="button"
                          disabled={seat.booked}
                          onClick={() => toggleSeat(seat)}
                          title={`${seat.number} · ${seat.type}`}
                          className={`rounded-lg border text-[10px] py-2 px-1 w-full flex flex-col items-center transition-all ${
                            seat.booked
                              ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                          }`}
                        >
                          <Armchair size={13} />
                          <span className="font-medium mt-0.5">{seat.number.split("-")[1]}</span>
                          <span className="text-[9px] opacity-80 leading-tight text-center">{seat.type}</span>
                        </button>
                      );
                    };

                    if (activeCoach.berth) {
                      return (
                        <div key={bayNum} className="flex items-stretch gap-2 bg-white rounded-lg border border-gray-100 p-2">
                          <span className="text-[10px] text-gray-400 font-medium self-center w-8 shrink-0">Bay {bayNum}</span>
                          <div
                            className="grid gap-1.5 flex-1"
                            style={{ gridTemplateColumns: `repeat(${mainSeats.length / 2}, minmax(0, 1fr))` }}
                          >
                            {mainSeats.map((seat) => (
                              <SeatBtn key={seat.number} seat={seat} />
                            ))}
                          </div>
                          {sideSeats.length > 0 && (
                            <div className="flex flex-col gap-1.5 w-16 shrink-0 border-l border-dashed border-gray-200 pl-2">
                              {sideSeats.map((seat) => (
                                <SeatBtn key={seat.number} seat={seat} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Non-berth: bench row with an aisle gap down the middle
                    const left = mainSeats.slice(0, mainSeats.length / 2);
                    const right = mainSeats.slice(mainSeats.length / 2);
                    return (
                      <div key={bayNum} className="flex items-stretch gap-2 bg-white rounded-lg border border-gray-100 p-2">
                        <span className="text-[10px] text-gray-400 font-medium self-center w-8 shrink-0">Row {bayNum}</span>
                        <div className="grid grid-cols-3 gap-1.5 flex-1">
                          {left.map((seat) => (
                            <SeatBtn key={seat.number} seat={seat} />
                          ))}
                        </div>
                        <div className="w-4 shrink-0 flex items-center justify-center">
                          <div className="w-px h-full border-l border-dashed border-gray-200" />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 flex-1">
                          {right.map((seat) => (
                            <SeatBtn key={seat.number} seat={seat} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Info size={12} />
              {seatsReady
                ? `${selectedSeats.length} seat(s) selected in Coach ${activeCoachNumber}.`
                : `Select ${passengerCount} seat(s) in Coach ${activeCoachNumber} — ${selectedSeats.length} chosen so far.`}
            </p>
          </div>

          {/* Food ordering */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-gray-800 font-semibold flex items-center">
                <UtensilsCrossed className="w-4 h-4 mr-2 text-blue-600" />
                Order Food for Your Journey
              </h4>
              <button
                type="button"
                onClick={() => setFoodEnabled((v) => !v)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                  foodEnabled ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"
                }`}
              >
                {foodEnabled ? "Food Added" : "Add Meals"}
              </button>
            </div>

            {foodEnabled && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFoodFilter("all")}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                      foodFilter === "all" ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoodFilter("veg")}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border ${
                      foodFilter === "veg" ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-600"
                    }`}
                  >
                    <Leaf size={12} /> Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoodFilter("nonveg")}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border ${
                      foodFilter === "nonveg" ? "bg-red-500 text-white border-red-500" : "border-gray-300 text-gray-600"
                    }`}
                  >
                    <Drumstick size={12} /> Non-Veg
                  </button>
                </div>

                {["Breakfast", "Lunch", "Dinner", "Snacks & Beverages"].map((cat) => {
                  const items = FOOD_MENU.filter(
                    (f) =>
                      f.category === cat &&
                      (foodFilter === "all" || (foodFilter === "veg" ? f.veg : !f.veg))
                  );
                  if (items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{cat}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.map((item) => {
                          const qty = foodCart[item.id] || 0;
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between border border-gray-100 rounded-lg p-2.5"
                            >
                              <div className="flex items-start gap-2">
                                {item.veg ? (
                                  <Leaf size={14} className="text-green-600 mt-0.5" />
                                ) : (
                                  <Drumstick size={14} className="text-red-500 mt-0.5" />
                                )}
                                <div>
                                  <p className="text-sm font-medium leading-tight">{item.name}</p>
                                  <p className="text-xs text-gray-500">₹{item.price}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => changeFoodQty(item.id, -1)}
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30"
                                  disabled={qty === 0}
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-4 text-center text-sm">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => changeFoodQty(item.id, 1)}
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ReviewSection serviceType="Train" serviceId={id as string} />
        </div>

        {/* Sticky booking sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
              <h4 className="font-semibold text-gray-800 mb-3">Fare Summary</h4>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Class</span>
                  <span className="font-medium">{coachClass.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quota</span>
                  <span className="font-medium">{quota === "tatkal" ? "Tatkal" : "General"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-medium">{passengerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat Fare</span>
                  <span className="font-medium">₹{seatFareTotal.toLocaleString()}</span>
                </div>
                {foodTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Food</span>
                    <span className="font-medium">₹{foodTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium">₹{taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Dialog open={open} onOpenChange={setopem}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 text-white py-3" disabled={!seatsReady}>
                    {seatsReady ? "Book Now" : `Select ${passengerCount} Seat(s)`}
                  </Button>
                </DialogTrigger>
                {user ? (
                  <BookingContent />
                ) : (
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Login Required</DialogTitle>
                    </DialogHeader>
                    <p>Please log in to continue with your booking.</p>
                    <SignupDialog trigger={<Button className="w-full">Log In / Sign Up</Button>} />
                  </DialogContent>
                )}
              </Dialog>
            </div>
            <DynamicPriceCard
              entityType="TRAIN"
              entityId={id as string}
              userId={user?.id}
              variantLabel={`${coachClass.label} (${coachClass.code})`}
              variantPrice={perSeatFare + tatkalPremium}
            />
          </div>
        </div>
      </div>

      {ticketData && (
        <ETicket
          train={train}
          coachClass={ticketData.coachClass}
          seats={ticketData.seats}
          quota={ticketData.quota}
          pnr={ticketData.pnr}
          grandTotal={ticketData.grandTotal}
          foodItems={ticketData.foodItems}
          insured={ticketData.insured}
          onClose={() => {
            setTicketData(null);
            router.push("/profile");
          }}
        />
      )}
    </div>
  );
};

export default BookTrainPage;