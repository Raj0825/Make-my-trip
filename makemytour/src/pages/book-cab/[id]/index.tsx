import { useRouter } from "next/router";
import DynamicPriceCard from "@/components/pricing/DynamicPriceCard";
import ReviewSection from "@/components/reviews/ReviewSection";
import {
  Car as CarIcon,
  Clock,
  Calendar,
  MapPin,
  CreditCard,
  Ticket,
  Snowflake,
  Star,
  Phone,
  MessageCircle,
  BadgeCheck,
  ShieldCheck,
  Siren,
  MapPinned,
  UserCheck,
  PhoneCall,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Wallet,
  Banknote,
  Check,
  Gauge,
  Route,
  CheckCircle2,
  X,
  Printer,
  Download,
  Info,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getcab, getReviews, handlecabbooking, trackInteraction } from "@/api";
import { useDispatch, useSelector } from "react-redux";
import InsuranceAddOn, { InsuranceReceiptBlock, INSURANCE_PREMIUM, generateInsurancePolicyNo } from "@/components/insurance/InsuranceAddOn";
interface Cab {
  id: string;
  cabType: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  distanceKm?: number;
  estimatedDuration?: string;
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

function hashToIndex(id: string | undefined, mod: number) {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000003;
  }
  return hash % mod;
}

function generatePNR(bookingId?: string) {
  if (bookingId) return bookingId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase().padStart(8, "0");
  return Math.floor(10000000 + Math.random() * 89999999).toString();
}

// ---------------------------------------------------------------------------
// Photo bank, driver directory, payment methods — deterministically derived
// per cab id so every listing renders rich, distinct, consistent content
// without needing new backend fields.
// ---------------------------------------------------------------------------
const CAB_PHOTO_SETS: string[][] = [
  [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516348519310-1e0cff88ed07?auto=format&fit=crop&w=1200&q=80",
  ],
];

interface Driver {
  name: string;
  rating: number;
  trips: number;
  experienceYears: number;
  vehicleModel: string;
  vehicleNumber: string;
  phone: string;
  languages: string;
}

const DRIVER_POOL: Driver[] = [
  { name: "Suresh Patil", rating: 4.8, trips: 3200, experienceYears: 7, vehicleModel: "Maruti Dzire", vehicleNumber: "MH 13 AB 4521", phone: "+91 98765 43210", languages: "Marathi, Hindi, English" },
  { name: "Ramesh Yadav", rating: 4.6, trips: 1850, experienceYears: 4, vehicleModel: "Toyota Etios", vehicleNumber: "MH 09 CD 7788", phone: "+91 91234 56780", languages: "Hindi, English" },
  { name: "Anjali Kulkarni", rating: 4.9, trips: 4100, experienceYears: 9, vehicleModel: "Honda Amaze", vehicleNumber: "MH 14 EF 2093", phone: "+91 90909 12345", languages: "Marathi, Hindi, English" },
  { name: "Vikram Singh", rating: 4.7, trips: 2600, experienceYears: 6, vehicleModel: "Mahindra XUV300", vehicleNumber: "MH 12 GH 6634", phone: "+91 99887 66554", languages: "Hindi, Punjabi, English" },
];

const SAFETY_FEATURES = [
  { icon: ShieldCheck, label: "Verified Driver" },
  { icon: Navigation, label: "Live GPS Tracking" },
  { icon: Siren, label: "SOS Emergency Button" },
  { icon: UserCheck, label: "Background Checked" },
];

const WOMEN_SAFETY_FEATURES = [
  { icon: MapPinned, label: "Live trip sharing with family/friends" },
  { icon: PhoneCall, label: "24x7 women's safety helpline" },
  { icon: BadgeCheck, label: "Driver ID & police verification on file" },
  { icon: Siren, label: "One-tap SOS alerts local authorities" },
];

interface PaymentMethod {
  key: string;
  label: string;
  icon: any;
  sublabel: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { key: "upi", label: "UPI", icon: Smartphone, sublabel: "GPay, PhonePe, Paytm" },
  { key: "card", label: "Card", icon: CreditCard, sublabel: "Credit / Debit card" },
  { key: "wallet", label: "Wallet", icon: Wallet, sublabel: "App wallet balance" },
  { key: "cash", label: "Cash", icon: Banknote, sublabel: "Pay the driver directly" },
];

