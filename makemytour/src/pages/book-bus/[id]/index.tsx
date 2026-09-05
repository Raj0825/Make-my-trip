import { useRouter } from "next/router";
import DynamicPriceCard from "@/components/pricing/DynamicPriceCard";
import ReviewSection from "@/components/reviews/ReviewSection";
import {
  Bus as BusIcon,
  Clock,
  Calendar,
  MapPin,
  CreditCard,
  Ticket,
  Snowflake,
  Armchair,
  BedDouble,
  UtensilsCrossed,
  ShieldCheck,
  Camera,
  Siren,
  Wifi,
  BatteryCharging,
  Droplets,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  Printer,
  Download,
  QrCode,
  CheckCircle2,
  X,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getbus, handlebusbooking } from "@/api";
import { useDispatch, useSelector } from "react-redux";
import InsuranceAddOn, { InsuranceReceiptBlock, INSURANCE_PREMIUM, generateInsurancePolicyNo } from "@/components/insurance/InsuranceAddOn";
import WishlistButton from "@/components/wishlist/WishlistButton";
import PromoCodeInput from "@/components/promo/PromoCodeInput";
import PassengerDetailsForm, { PassengerInfo } from "@/components/passengers/PassengerDetailsForm";
interface Bus {
  id: string;
  busName: string;
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
// Bus "class" = AC/Non-AC × Seater/Sleeper combination. Each has a fare
// multiplier applied to the base bus price and its own seat layout.
// ---------------------------------------------------------------------------
interface BusClass {
  key: string;
  label: string;
  ac: boolean;
  seatType: "seater" | "sleeper";
  multiplier: number;
}

const BUS_CLASSES: BusClass[] = [
  { key: "ac_seater", label: "AC Seater", ac: true, seatType: "seater", multiplier: 1 },
  { key: "ac_sleeper", label: "AC Sleeper", ac: true, seatType: "sleeper", multiplier: 1.8 },
  { key: "nonac_seater", label: "Non-AC Seater", ac: false, seatType: "seater", multiplier: 0.65 },
  { key: "nonac_sleeper", label: "Non-AC Sleeper", ac: false, seatType: "sleeper", multiplier: 1.3 },
];

interface BusSeat {
  number: string;
  type: string;
  booked: boolean;
  deckLabel: string;
  row: number;
  double: boolean;
}

// Seater buses: single deck, 2+2 rows (Window/Aisle either side)
function generateSeaterSeats(busId: string): BusSeat[] {
  const rows = 10;
  const seed = (busId || "").length;
  const seats: BusSeat[] = [];
  let n = 1;
  for (let r = 1; r <= rows; r++) {
    (["Window", "Aisle", "Aisle", "Window"] as const).forEach((type) => {
      const booked = (n * 7 + seed) % 5 === 0;
      seats.push({ number: `S${n}`, type, booked, deckLabel: "Main Deck", row: r, double: false });
      n++;
    });
  }
  return seats;
}

// Sleeper buses: Lower Deck + Upper Deck, each row = 1 single berth + 1 double (couple) berth
function generateSleeperSeats(busId: string): BusSeat[] {
  const rowsPerDeck = 6;
  const seed = (busId || "").length;
  const seats: BusSeat[] = [];
  (["Lower Deck", "Upper Deck"] as const).forEach((deckLabel, deckIdx) => {
    let n = 1;
    for (let r = 1; r <= rowsPerDeck; r++) {
      const prefix = deckIdx === 0 ? "L" : "U";
      const single = `${prefix}${n}`;
      const singleBooked = (n * 7 + seed + deckIdx) % 5 === 0;
      seats.push({ number: single, type: "Single Berth", booked: singleBooked, deckLabel, row: r, double: false });
      n++;
      ["A", "B"].forEach((suffix) => {
        const num = `${prefix}${n}${suffix}`;
        const booked = (n * 11 + seed + deckIdx + suffix.charCodeAt(0)) % 5 === 0;
        seats.push({ number: num, type: "Double Berth", booked, deckLabel, row: r, double: true });
      });
      n++;
    }
  });
  return seats;
}

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
// Photo bank, route stops, boarding points, and safety/amenity data —
// deterministically derived per bus id so every listing renders rich,
// distinct, consistent content with zero backend schema changes.
// ---------------------------------------------------------------------------
const BUS_PHOTO_SETS: string[][] = [
  [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
  ],
];

const SAFETY_FEATURES = [
  { icon: Camera, label: "CCTV Onboard" },
  { icon: Navigation, label: "Live GPS Tracking" },
  { icon: ShieldCheck, label: "Verified Driver" },
  { icon: Siren, label: "SOS Emergency Button" },
];

interface Amenity {
  icon: any;
  label: string;
}

function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (!photos || photos.length === 0) return null;
  return (
    <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden group mb-6">
      <img src={photos[index]} alt={name} className="w-full h-full object-cover" />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {index + 1}/{photos.length}
          </span>
        </>
      )}
    </div>
  );
}

