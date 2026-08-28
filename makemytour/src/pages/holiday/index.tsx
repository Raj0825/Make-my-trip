import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
  Sparkles, MapPin, Calendar, Users, IndianRupee, Plane, TrainFront, Bus as BusIcon,
  Car as CarIcon, Hotel as HotelIcon, Camera, UtensilsCrossed, Compass, UserCheck,
  Check, ChevronRight, Wallet, TrendingUp, TrendingDown, X, Printer, Download,
  CheckCircle2, Star, Loader2, Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getflight, gettrain, getbus, getcab, gethotel,
  handleflightbooking, handletrainbooking, handlebusbooking, handlecabbooking, handlehotelbooking,
} from "@/api";
import { setUser } from "@/store";

// ---------------------------------------------------------------------------
// Curated points of interest per city. This is editorial content, not a live
// data feed — a handful of popular cities get tailored suggestions, and any
// other destination falls back to a generic (still themed) set so the planner
// never comes up empty.
// ---------------------------------------------------------------------------
interface Poi { name: string; blurb: string; img: string; }

const CITY_CONTENT: Record<string, { attractions: Poi[]; restaurants: Poi[]; photoSpots: Poi[] }> = {
  mumbai: {
    attractions: [
      { name: "Gateway of India", blurb: "Iconic waterfront monument, best visited at sunset.", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80" },
      { name: "Marine Drive", blurb: "The city's famous curved promenade along the sea.", img: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=80" },
      { name: "Elephanta Caves", blurb: "Ancient rock-cut caves, a short ferry ride away.", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80" },
    ],
    restaurants: [
      { name: "Leopold Cafe", blurb: "Historic Colaba cafe, popular with travellers.", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80" },
      { name: "Bademiya", blurb: "Legendary late-night kebabs and rolls.", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
    ],
    photoSpots: [
      { name: "Bandra-Worli Sea Link", blurb: "Dramatic skyline shot, especially at night.", img: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=80" },
      { name: "Colaba Causeway", blurb: "Colourful street-market backdrop.", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80" },
    ],
  },
  delhi: {
    attractions: [
      { name: "India Gate", blurb: "War memorial and the city's most iconic lawn.", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80" },
      { name: "Humayun's Tomb", blurb: "Mughal-era garden tomb, a precursor to the Taj.", img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80" },
      { name: "Chandni Chowk", blurb: "Old Delhi's chaotic, unmissable market lanes.", img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80" },
    ],
    restaurants: [
      { name: "Karim's", blurb: "Century-old Mughlai kebabs near Jama Masjid.", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
      { name: "Paranthe Wali Gali", blurb: "A whole lane devoted to stuffed parathas.", img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80" },
    ],
    photoSpots: [
      { name: "Humayun's Tomb Gardens", blurb: "Symmetry and sandstone, gorgeous at golden hour.", img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80" },
      { name: "Lodhi Art District", blurb: "Delhi's open-air street art neighbourhood.", img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80" },
    ],
  },
  goa: {
    attractions: [
      { name: "Baga Beach", blurb: "Classic North Goa beach with water sports.", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
      { name: "Fort Aguada", blurb: "17th-century Portuguese fort with sea views.", img: "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80" },
      { name: "Dudhsagar Falls", blurb: "One of India's tallest waterfalls, a day-trip away.", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80" },
    ],
    restaurants: [
      { name: "Fisherman's Wharf", blurb: "Riverside Goan seafood institution.", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" },
      { name: "Britto's", blurb: "Beachfront shack, famous for its prawns.", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
    ],
    photoSpots: [
      { name: "Chapora Fort", blurb: "Sunset views over the Arabian Sea.", img: "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80" },
      { name: "Palolem Beach", blurb: "Postcard-perfect crescent bay.", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    ],
  },
  jaipur: {
    attractions: [
      { name: "Amber Fort", blurb: "Hilltop fort-palace with mirrored halls.", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
      { name: "Hawa Mahal", blurb: "The iconic 'Palace of Winds' facade.", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80" },
      { name: "City Palace", blurb: "Royal residence with courtyards and museums.", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
    ],
    restaurants: [
      { name: "Chokhi Dhani", blurb: "Rajasthani village-themed thali experience.", img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80" },
      { name: "Laxmi Mishthan Bhandar", blurb: "Legendary sweets and snacks since 1727.", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
    ],
    photoSpots: [
      { name: "Hawa Mahal at Sunrise", blurb: "Empty streets, best light of the day.", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80" },
      { name: "Patrika Gate", blurb: "Jaipur's vividly painted archway.", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
    ],
  },
  bangalore: {
    attractions: [
      { name: "Lalbagh Botanical Garden", blurb: "240-acre garden with a glasshouse and lake.", img: "https://images.unsplash.com/photo-1580500550469-9df0f75a2a1e?auto=format&fit=crop&w=800&q=80" },
      { name: "Bangalore Palace", blurb: "Tudor-style palace open for tours.", img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80" },
      { name: "Nandi Hills", blurb: "Popular sunrise-point day trip from the city.", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80" },
    ],
    restaurants: [
      { name: "Vidyarthi Bhavan", blurb: "Legendary dosas since 1943.", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
      { name: "Toit Brewpub", blurb: "Craft beer and wood-fired pizzas.", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" },
    ],
    photoSpots: [
      { name: "Lalbagh Glasshouse", blurb: "Victorian glasshouse framed by gardens.", img: "https://images.unsplash.com/photo-1580500550469-9df0f75a2a1e?auto=format&fit=crop&w=800&q=80" },
      { name: "Cubbon Park", blurb: "Leafy avenues right in the city centre.", img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80" },
    ],
  },
};

const GENERIC_CONTENT: { attractions: Poi[]; restaurants: Poi[]; photoSpots: Poi[] } = {
  attractions: [
    { name: "Old Town Heritage Walk", blurb: "A guided stroll through the historic quarter.", img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80" },
    { name: "Local Market", blurb: "Browse handicrafts, spices, and street food.", img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80" },
    { name: "City Viewpoint", blurb: "A hilltop or rooftop spot overlooking the skyline.", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80" },
  ],
  restaurants: [
    { name: "Local Favourite Thali House", blurb: "Home-style regional cuisine, always packed at lunch.", img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80" },
    { name: "Street Food Lane", blurb: "A stretch of stalls locals swear by.", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
  ],
  photoSpots: [
    { name: "Sunset Point", blurb: "The spot every local recommends for golden hour.", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80" },
    { name: "Historic Lane", blurb: "Colourful facades and quiet backstreets.", img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80" },
  ],
};

function cityContentFor(city: string) {
  const key = (city || "").trim().toLowerCase();
  return CITY_CONTENT[key] || GENERIC_CONTENT;
}

const GUIDE_PRICE_PER_DAY = 1200;

function hashToIndex(id: string | undefined, mod: number) {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000003;
  return hash % mod;
}
function generateTripRef() {
  return "TRIP" + Math.floor(100000 + Math.random() * 899999).toString();
}

interface TransportOption {
  key: string; // `${type}-${id}`
  type: "Flight" | "Train" | "Bus";
  id: string;
  name: string;
  price: number;
  departureTime: string;
  arrivalTime: string;
}

export default function HolidayPlannerPage() {
  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  // Step 1: trip inputs
  const [step, setStep] = useState<"form" | "planning" | "results">("form");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [budget, setBudget] = useState<number>(30000);
  const [duration, setDuration] = useState<number>(4);
  const [travelers, setTravelers] = useState<number>(2);

  // Source data
  const [flights, setFlights] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [cabs, setCabs] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [f, t, b, c, h] = await Promise.all([getflight(), gettrain(), getbus(), getcab(), gethotel()]);
        setFlights(f || []); setTrains(t || []); setBuses(b || []); setCabs(c || []); setHotels(h || []);
      } catch (e) {
        console.error("Error loading holiday planner data:", e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAll();
  }, []);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    flights.forEach((f) => { if (f.from) cities.add(f.from); if (f.to) cities.add(f.to); });
    trains.forEach((t) => { if (t.from) cities.add(t.from); if (t.to) cities.add(t.to); });
    buses.forEach((b) => { if (b.from) cities.add(b.from); if (b.to) cities.add(b.to); });
    cabs.forEach((c) => { if (c.from) cities.add(c.from); if (c.to) cities.add(c.to); });
    hotels.forEach((h) => { if (h.location) cities.add(h.location); });
    return Array.from(cities).sort();
  }, [flights, trains, buses, cabs, hotels]);

  // Selections made in the results step
  const [selectedTransportKey, setSelectedTransportKey] = useState<string>("");
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [includeCab, setIncludeCab] = useState(true);
  const [includeGuide, setIncludeGuide] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [tripConfirmation, setTripConfirmation] = useState<any>(null);
  const [bookingError, setBookingError] = useState("");

  const matches = (v: string, target: string) => (v || "").trim().toLowerCase() === (target || "").trim().toLowerCase();

  const transportOptions: TransportOption[] = useMemo(() => {
    const opts: TransportOption[] = [];
    flights.filter((f) => matches(f.from, fromCity) && matches(f.to, toCity)).forEach((f) =>
      opts.push({ key: `Flight-${f.id}`, type: "Flight", id: f.id, name: f.flightName, price: f.price, departureTime: f.departureTime, arrivalTime: f.arrivalTime }));
    trains.filter((t) => matches(t.from, fromCity) && matches(t.to, toCity)).forEach((t) =>
      opts.push({ key: `Train-${t.id}`, type: "Train", id: t.id, name: t.trainName, price: t.price, departureTime: t.departureTime, arrivalTime: t.arrivalTime }));
    buses.filter((b) => matches(b.from, fromCity) && matches(b.to, toCity)).forEach((b) =>
      opts.push({ key: `Bus-${b.id}`, type: "Bus", id: b.id, name: b.busName, price: b.price, departureTime: b.departureTime, arrivalTime: b.arrivalTime }));
    return opts.sort((a, b) => a.price - b.price);
  }, [flights, trains, buses, fromCity, toCity]);

  const hotelOptions = useMemo(() => {
    return hotels.filter((h) => matches(h.location, toCity)).sort((a, b) => a.pricePerNight - b.pricePerNight);
  }, [hotels, toCity]);

  const cabOption = useMemo(() => {
    const local = cabs.filter((c) => matches(c.from, toCity) || matches(c.to, toCity));
    return local.length > 0 ? local[hashToIndex(toCity, local.length)] : null;
  }, [cabs, toCity]);

  const content = cityContentFor(toCity);

  const selectedTransport = transportOptions.find((o) => o.key === selectedTransportKey);
  const selectedHotel = hotelOptions.find((h) => h.id === selectedHotelId);
  const rooms = Math.max(1, Math.ceil(travelers / 2));

  const transportCost = selectedTransport ? selectedTransport.price * travelers : 0;
  const hotelCost = selectedHotel ? selectedHotel.pricePerNight * rooms * duration : 0;
  const cabCost = includeCab && cabOption ? cabOption.price : 0;
  const guideCost = includeGuide ? GUIDE_PRICE_PER_DAY * duration : 0;
  const subtotal = transportCost + hotelCost + cabCost + guideCost;
  const taxes = Math.round(subtotal * 0.05);
  const estimatedTotal = subtotal + taxes;
  const overBudget = estimatedTotal > budget;

  const handlePlan = () => {
    if (!fromCity || !toCity) return;
    setStep("planning");
    setTimeout(() => {
      // Auto-pick the cheapest transport and a hotel that best fits the
      // remaining budget once transport is accounted for.
      const cheapestTransport = transportOptions[0];
      setSelectedTransportKey(cheapestTransport?.key || "");

      const remainingForHotel = cheapestTransport
        ? budget - cheapestTransport.price * travelers
        : budget;
      const perNightBudget = remainingForHotel / (Math.max(1, Math.ceil(travelers / 2)) * duration);
      const fittingHotel =
        hotelOptions.find((h) => h.pricePerNight <= Math.max(perNightBudget, 0)) || hotelOptions[0];
      setSelectedHotelId(fittingHotel?.id || "");

      setStep("results");
    }, 1600);
  };

  const handleBookAll = async () => {
    if (!user?.id) {
      router.push("/");
      return;
    }
    setBookingInProgress(true);
    setBookingError("");
    try {
      const bookings: { label: string; ref: string; amount: number }[] = [];
      const newBookingsForUser: any[] = [];

      if (selectedTransport) {
        let data: any;
        if (selectedTransport.type === "Flight") {
          data = await handleflightbooking(user.id, selectedTransport.id, travelers, transportCost, selectedTransport.price, [], "Economy");
        } else if (selectedTransport.type === "Train") {
          data = await handletrainbooking(user.id, selectedTransport.id, travelers, transportCost, selectedTransport.price);
        } else {
          data = await handlebusbooking(user.id, selectedTransport.id, travelers, transportCost, selectedTransport.price);
        }
        if (data) { newBookingsForUser.push(data); bookings.push({ label: `${selectedTransport.type}: ${selectedTransport.name}`, ref: data.bookingId || selectedTransport.id, amount: transportCost }); }
      }

      if (selectedHotel) {
        const data = await handlehotelbooking(user.id, selectedHotel.id, rooms, hotelCost, selectedHotel.pricePerNight, null, null);
        if (data) { newBookingsForUser.push(data); bookings.push({ label: `Hotel: ${selectedHotel.hotelName}`, ref: data.bookingId || selectedHotel.id, amount: hotelCost }); }
      }

      if (includeCab && cabOption) {
        const data = await handlecabbooking(user.id, cabOption.id, 1, cabCost, cabOption.price);
        if (data) { newBookingsForUser.push(data); bookings.push({ label: `Cab: ${cabOption.cabType}`, ref: data.bookingId || cabOption.id, amount: cabCost }); }
      }

      if (newBookingsForUser.length > 0) {
        dispatch(setUser({ ...user, bookings: [...(user.bookings || []), ...newBookingsForUser] }));
      }

      setTripConfirmation({
        tripRef: generateTripRef(),
        from: fromCity, to: toCity, duration, travelers,
        bookings,
        guideIncluded: includeGuide,
        guideCost,
        total: estimatedTotal,
      });
    } catch (err) {
      console.error(err);
      setBookingError("Something went wrong booking part of your trip. Please check My Bookings — anything that succeeded is saved, and you can book the rest individually.");
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=60')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto px-4 py-14 relative">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
            <Sparkles size={32} /> AI Holiday Planner
          </h1>
          <p className="text-blue-100 max-w-xl">
            Tell us where, when, and your budget — we'll put together transport, a hotel, things to do, places to
            eat, photo spots, and a local guide, and book the whole trip in one go.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Step 1: form */}
        {(step === "form" || step === "planning") && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> From</Label>
                <select value={fromCity} onChange={(e) => setFromCity(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select departure city</option>
                  {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> To</Label>
                <select value={toCity} onChange={(e) => setToCity(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select destination</option>
                  {cityOptions.filter((c) => c !== fromCity).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IndianRupee size={12} /> Total Budget</Label>
                <Input type="number" min={0} value={budget} onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))} />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12} /> Duration (days)</Label>
                <Input type="number" min={1} max={30} value={duration} onChange={(e) => setDuration(Math.max(1, Math.min(30, Number(e.target.value))))} />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users size={12} /> Travelers</Label>
                <Input type="number" min={1} max={10} value={travelers} onChange={(e) => setTravelers(Math.max(1, Math.min(10, Number(e.target.value))))} />
              </div>
            </div>

            <Button
              onClick={handlePlan}
              disabled={!fromCity || !toCity || step === "planning" || loadingData}
              className="w-full bg-blue-600 text-white py-3 flex items-center justify-center gap-2"
            >
              {step === "planning" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Planning your trip...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Plan My Trip
                </>
              )}
            </Button>
            {!loadingData && cityOptions.length === 0 && (
              <p className="text-xs text-gray-400 mt-3">No routes found yet — check back once listings are added.</p>
            )}
          </div>
        )}

        {/* Step 2: results */}
        {step === "results" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="lg:col-span-2 space-y-6">
              {/* Trip summary strip */}
              <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-lg flex items-center gap-1.5">
                    {fromCity} <ChevronRight size={16} className="text-gray-400" /> {toCity}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {duration} day(s)</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {travelers} traveler(s)</span>
                  </p>
                </div>
                <button onClick={() => setStep("form")} className="text-xs text-blue-600 hover:underline">Edit trip details</button>
              </div>

              {/* Transport */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2"><Route size={18} className="text-blue-600" /> Getting There</h2>
                <p className="text-xs text-gray-400 mb-4">AI-recommended: cheapest option that fits your route</p>
                {transportOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No direct flights, trains, or buses found for this route yet.</p>
                ) : (
                  <div className="space-y-2">
                    {transportOptions.slice(0, 4).map((opt, i) => {
                      const Icon = opt.type === "Flight" ? Plane : opt.type === "Train" ? TrainFront : BusIcon;
                      const isSelected = opt.key === selectedTransportKey;
                      return (
                        <button key={opt.key} type="button" onClick={() => setSelectedTransportKey(opt.key)}
                          className={`w-full text-left rounded-xl border-2 p-3.5 flex items-center justify-between transition-all ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold flex items-center gap-1.5">
                                {opt.name}
                                {i === 0 && <span className="text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded-full">AI PICK</span>}
                              </p>
                              <p className="text-xs text-gray-500">{opt.type} · {new Date(opt.departureTime).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-700">₹{opt.price.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">per person</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hotel */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2"><HotelIcon size={18} className="text-blue-600" /> Where to Stay</h2>
                <p className="text-xs text-gray-400 mb-4">Fits your remaining budget for {duration} night(s), {rooms} room(s)</p>
                {hotelOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No hotels found in {toCity} yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hotelOptions.slice(0, 4).map((h, i) => {
                      const isSelected = h.id === selectedHotelId;
                      return (
                        <button key={h.id} type="button" onClick={() => setSelectedHotelId(h.id)}
                          className={`text-left rounded-xl border-2 p-3.5 transition-all ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                          <p className="text-sm font-semibold flex items-center gap-1.5">
                            {h.hotelName}
                            {i === 0 && <span className="text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded-full">AI PICK</span>}
                          </p>
                          <p className="text-xs text-gray-500 mb-1.5">{h.location}</p>
                          <p className="font-bold text-blue-700 text-sm">₹{h.pricePerNight.toLocaleString()}<span className="text-[10px] text-gray-400 font-normal"> /night</span></p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Local transport */}
              {cabOption && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2"><CarIcon size={18} className="text-blue-600" /> Getting Around</h2>
                      <p className="text-xs text-gray-500 mt-1">Cab from station/airport to your hotel — {cabOption.cabType}</p>
                    </div>
                    <button type="button" onClick={() => setIncludeCab((v) => !v)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border ${includeCab ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"}`}>
                      {includeCab ? `Included · ₹${cabOption.price.toLocaleString()}` : "Add for ₹" + cabOption.price.toLocaleString()}
                    </button>
                  </div>
                </div>
              )}

              {/* Attractions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Compass size={18} className="text-blue-600" /> Things to Do Nearby</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {content.attractions.map((a) => (
                    <div key={a.name} className="rounded-xl overflow-hidden border border-gray-100">
                      <img src={a.img} alt={a.name} className="w-full h-28 object-cover" />
                      <div className="p-2.5">
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.blurb}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restaurants */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><UtensilsCrossed size={18} className="text-blue-600" /> Where to Eat</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.restaurants.map((r) => (
                    <div key={r.name} className="rounded-xl overflow-hidden border border-gray-100 flex">
                      <img src={r.img} alt={r.name} className="w-24 h-24 object-cover shrink-0" />
                      <div className="p-2.5">
                        <p className="text-sm font-semibold">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.blurb}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo spots */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Camera size={18} className="text-blue-600" /> Best Photo Spots</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.photoSpots.map((p) => (
                    <div key={p.name} className="relative rounded-xl overflow-hidden h-36">
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
                      <div className="absolute bottom-2 left-2.5 text-white">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-[11px] text-gray-200">{p.blurb}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <UserCheck size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Hire a Local Guide</p>
                      <p className="text-xs text-gray-500">English-speaking, background-verified guide for your whole trip · ₹{GUIDE_PRICE_PER_DAY}/day</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIncludeGuide((v) => !v)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 ${includeGuide ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"}`}>
                    {includeGuide ? `Added · ₹${guideCost.toLocaleString()}` : "Add Guide"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky trip cost sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 space-y-4">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Wallet size={16} className="text-blue-600" /> Trip Cost</h3>
                  <div className="space-y-2 text-sm mb-4">
                    {selectedTransport && (
                      <div className="flex justify-between"><span className="text-gray-600">{selectedTransport.type} ({travelers}×)</span><span className="font-medium">₹{transportCost.toLocaleString()}</span></div>
                    )}
                    {selectedHotel && (
                      <div className="flex justify-between"><span className="text-gray-600">Hotel ({rooms} room × {duration}n)</span><span className="font-medium">₹{hotelCost.toLocaleString()}</span></div>
                    )}
                    {includeCab && cabOption && (
                      <div className="flex justify-between"><span className="text-gray-600">Local Cab</span><span className="font-medium">₹{cabCost.toLocaleString()}</span></div>
                    )}
                    {includeGuide && (
                      <div className="flex justify-between"><span className="text-gray-600">Guide ({duration}d)</span><span className="font-medium">₹{guideCost.toLocaleString()}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-gray-600">Taxes & Fees</span><span className="font-medium">₹{taxes.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                      <span className="font-bold">Estimated Total</span>
                      <span className="font-bold text-lg">₹{estimatedTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Your Budget: ₹{budget.toLocaleString()}</span>
                      <span className={`font-semibold flex items-center gap-0.5 ${overBudget ? "text-red-500" : "text-green-600"}`}>
                        {overBudget ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {overBudget ? "Over budget" : "Within budget"}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${overBudget ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.min(100, (estimatedTotal / Math.max(1, budget)) * 100)}%` }} />
                    </div>
                  </div>

                  <Button
                    onClick={handleBookAll}
                    disabled={bookingInProgress || !selectedTransport || !selectedHotel}
                    className="w-full bg-blue-600 text-white py-3 flex items-center justify-center gap-2"
                  >
                    {bookingInProgress ? (<><Loader2 size={16} className="animate-spin" /> Booking your trip...</>) : (<>Book Entire Trip</>)}
                  </Button>
                  {bookingError && <p className="text-xs text-red-500 mt-2">{bookingError}</p>}
                  {!user?.id && <p className="text-xs text-gray-400 mt-2 text-center">Log in to book this trip</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trip confirmation */}
      {tripConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:static print:p-0">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden print:shadow-none max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between print:hidden sticky top-0">
              <div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={20} /> Trip Booked</div>
              <button onClick={() => { setTripConfirmation(null); router.push("/profile"); }} className="hover:opacity-80"><X size={20} /></button>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-1">Trip Reference</p>
              <p className="font-mono font-semibold text-gray-800 mb-4">{tripConfirmation.tripRef}</p>
              <p className="font-bold text-lg mb-4 flex items-center gap-1.5">{tripConfirmation.from} <ChevronRight size={16} className="text-gray-400" /> {tripConfirmation.to}</p>
              <div className="space-y-2 mb-4">
                {tripConfirmation.bookings.map((b: any) => (
                  <div key={b.ref} className="flex justify-between text-sm bg-gray-50 rounded-lg p-2.5">
                    <span className="text-gray-700">{b.label}</span>
                    <span className="font-semibold">₹{b.amount.toLocaleString()}</span>
                  </div>
                ))}
                {tripConfirmation.guideIncluded && (
                  <div className="flex justify-between text-sm bg-gray-50 rounded-lg p-2.5">
                    <span className="text-gray-700">Local Guide ({tripConfirmation.duration} days)</span>
                    <span className="font-semibold">₹{tripConfirmation.guideCost.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mb-5">
                <span className="text-gray-600 text-sm">Total Paid</span>
                <span className="text-xl font-bold">₹{tripConfirmation.total.toLocaleString()}</span>
              </div>
              <div className="flex gap-3 print:hidden">
                <Button onClick={() => window.print()} variant="outline" className="flex-1 flex items-center gap-2"><Printer size={16} /> Print</Button>
                <Button onClick={() => { setTripConfirmation(null); router.push("/profile"); }} className="flex-1 bg-blue-600 text-white">Go to My Bookings</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}