const RIDE_STATUS_STEPS = ["Booking Confirmed", "Driver Assigned", "Driver Arriving", "Trip Started", "Completed"];

function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (!photos || photos.length === 0) return null;
  return (
    <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden group mb-6">
      <img src={photos[index]} alt={name} className="w-full h-full object-cover" />
      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button key={i} type="button" onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{index + 1}/{photos.length}</span>
        </>
      )}
    </div>
  );
}

// Ride status tracker shown after booking — mocked progression from time
// elapsed since booking, since there is no real dispatch system.
function RideStatusModal({
  cab,
  driver,
  pnr,
  otp,
  grandTotal,
  paymentMethod,
  insured,
  onClose,
}: {
  cab: Cab;
  driver: Driver;
  pnr: string;
  otp: string;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  insured: boolean;
  onClose: () => void;
}) {
  const insurancePolicyNo = useMemo(() => (insured ? generateInsurancePolicyNo(pnr) : ""), [insured, pnr]);
  const [bookedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 4000);
    return () => clearInterval(t);
  }, []);

  const secondsElapsed = (now - bookedAt) / 1000;
  const stepIndex = Math.min(RIDE_STATUS_STEPS.length - 1, Math.floor(secondsElapsed / 6));

  const handlePrint = () => window.print();
  const handleDownload = () => {
    const insuranceRow = insured ? `<tr><td class="label">Travel Insurance</td><td>Policy ${insurancePolicyNo} · ₹${INSURANCE_PREMIUM}</td></tr>` : "";
    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>Cab Receipt ${pnr}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.card{border:1px solid #e5e7eb;border-radius:12px;padding:20px;max-width:520px}
      h1{font-size:18px;margin:0 0 4px}.muted{color:#6b7280;font-size:12px}table{width:100%;border-collapse:collapse;margin-top:12px}
      td{padding:6px 0;font-size:13px}.label{color:#6b7280}.total{font-size:16px;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}</style></head><body>
      <div class="card"><h1>${cab.cabType} Cab Receipt</h1><p class="muted">Booking Ref: ${pnr}</p>
      <table>
        <tr><td class="label">From</td><td>${cab.from}</td></tr>
        <tr><td class="label">To</td><td>${cab.to}</td></tr>
        <tr><td class="label">Pickup</td><td>${new Date(cab.departureTime).toLocaleString()}</td></tr>
        <tr><td class="label">Driver</td><td>${driver.name} · ${driver.vehicleModel} (${driver.vehicleNumber})</td></tr>
        <tr><td class="label">Payment</td><td>${paymentMethod.label}</td></tr>
        ${insuranceRow}
      </table><p class="total">Total Paid: ₹ ${grandTotal.toLocaleString()}</p></div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cab-receipt-${pnr}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:static print:p-0">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden print:shadow-none print:rounded-none max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between print:hidden sticky top-0">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={20} />
            Ride Booked
          </div>
          <button onClick={onClose} className="hover:opacity-80"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">{cab.from} → {cab.to}</h3>
              <p className="text-gray-500 text-sm">Booking Ref: <span className="font-mono font-semibold text-gray-800">{pnr}</span></p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400 uppercase">OTP for driver</p>
              <p className="text-xl font-bold tracking-widest text-blue-700">{otp}</p>
            </div>
          </div>

          {/* Status stepper */}
          <div className="mb-5">
            <div className="flex items-center">
              {RIDE_STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i <= stepIndex ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {i < stepIndex ? <Check size={12} /> : i + 1}
                    </div>
                  </div>
                  {i < RIDE_STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 ${i < stepIndex ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm font-semibold text-blue-700 mt-2">{RIDE_STATUS_STEPS[stepIndex]}</p>
          </div>

          {/* Driver card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium flex items-center gap-1">
                    {driver.name}
                    <BadgeCheck size={14} className="text-blue-600" />
                  </p>
                  <p className="text-xs text-gray-500">{driver.vehicleModel} · {driver.vehicleNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${driver.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100">
                  <Phone size={14} className="text-blue-600" /> Call
                </a>
                <button type="button"
                  className="flex items-center gap-1.5 text-sm font-medium bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-2 hover:bg-red-100">
                  <Siren size={14} /> SOS
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 pt-3 mb-5 text-sm">
            <span className="text-gray-600">Payment · {paymentMethod.label}</span>
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

const BookCabPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [open, setopem] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();
  const [paymentKey, setPaymentKey] = useState<string>("upi");
  const [reviewStats, setReviewStats] = useState<{ count: number; average: number }>({ count: 0, average: 0 });
  const [rideData, setRideData] = useState<{ driver: Driver; pnr: string; otp: string; grandTotal: number; paymentMethod: PaymentMethod } | null>(null);

  useEffect(() => {
    if (!id || !user?.id) return;
    trackInteraction(user.id, "CAB", id as string, "VIEWED");
  }, [id, user?.id]);

  useEffect(() => {
    if (!id) return;
    const fetchReviewStats = async () => {
      try {
        const data = await getReviews("Cab", id as string);
        const list = Array.isArray(data) ? data : [];
        const count = list.length;
        const average = count > 0 ? list.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / count : 0;
        setReviewStats({ count, average });
      } catch (error) {
        console.error("Error fetching review stats:", error);
      }
    };
    fetchReviewStats();
  }, [id]);

  useEffect(() => {
    const fetchCabs = async () => {
      try {
        const data = await getcab();
        const filteredData = data.filter((cab: any) => cab.id === id);
        setCabs(filteredData);
      } catch (error) {
        console.error("Error fetching cabs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCabs();
  }, [id, user]);

  const cab = cabs[0];
  const hasReviews = reviewStats.count > 0;

  const photoSetIndex = hashToIndex(cab?.id, CAB_PHOTO_SETS.length);
  const photos = useMemo(() => CAB_PHOTO_SETS[photoSetIndex], [photoSetIndex]);

  const driverIndex = hashToIndex(cab?.id, DRIVER_POOL.length);
  const driver = DRIVER_POOL[driverIndex];

  const isAC = useMemo(() => {
    const t = (cab?.cabType || "").toLowerCase();
    if (t.includes("non ac") || t.includes("non-ac")) return false;
    if (t.includes("ac")) return true;
    return hashToIndex(cab?.id, 4) !== 0; // ~3/4 of unlabeled cabs default to AC
  }, [cab]);

  const distanceKm = useMemo(() => {
    if (cab?.distanceKm && cab.distanceKm > 0) return cab.distanceKm;
    return 12 + hashToIndex(cab?.id, 38); // fallback deterministic 12-49 km
  }, [cab]);
  const durationLabel = useMemo(() => {
    if (!cab) return null;
    if (cab.estimatedDuration && cab.estimatedDuration.trim() !== "") return cab.estimatedDuration;
    const ms = new Date(cab.arrivalTime).getTime() - new Date(cab.departureTime).getTime();
    if (isNaN(ms) || ms <= 0) return null;
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.round((ms % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;
  }, [cab]);

  const perKmRate = cab ? Math.max(6, Math.round((cab.price / distanceKm) * 0.7)) : 0;
  const baseFare = cab ? Math.max(0, cab.price - perKmRate * distanceKm) : 0;

  const pickupHour = cab ? new Date(cab.departureTime).getHours() : 12;
  const isNightRide = pickupHour >= 22 || pickupHour < 5;
  const nightCharge = isNightRide && cab ? Math.round(cab.price * 0.1) : 0;

  if (loading) return <Loader />;
  if (!cab) return <div>No cab data available for this ID.</div>;

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = Number.parseInt(e.target.value);
    setQuantity(isNaN(value) ? 1 : Math.max(1, Math.min(value, cab.availableSeats)));
  };

  const perCabFare = cab.price + nightCharge;
  const totalPrice = perCabFare * quantity;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + taxes;
  const paymentMethod = PAYMENT_METHODS.find((p) => p.key === paymentKey) || PAYMENT_METHODS[0];

  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handlecabbooking(user?.id, cab?.id, quantity, grandTotal, perCabFare);
      const updateuser = { ...user, bookings: [...user.bookings, data] };
      dispatch(setUser(updateuser));
      setopem(false);
      setQuantity(1);
      setRideData({
        driver,
        pnr: generatePNR(data?.id),
        otp: Math.floor(1000 + Math.random() * 8999).toString(),
        grandTotal,
        paymentMethod,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const BookingContent = () => (
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <CarIcon className="w-6 h-6 mr-2" />
          Cab Booking Details
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center"><CarIcon className="w-4 h-4 mr-2" />Cab Type</Label>
            <Input value={`${cab?.cabType} · ${isAC ? "AC" : "Non-AC"}`} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center"><MapPin className="w-4 h-4 mr-2" />Route</Label>
            <Input value={`${cab?.from} → ${cab?.to}`} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center"><Calendar className="w-4 h-4 mr-2" />Pickup Time</Label>
            <Input value={new Date(cab.departureTime).toLocaleString()} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center"><Clock className="w-4 h-4 mr-2" />Estimated Arrival</Label>
            <Input value={new Date(cab.arrivalTime).toLocaleString()} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center"><Ticket className="w-4 h-4 mr-2" />Number of Cabs</Label>
            <Input type="number" min="1" max={cab.availableSeats} value={quantity} onChange={handleQuantityChange} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center"><CreditCard className="w-4 h-4 mr-2" />Payment Method</Label>
            <Input value={paymentMethod.label} readOnly />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Choose Payment Method</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((p) => {
              const Icon = p.icon;
              const isSelected = p.key === paymentKey;
              return (
                <button key={p.key} type="button" onClick={() => setPaymentKey(p.key)}
                  className={`rounded-lg border-2 p-2.5 text-center transition-all ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                  <Icon size={16} className={`mx-auto mb-1 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
                  <p className="text-xs font-medium">{p.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center"><CreditCard className="w-5 h-5 mr-2" />Fare Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-medium">₹ {(baseFare * quantity).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Distance Charge ({distanceKm} km × ₹{perKmRate})</span>
              <span className="font-medium">₹ {(perKmRate * distanceKm * quantity).toLocaleString()}</span>
            </div>
            {nightCharge > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Night Charge</span>
                <span className="font-medium">₹ {(nightCharge * quantity).toLocaleString()}</span>
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
        <Button className="w-full bg-blue-600 text-white" onClick={handlebooking}>Confirm Booking</Button>
      </div>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <CarIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold">{cab.cabType}</h1>
                  <p className="text-gray-600">{cab.from} → {cab.to}</p>
                </div>
              </div>
              {hasReviews && (
                <span className="hidden sm:flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  {reviewStats.average.toFixed(1)} · {reviewStats.count} review{reviewStats.count > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <PhotoGallery photos={photos} name={cab.cabType} />

            {/* AC / Safety strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
                <Snowflake className={`w-5 h-5 mb-1 ${isAC ? "text-blue-600" : "text-gray-300"}`} />
                <span className="text-xs font-medium text-gray-700">{isAC ? "AC" : "Non-AC"}</span>
              </div>
              {SAFETY_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <Icon className="w-5 h-5 mb-1 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Pickup: {formatDate(cab.departureTime)}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Est. Arrival: {formatDate(cab.arrivalTime)}
              </div>
            </div>
          </div>

          {/* Distance & time + rate breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
              <Route className="w-4 h-4 mr-2 text-blue-600" />
              Trip Details & Fare Rate
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <Route size={16} className="mx-auto text-blue-600 mb-1" />
                <p className="text-sm font-bold">{distanceKm} km</p>
                <p className="text-[10px] text-gray-500">Distance</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <Clock size={16} className="mx-auto text-blue-600 mb-1" />
                <p className="text-sm font-bold">{durationLabel || "—"}</p>
                <p className="text-[10px] text-gray-500">Duration</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <Gauge size={16} className="mx-auto text-blue-600 mb-1" />
                <p className="text-sm font-bold">₹{perKmRate}/km</p>
                <p className="text-[10px] text-gray-500">Rate</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <CreditCard size={16} className="mx-auto text-blue-600 mb-1" />
                <p className="text-sm font-bold">₹{cab.price.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">Est. Fare</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Base fare</span><span>₹{baseFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Distance ({distanceKm} km × ₹{perKmRate})</span><span>₹{(perKmRate * distanceKm).toLocaleString()}</span>
              </div>
              {isNightRide && (
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1"><Info size={12} /> Night charge (10 PM–5 AM)</span>
                  <span>₹{nightCharge.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Driver details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-gray-800 font-semibold mb-3">Driver Details</h4>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium flex items-center gap-1.5">
                    {driver.name}
                    <BadgeCheck size={15} className="text-blue-600" />
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      <Star size={11} className="fill-amber-500 text-amber-500" /> {driver.rating}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {driver.vehicleModel} · {driver.vehicleNumber} · {driver.experienceYears} yrs experience · {driver.trips.toLocaleString()} trips
                  </p>
                  <p className="text-xs text-gray-400">Speaks {driver.languages}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${driver.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1.5 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100">
                  <Phone size={14} className="text-blue-600" /> Call
                </a>
                <button type="button"
                  className="flex items-center gap-1.5 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100">
                  <MessageCircle size={14} className="text-blue-600" /> Message
                </button>
              </div>
            </div>
          </div>

          {/* Women's safety */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-pink-600" />
              Women's Safety
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WOMEN_SAFETY_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2.5 bg-pink-50/60 rounded-lg p-3 border border-pink-100">
                  <Icon size={16} className="text-pink-600 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <ReviewSection serviceType="Cab" serviceId={id as string} />
        </div>

        {/* Sticky booking sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-2xl font-bold">
                  ₹ {cab.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500"> est.</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  <Snowflake size={12} className={isAC ? "text-blue-600" : "text-gray-400"} />
                  {isAC ? "AC" : "Non-AC"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                {hasReviews ? `${reviewStats.average.toFixed(1)} ★ · ${reviewStats.count} review${reviewStats.count > 1 ? "s" : ""}` : "No reviews yet"}
              </p>

              <div className="flex items-center justify-between text-sm mb-4 border-y border-gray-100 py-3">
                <div>
                  <p className="text-gray-400 text-[11px] uppercase tracking-wide">Distance</p>
                  <p className="font-medium">{distanceKm} km</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <p className="text-gray-400 text-[11px] uppercase tracking-wide">Duration</p>
                  <p className="font-medium">{durationLabel || "—"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-600">Available cabs</span>
                <span className="font-semibold">{cab.availableSeats}</span>
              </div>
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-gray-600">Cabs to book</span>
                <span className="font-semibold">{quantity}</span>
              </div>

              <Dialog open={open} onOpenChange={setopem}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 text-white py-3">Book Now</Button>
                </DialogTrigger>
                {user ? (
                  <BookingContent />
                ) : (
                  <DialogContent className="bg-white">
                    <DialogHeader><DialogTitle>Login Required</DialogTitle></DialogHeader>
                    <p>Please log in to continue with your booking.</p>
                    <SignupDialog trigger={<Button className="w-full">Log In / Sign Up</Button>} />
                  </DialogContent>
                )}
              </Dialog>
              <p className="text-[11px] text-gray-400 text-center mt-3">Fare may vary slightly based on traffic and route</p>
            </div>

            <DynamicPriceCard
              entityType="CAB"
              entityId={id as string}
              userId={user?.id}
              variantLabel={`${cab.cabType} · ${isAC ? "AC" : "Non-AC"}`}
              variantPrice={cab.price}
            />
          </div>
        </div>
      </div>

      {rideData && (
        <RideStatusModal
          cab={cab}
          driver={rideData.driver}
          pnr={rideData.pnr}
          otp={rideData.otp}
          grandTotal={rideData.grandTotal}
          paymentMethod={rideData.paymentMethod}
          onClose={() => {
            setRideData(null);
            router.push("/profile");
          }}
        />
      )}
    </div>
  );
};
export default BookCabPage;