// Live route tracking, mocked from current time vs departure/arrival.
function RouteTracking({ bus, stops }: { bus: Bus; stops: { name: string; time: string }[] }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const dep = new Date(bus.departureTime).getTime();
  const arr = new Date(bus.arrivalTime).getTime();
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

  const currentStopIdx = Math.min(stops.length - 1, Math.floor((progress / 100) * stops.length));
  const delayMinutes = hashToIndex(bus.id, 3) * 5;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-800 font-semibold flex items-center">
          <Navigation className="w-4 h-4 mr-2 text-blue-600" />
          Live Bus Tracking
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
          {status === "running" ? "On the Road" : status === "completed" ? "Trip Completed" : "Not Yet Started"}
        </span>
      </div>
      <div className="relative mb-2">
        <div className="h-1.5 bg-gray-200 rounded-full">
          <div className="h-1.5 bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {stops.map((s, i) => (
            <div key={s.name + i} className="flex flex-col items-center" style={{ width: `${100 / stops.length}%` }}>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  i <= currentStopIdx && status !== "upcoming" ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
              <span className="text-[10px] text-gray-500 mt-1 text-center truncate w-full">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        {status === "running" &&
          `Currently near ${stops[currentStopIdx]?.name}${
            delayMinutes > 0 ? ` · Running ${delayMinutes} min late` : " · Running on time"
          }`}
        {status === "upcoming" && "Tracking will begin once the bus departs."}
        {status === "completed" && "This bus has reached its destination."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// E-Ticket shown after a successful booking, with Print + Download.
// ---------------------------------------------------------------------------
function ETicket({
  bus,
  busClass,
  seats,
  boardingPoint,
  pnr,
  grandTotal,
  insured,
  onClose,
}: {
  bus: Bus;
  busClass: BusClass;
  seats: BusSeat[];
  boardingPoint: string;
  pnr: string;
  grandTotal: number;
  insured: boolean;
  onClose: () => void;
}) {
  const insurancePolicyNo = useMemo(() => (insured ? generateInsurancePolicyNo(pnr) : ""), [insured, pnr]);
  const handlePrint = () => window.print();

  const handleDownload = () => {
    const insuranceRow = insured ? `<tr><td class="label">Travel Insurance</td><td>Policy ${insurancePolicyNo} · ₹${INSURANCE_PREMIUM}</td></tr>` : "";
    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>Bus Ticket ${pnr}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111}
        .card{border:1px solid #e5e7eb;border-radius:12px;padding:20px;max-width:560px}
        h1{font-size:18px;margin:0 0 4px}
        .muted{color:#6b7280;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        td{padding:6px 0;font-size:13px}
        .label{color:#6b7280}
        .total{font-size:16px;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
      </style></head><body>
      <div class="card">
        <h1>${bus.busName}</h1>
        <p class="muted">PNR: ${pnr}</p>
        <table>
          <tr><td class="label">From</td><td>${bus.from}</td></tr>
          <tr><td class="label">To</td><td>${bus.to}</td></tr>
          <tr><td class="label">Departure</td><td>${new Date(bus.departureTime).toLocaleString()}</td></tr>
          <tr><td class="label">Arrival</td><td>${new Date(bus.arrivalTime).toLocaleString()}</td></tr>
          <tr><td class="label">Boarding Point</td><td>${boardingPoint}</td></tr>
          <tr><td class="label">Bus Type</td><td>${busClass.label}</td></tr>
          <tr><td class="label">Seats</td><td>${seats.map((s) => `${s.number} (${s.type})`).join(", ")}</td></tr>
          ${insuranceRow}
        </table>
        <p class="total">Total Paid: ₹ ${grandTotal.toLocaleString()}</p>
      </div>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bus-ticket-${pnr}.html`;
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
              <h3 className="text-xl font-bold">{bus.busName}</h3>
              <p className="text-gray-500 text-sm">
                PNR: <span className="font-mono font-semibold text-gray-800">{pnr}</span>
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-1.5">
              <QrCode size={56} className="text-gray-800" />
            </div>
          </div>

          <div className="flex items-center justify-between border-y border-dashed border-gray-200 py-3 mb-3">
            <div>
              <p className="text-lg font-bold">{bus.from}</p>
              <p className="text-xs text-gray-500">{new Date(bus.departureTime).toLocaleString()}</p>
            </div>
            <BusIcon className="text-blue-600" size={20} />
            <div className="text-right">
              <p className="text-lg font-bold">{bus.to}</p>
              <p className="text-xs text-gray-500">{new Date(bus.arrivalTime).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-400 text-[11px] uppercase">Bus Type</p>
              <p className="font-medium">{busClass.label}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px] uppercase">Boarding Point</p>
              <p className="font-medium">{boardingPoint}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 text-[11px] uppercase">Seats</p>
              <p className="font-medium">{seats.map((s) => `${s.number} (${s.type})`).join(", ")}</p>
            </div>
          </div>

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

const BookBusPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setopem] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  const [busClassKey, setBusClassKey] = useState<string>("ac_seater");
  const [activeDeck, setActiveDeck] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [boardingPoint, setBoardingPoint] = useState<string>("");
  const [insured, setInsured] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [ticketData, setTicketData] = useState<{
    busClass: BusClass;
    seats: BusSeat[];
    boardingPoint: string;
    pnr: string;
    grandTotal: number;
    insured: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await getbus();
        const filteredData = data.filter((bus: any) => bus.id === id);
        setBuses(filteredData);
      } catch (error) {
        console.error("Error fetching buses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, [id, user]);

  const bus = buses[0];
  const busClass = BUS_CLASSES.find((c) => c.key === busClassKey) || BUS_CLASSES[0];

  const allSeats = useMemo(() => {
    if (!bus) return [];
    return busClass.seatType === "sleeper" ? generateSleeperSeats(bus.id) : generateSeaterSeats(bus.id);
  }, [bus, busClass]);

  const decks = useMemo(() => Array.from(new Set(allSeats.map((s) => s.deckLabel))), [allSeats]);

  useEffect(() => {
    if (decks.length > 0) setActiveDeck(decks[0]);
  }, [decks]);

  useEffect(() => {
    setSelectedSeats([]);
  }, [busClassKey, activeDeck]);

  const deckSeats = allSeats.filter((s) => s.deckLabel === activeDeck);

  // Photos, route stops, boarding points, safety/amenities derived per bus id
  const photoSetIndex = hashToIndex(bus?.id, BUS_PHOTO_SETS.length);
  const photos = useMemo(() => BUS_PHOTO_SETS[photoSetIndex], [photoSetIndex]);

  const routeStops = useMemo(() => {
    if (!bus) return [];
    const dep = new Date(bus.departureTime).getTime();
    const arr = new Date(bus.arrivalTime).getTime();
    const names = [bus.from, "Midway Junction", "Highway Rest Stop", bus.to];
    const validDuration = arr > dep;
    return names.map((name, i) => {
      const t = validDuration ? new Date(dep + ((arr - dep) * i) / (names.length - 1)) : null;
      return { name, time: t ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--" };
    });
  }, [bus]);

  const boardingPoints = useMemo(() => {
    if (!bus) return [];
    return [
      { name: `${bus.from} Main Bus Stand`, time: routeStops[0]?.time || "" },
      { name: `${bus.from} Bypass`, time: routeStops[0]?.time || "" },
    ];
  }, [bus, routeStops]);

  useEffect(() => {
    if (boardingPoints.length > 0 && !boardingPoint) setBoardingPoint(boardingPoints[0].name);
  }, [boardingPoints, boardingPoint]);

  const foodAvailable = hashToIndex(bus?.id, 3) !== 0; // ~2/3 of buses serve a meal stop
  const amenities: Amenity[] = useMemo(() => {
    const list: Amenity[] = [];
    if (busClass.ac) list.push({ icon: Snowflake, label: "Air Conditioned" });
    list.push({ icon: BatteryCharging, label: "Charging Point" });
    if (busClass.ac) list.push({ icon: Wifi, label: "Onboard Wifi" });
    list.push({ icon: Droplets, label: "Water Bottle" });
    if (busClass.seatType === "sleeper") list.push({ icon: BedDouble, label: "Blanket & Pillow" });
    return list;
  }, [busClass]);

  if (loading) {
    return <Loader />;
  }
  if (!bus) {
    return <div>No bus data available for this ID.</div>;
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

  const toggleSeat = (seat: BusSeat) => {
    if (seat.booked) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seat.number)) return prev.filter((s) => s !== seat.number);
      if (prev.length >= passengerCount) return [...prev.slice(1), seat.number];
      return [...prev, seat.number];
    });
  };

  const perSeatFare = Math.round(bus.price * busClass.multiplier);
  const seatFareTotal = perSeatFare * passengerCount;
  const taxes = Math.round(seatFareTotal * 0.05);
  const insuranceFee = insured ? INSURANCE_PREMIUM : 0;
  const grandTotal = Math.max(0, seatFareTotal + taxes + insuranceFee - promoDiscount);
  const seatsReady = selectedSeats.length === passengerCount;
  const passengersReady = passengers.length === passengerCount && passengers.every((p) => p.name.trim() !== "" && p.age.trim() !== "");

  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handlebusbooking(user?.id, bus?.id, passengerCount, grandTotal, perSeatFare, passengers);
      const updateuser = { ...user, bookings: [...user.bookings, data] };
      dispatch(setUser(updateuser));
      setopem(false);
      const bookedSeats = allSeats.filter((s) => selectedSeats.includes(s.number));
      setTicketData({
        busClass,
        seats: bookedSeats,
        boardingPoint,
        pnr: generatePNR(data?.id),
        grandTotal,
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
          <BusIcon className="w-6 h-6 mr-2" />
          Confirm Bus Booking
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center">
              <BusIcon className="w-4 h-4 mr-2" />
              Bus Name
            </Label>
            <Input value={bus?.busName} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Route
            </Label>
            <Input value={`${bus?.from} → ${bus?.to}`} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <Armchair className="w-4 h-4 mr-2" />
              Bus Type
            </Label>
            <Input value={busClass.label} readOnly />
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
              <MapPin className="w-4 h-4 mr-2" />
              Boarding Point
            </Label>
            <Input value={boardingPoint} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Departure
            </Label>
            <Input value={new Date(bus.departureTime).toLocaleString()} readOnly />
          </div>
        </div>

        <InsuranceAddOn checked={insured} onChange={setInsured} />

        <PassengerDetailsForm count={passengerCount} passengers={passengers} onChange={setPassengers} />

        <PromoCodeInput
          subtotal={seatFareTotal + insuranceFee}
          appliedCode={promoCode}
          discount={promoDiscount}
          onApply={(code, discount) => { setPromoCode(code); setPromoDiscount(discount); }}
          onRemove={() => { setPromoCode(null); setPromoDiscount(0); }}
        />

        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Fare Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Seat Fare ({passengerCount} × ₹{perSeatFare})
              </span>
              <span className="font-medium">₹ {seatFareTotal.toLocaleString()}</span>
            </div>
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
            {promoDiscount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Promo ({promoCode})</span>
                <span className="font-medium">- ₹ {promoDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-lg">₹ {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <Button className="w-full bg-blue-600 text-white" onClick={handlebooking} disabled={!passengersReady}>
          {passengersReady ? "Confirm & Pay" : "Enter traveler details to continue"}
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
                <BusIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold">{bus.busName}</h1>
                  <p className="text-gray-600">
                    {bus.from} → {bus.to}
                  </p>
                </div>
              </div>
              <WishlistButton userId={user?.id} type="Bus" entityId={bus.id} />
            </div>

            <PhotoGallery photos={photos} name={bus.busName} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Departure: {formatDate(bus.departureTime)}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Arrival: {formatDate(bus.arrivalTime)}
              </div>
            </div>

            {/* Safety strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {SAFETY_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <Icon className="w-5 h-5 mb-1 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </div>

            {/* Food + amenities */}
            <div className="mb-2 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                <UtensilsCrossed className="w-4 h-4 mr-2 text-blue-600" />
                Food
              </h4>
              <p className="text-gray-600 text-sm">
                {foodAvailable
                  ? "Meal break included at a highway restaurant along the route (charges may apply for à la carte items)."
                  : "No meal stop on this route — please carry your own food or plan a quick stop."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {amenities.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                  <Icon size={13} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <RouteTracking bus={bus} stops={routeStops} />

          {/* Route & stops */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              Route & Stops
            </h4>
            <div className="space-y-0">
              {routeStops.map((stop, i) => (
                <div key={stop.name + i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${i === 0 || i === routeStops.length - 1 ? "bg-blue-600" : "bg-gray-300"}`} />
                    {i < routeStops.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{stop.name}</p>
                    <p className="text-xs text-gray-500">{stop.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bus type / class selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
              <Armchair className="w-4 h-4 mr-2 text-blue-600" />
              Choose Bus Type
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BUS_CLASSES.map((c) => {
                const fare = Math.round(bus.price * c.multiplier);
                const isSelected = c.key === busClassKey;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setBusClassKey(c.key)}
                    className={`rounded-xl border-2 p-3 text-left transition-all bg-white ${
                      isSelected ? "border-blue-600 shadow-md" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-gray-500">
                      {c.ac ? <Snowflake size={13} /> : <BusIcon size={13} />}
                      {c.seatType === "sleeper" ? <BedDouble size={13} /> : <Armchair size={13} />}
                    </div>
                    <p className="font-semibold text-sm">{c.label}</p>
                    <p className="font-bold text-blue-700 text-sm mt-1">₹{fare.toLocaleString()}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Boarding point */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              Boarding Point
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {boardingPoints.map((bp) => (
                <button
                  key={bp.name}
                  type="button"
                  onClick={() => setBoardingPoint(bp.name)}
                  className={`text-left rounded-xl border-2 p-3 transition-all ${
                    boardingPoint === bp.name ? "border-blue-600 shadow-md" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <p className="font-medium text-sm">{bp.name}</p>
                  <p className="text-xs text-gray-500">{bp.time}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Passengers + seat map */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-gray-800 font-semibold flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Select Seats
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  onClick={() => setPassengerCount((n) => Math.max(1, n - 1))}
                >
                  −
                </button>
                <span className="font-semibold w-5 text-center">{passengerCount}</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  onClick={() => setPassengerCount((n) => Math.min(6, n + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {decks.length > 1 && (
              <div className="flex items-center gap-2 mb-4">
                {decks.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setActiveDeck(d)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                      activeDeck === d ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mb-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Selected</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300 inline-block" /> Booked</span>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60 overflow-x-auto">
              <p className="text-xs font-semibold text-gray-500 mb-3">
                {activeDeck}
                {busClass.seatType === "sleeper" ? " — single berth left, double (couple) berth right" : " — 2 + 2 seating either side of the aisle"}
              </p>
              <div className="space-y-2 min-w-[320px]">
                {Array.from(new Set(deckSeats.map((s) => s.row))).map((rowNum) => {
                  const rowSeats = deckSeats.filter((s) => s.row === rowNum);

                  const SeatBtn = ({ seat }: { seat: BusSeat }) => {
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
                        {busClass.seatType === "sleeper" ? <BedDouble size={13} /> : <Armchair size={13} />}
                        <span className="font-medium mt-0.5">{seat.number}</span>
                      </button>
                    );
                  };

                  if (busClass.seatType === "sleeper") {
                    const single = rowSeats.filter((s) => !s.double);
                    const double = rowSeats.filter((s) => s.double);
                    return (
                      <div key={rowNum} className="flex items-stretch gap-3 bg-white rounded-lg border border-gray-100 p-2">
                        <div className="w-20 shrink-0">
                          {single.map((seat) => (
                            <SeatBtn key={seat.number} seat={seat} />
                          ))}
                        </div>
                        <div className="w-4 shrink-0 flex items-center justify-center">
                          <div className="w-px h-full border-l border-dashed border-gray-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          {double.map((seat) => (
                            <SeatBtn key={seat.number} seat={seat} />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const left = rowSeats.slice(0, 2);
                  const right = rowSeats.slice(2);
                  return (
                    <div key={rowNum} className="flex items-stretch gap-3 bg-white rounded-lg border border-gray-100 p-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        {left.map((seat) => (
                          <SeatBtn key={seat.number} seat={seat} />
                        ))}
                      </div>
                      <div className="w-4 shrink-0 flex items-center justify-center">
                        <div className="w-px h-full border-l border-dashed border-gray-200" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        {right.map((seat) => (
                          <SeatBtn key={seat.number} seat={seat} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1 mt-3">
              <Info size={12} />
              {seatsReady
                ? `${selectedSeats.length} seat(s) selected.`
                : `Select ${passengerCount} seat(s) — ${selectedSeats.length} chosen so far.`}
            </p>
          </div>

          <ReviewSection serviceType="Bus" serviceId={id as string} />
        </div>

        {/* Sticky booking sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
              <h4 className="font-semibold text-gray-800 mb-3">Fare Summary</h4>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus Type</span>
                  <span className="font-medium">{busClass.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Boarding</span>
                  <span className="font-medium text-right">{boardingPoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-medium">{passengerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat Fare</span>
                  <span className="font-medium">₹{seatFareTotal.toLocaleString()}</span>
                </div>
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
              <p className="text-[11px] text-gray-400 text-center mt-3">Free cancellation up to 6 hours before departure</p>
            </div>
            <DynamicPriceCard
              entityType="BUS"
              entityId={id as string}
              userId={user?.id}
              variantLabel={busClass.label}
              variantPrice={perSeatFare}
            />
          </div>
        </div>
      </div>

      {ticketData && (
        <ETicket
          bus={bus}
          busClass={ticketData.busClass}
          seats={ticketData.seats}
          boardingPoint={ticketData.boardingPoint}
          pnr={ticketData.pnr}
          grandTotal={ticketData.grandTotal}
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

export default BookBusPage;