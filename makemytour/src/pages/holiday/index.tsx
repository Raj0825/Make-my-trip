import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
  MapPin, Calendar, Users, Wallet, Sparkles, Loader2,
  Sun, Utensils, Hotel, Camera, Info, Clock, ChevronDown, ChevronUp, Plane,
  CheckCircle2, Ticket, IndianRupee, ShieldCheck, AlertCircle, X, Printer, ArrowRight, Download
} from "lucide-react";
import { setUser } from "@/store";
import { handleholidaybooking } from "@/api";
import BackButton from "@/components/navigation/BackButton";
import FakePaymentModal from "@/components/payment/FakePaymentModal";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface DayPlan {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  food: string;
  tip: string;
}

interface Itinerary {
  destination: string;
  duration: number;
  budget: number;
  travelers: number;
  style: string;
  overview: string;
  highlights: string[];
  bestTimeToVisit: string;
  accommodation: string;
  estimatedCostBreakdown: { label: string; amount: number }[];
  days: DayPlan[];
  packingTips: string[];
}

interface Passenger {
  name: string;
  age: string;
  gender: string;
}

const POPULAR_HOLIDAY_CITIES = [
  "Goa",
  "Manali",
  "Shimla",
  "Kerala",
  "Kashmir",
  "Jaipur",
  "Udaipur",
  "Leh Ladakh",
  "Andaman",
  "Ooty",
  "Darjeeling",
  "Rishikesh",
  "Dubai",
  "Singapore",
  "Bali",
  "Bangkok",
  "Phuket",
  "Maldives",
  "Paris",
  "London",
  "Switzerland",
];

// ─────────────────────────────────────────────────────────────
//  Mock LLM Engine
// ─────────────────────────────────────────────────────────────
const DESTINATIONS: Record<string, Itinerary> = {
  goa: {
    destination: "Goa",
    duration: 5,
    budget: 20000,
    travelers: 2,
    style: "Adventure",
    overview:
      "A perfect blend of sun, sea, and culture. Goa offers pristine beaches, vibrant nightlife, historic Portuguese architecture, and some of the freshest seafood in India.",
    highlights: ["Baga & Anjuna Beach", "Fort Aguada", "Dudhsagar Waterfalls", "Night Market at Arpora", "Old Goa Churches"],
    bestTimeToVisit: "November to February (pleasant weather, peak season)",
    accommodation: "Beach-facing shack hotels in North Goa (avg ₹2,500/night)",
    estimatedCostBreakdown: [
      { label: "Accommodation (4 nights)", amount: 10000 },
      { label: "Food & Drinks", amount: 4000 },
      { label: "Local Transport (scooter rental)", amount: 2000 },
      { label: "Activities & Sightseeing", amount: 2500 },
      { label: "Shopping & Misc", amount: 1500 },
    ],
    days: [
      { day: 1, title: "Arrival & North Beach Bliss", morning: "Arrive at Dabolim Airport, check in to your hotel near Calangute. Freshen up and grab a hearty breakfast.", afternoon: "Explore Calangute and Baga Beach. Rent a scooter (₹350/day) for the trip. Try water sports like parasailing.", evening: "Walk along the Baga shoreline at sunset. Have dinner at a beachside shack — must try the Goan Fish Curry Rice.", food: "Infantaria Bakery (breakfast), Britto's (dinner)", tip: "Book water sports early morning — prices are lower and queues shorter." },
      { day: 2, title: "Forts & History", morning: "Visit Fort Aguada — arrive early for fewer crowds and great sunrise views.", afternoon: "Head to Old Goa. Explore the Basilica of Bom Jesus (UNESCO World Heritage Site) and Se Cathedral.", evening: "Stroll through Panaji's Latin Quarter (Fontainhas). Try the local bebinca dessert.", food: "Café Bhonsle (Goan thali lunch), Viva Panjim (dinner)", tip: "Old Goa churches are closed between 12:30–2:30 PM. Plan accordingly." },
      { day: 3, title: "Waterfalls & Wildlife", morning: "Early start for Dudhsagar Waterfalls (2.5 hr drive). Jeep safari through Bhagwan Mahavir Wildlife Sanctuary.", afternoon: "Swim at the waterfall base pool. Pack your own lunch — no restaurants nearby.", evening: "Return to the hotel. Relax with a sunset beach walk.", food: "Packed lunch recommended, Shack dinner back in North Goa", tip: "The falls are best from July–January. Carry waterproof footwear." },
      { day: 4, title: "Markets & Nightlife", morning: "Explore Anjuna Flea Market (Wednesday only) or Mapusa Friday Market for souvenirs.", afternoon: "Visit Chapora Fort for the iconic Dil Chahta Hai viewpoint.", evening: "Head to the Arpora Saturday Night Market — live music, food stalls, and artisan goods.", food: "Night Market food stalls (must try: chorizo pav, feni cocktails)", tip: "Carry cash to the markets — most vendors don't accept UPI." },
      { day: 5, title: "South Goa & Departure", morning: "Drive to South Goa — visit Palolem Beach, which is quieter and cleaner than the north.", afternoon: "Enjoy a final beach lunch. Head back to collect luggage and check out.", evening: "Depart from Dabolim Airport. Carry home some cashew feni and bebinca as gifts!", food: "Café Del Mar (beachside breakfast), local coconut water", tip: "South Goa roads can be tricky — use Google Maps offline." },
    ],
    packingTips: ["Light cotton clothes & beachwear", "Sunscreen SPF 50+", "Waterproof sandals", "Cash (ATMs can be unreliable in remote areas)", "Reusable water bottle"],
  },
  manali: {
    destination: "Manali",
    duration: 5,
    budget: 20000,
    travelers: 2,
    style: "Adventure",
    overview:
      "Nestled in the Himalayas, Manali is a paradise for adventure seekers and nature lovers. From snow-capped peaks to lush valleys, every corner offers a breathtaking view.",
    highlights: ["Rohtang Pass", "Solang Valley", "Hadimba Temple", "Old Manali", "Beas River Rafting"],
    bestTimeToVisit: "March to June (summer) or December to February (snow lovers)",
    accommodation: "Cosy guesthouses in Old Manali (avg ₹1,800/night)",
    estimatedCostBreakdown: [
      { label: "Accommodation (4 nights)", amount: 7200 },
      { label: "Food & Drinks", amount: 3500 },
      { label: "Local Transport & Taxis", amount: 3500 },
      { label: "Activities (skiing/rafting)", amount: 4000 },
      { label: "Shopping & Misc", amount: 1800 },
    ],
    days: [
      { day: 1, title: "Arrival & Old Manali Vibes", morning: "Arrive in Manali. Settle into your guesthouse in Old Manali and acclimatize (important for altitude).", afternoon: "Stroll through Old Manali Market. Visit Manu Temple, dedicated to sage Manu.", evening: "Walk across the Manu Allain Bridge. Have momos and thukpa at a local café.", food: "Drifters' Inn Café (breakfast), Café 1947 (evening)", tip: "Don't exert too much on day 1 — altitude sickness is real above 2,000m." },
      { day: 2, title: "Solang Valley Adventure", morning: "Head to Solang Valley (14 km from Manali). Try zorbing, paragliding, or skiing depending on season.", afternoon: "Visit the Beas Kund trekking trail if snow permits. Beautiful mountain meadows.", evening: "Return to Manali. Explore The Mall Road for shopping — Kullu shawls and dry fruits.", food: "Johnsons Café (lunch), Drifters' Inn (dinner)", tip: "Hire a private cab for Solang (₹800–1,000) — shared taxis are unreliable." },
      { day: 3, title: "Rohtang Pass (Permits Required)", morning: "Book Rohtang Pass permit online (₹500/car) a day ahead. Start at 6 AM to beat crowds.", afternoon: "Enjoy snow activities at the top — snowfall, skiing, and photography.", evening: "Return by 3 PM (mandatory). Relax with a warm Himachali dham dinner.", food: "Packed lunch at Rohtang, Manali Dhaba (dinner)", tip: "Permit is mandatory. Book at https://rohtangpermits.nic.in — slots fill fast." },
      { day: 4, title: "Temples & River Rafting", morning: "Visit Hadimba Devi Temple (1553 AD) — stunning pagoda architecture in a cedar forest.", afternoon: "Beas River white-water rafting at Pirdi (₹600/person, 14 km stretch).", evening: "Kullu town stroll. Visit Raghunath Temple and local handicraft shops.", food: "Mayur Restaurant (lunch), Café Amigos (dinner)", tip: "Wear woollen layers even in summer — the river is ice cold." },
      { day: 5, title: "Vashisht & Departure", morning: "Visit Vashisht Village — try the natural hot sulphur springs (great for sore muscles). See Vashisht Temple.", afternoon: "Final souvenir shopping — buy Kullu shawls, Himachali caps, and local honey.", evening: "Board overnight bus or take taxi to Chandigarh for your flight home.", food: "Freedom Café Vashisht (brunch), dhaba food for the road", tip: "Book your return transport 2 days in advance — Manali buses fill up fast." },
    ],
    packingTips: ["Heavy woolens & thermals", "Waterproof trekking shoes", "Sunglasses & sunscreen", "ID proof (required at Rohtang)", "Personal first-aid kit & AMS tablets"],
  },
  kerala: {
    destination: "Kerala",
    duration: 5,
    budget: 20000,
    travelers: 2,
    style: "Relaxing",
    overview:
      "God's Own Country — Kerala is a tropical paradise of backwaters, misty hill stations, Ayurvedic spas, and elephant sanctuaries that refreshes your soul.",
    highlights: ["Alleppey Houseboat", "Munnar Tea Gardens", "Periyar Wildlife Sanctuary", "Kovalam Beach", "Kathakali Dance Show"],
    bestTimeToVisit: "September to March (post-monsoon greenery is at its peak)",
    accommodation: "Houseboat (1 night) + resort in Munnar (avg ₹2,200/night)",
    estimatedCostBreakdown: [
      { label: "Accommodation (4 nights)", amount: 8800 },
      { label: "Food & Meals", amount: 3500 },
      { label: "Houseboat Day Cruise", amount: 3500 },
      { label: "Transport (train + local)", amount: 2500 },
      { label: "Activities & Misc", amount: 1700 },
    ],
    days: [
      { day: 1, title: "Arrival in Kochi", morning: "Arrive in Kochi (Cochin). Check in near Fort Kochi area.", afternoon: "Visit the iconic Chinese Fishing Nets at the waterfront. Explore Fort Kochi and its colonial lanes.", evening: "Watch a Kathakali classical dance performance (book ahead). Savor Kerala Sadya dinner.", food: "Dhe Puttu (breakfast), Dal Roti (dinner near Fort Kochi)", tip: "Kathakali shows start at 6 PM — arrive early to watch the 30-min makeup session." },
      { day: 2, title: "Alleppey Backwaters", morning: "Morning train from Kochi to Alleppey (Alappuzha) — 1.5 hr journey through paddy fields.", afternoon: "Board your overnight houseboat. Float through the backwater canals of Vembanad Lake.", evening: "Watch the sunset from the boat deck. Freshly cooked Kerala fish curry dinner on board.", food: "All meals served on houseboat (included in package)", tip: "Book a houseboat with an attached bathroom. Avoid very cheap boats — quality varies wildly." },
      { day: 3, title: "Munnar Hill Station", morning: "Disembark from houseboat. Drive to Munnar (3.5 hrs). Arrive in lush tea country.", afternoon: "Visit Mattupetty Dam and Echo Point. Stroll through sprawling tea plantations.", evening: "Tea Museum tour (₹250/person). Buy freshly processed teas to take home.", food: "Saravana Bhavan (lunch en route), Rapsy Restaurant Munnar (dinner)", tip: "The roads to Munnar are winding — carry motion sickness tablets if prone." },
      { day: 4, title: "Periyar Wildlife Sanctuary", morning: "Drive to Thekkady (1.5 hr). Take a boat ride on Periyar Lake inside the wildlife sanctuary.", afternoon: "Spice plantation tour — see cardamom, pepper, cloves growing naturally.", evening: "Return to Munnar. Try a traditional Ayurvedic head massage (₹500, 45 min).", food: "Ebony's Restaurant (lunch), Saravana Bhavan (dinner)", tip: "Book the 7 AM boat ride for best wildlife sightings (elephants come to the shore)." },
      { day: 5, title: "Kovalam Beach & Departure", morning: "Drive to Kovalam Beach (4 hrs from Munnar). Quick beach time and light swim.", afternoon: "Visit Vizhinjam Lighthouse for panoramic views. Head to Trivandrum airport.", evening: "Fly home with memories of Gods Own Country.", food: "Coconut water & fresh fish fry on Kovalam beach", tip: "Kovalam has riptides — only swim in designated zones with lifeguards." },
    ],
    packingTips: ["Light cottons (humid climate)", "Mosquito repellent", "Flip-flops for backwaters", "Small backpack for day trips", "Power bank (limited charging on houseboat)"],
  },
};

function generateMockItinerary(destination: string, duration: number, budget: number, travelers: number, style: string): Itinerary {
  const key = destination.toLowerCase().replace(/\s+/g, "");
  const matchedKey = Object.keys(DESTINATIONS).find((k) => key.includes(k) || k.includes(key));
  const base: Itinerary = matchedKey ? DESTINATIONS[matchedKey] : DESTINATIONS["goa"];

  const budgetRatio = budget / base.budget;
  const durationRatio = duration / base.duration;
  const scaledBreakdown = base.estimatedCostBreakdown.map((item) => ({
    label: item.label,
    amount: Math.round(item.amount * budgetRatio * durationRatio),
  }));

  const days = base.days.slice(0, Math.min(duration, base.days.length));
  while (days.length < duration) {
    const last = days[days.length - 1];
    days.push({ ...last, day: days.length + 1, title: `Day ${days.length + 1}: Explore & Relax` });
  }

  return {
    ...base,
    destination: destination,
    duration,
    budget,
    travelers,
    style,
    estimatedCostBreakdown: scaledBreakdown,
    days,
  };
}

// ─────────────────────────────────────────────────────────────
//  UI Components
// ─────────────────────────────────────────────────────────────
function DayCard({ plan }: { plan: DayPlan }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all">
      <button
        className="w-full flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
            {plan.day}
          </span>
          <span className="font-semibold text-gray-800 text-left">{plan.title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-6 pb-5 space-y-3 border-t border-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1"><Sun size={12} /> Morning</p>
              <p className="text-sm text-gray-700">{plan.morning}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><Camera size={12} /> Afternoon</p>
              <p className="text-sm text-gray-700">{plan.afternoon}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1"><Clock size={12} /> Evening</p>
              <p className="text-sm text-gray-700">{plan.evening}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-green-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1"><Utensils size={12} /> Food Spots</p>
              <p className="text-sm text-gray-700">{plan.food}</p>
            </div>
            <div className="flex-1 bg-rose-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-rose-700 mb-1 flex items-center gap-1"><Info size={12} /> Pro Tip</p>
              <p className="text-sm text-gray-700">{plan.tip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────
const TRAVEL_STYLES = ["Adventure", "Relaxing", "Cultural", "Romantic", "Family", "Budget"];

export default function HolidayPlannerPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);

  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState(20000);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("Adventure");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  // Traveler form state
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", age: "", gender: "Male" },
    { name: "", age: "", gender: "Female" },
  ]);

  // Payment and booking state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const handleDownloadTicket = () => {
    if (!confirmedBooking || !itinerary) return;
    const travelersList = passengers
      .map((p, i) => `${i + 1}. ${p.name} (${p.gender}, Age ${p.age})`)
      .join("<br/>");
    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>Holiday Ticket ${confirmedBooking.bookingId}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111;background:#f9fafb}
        .card{border:1px solid #e5e7eb;border-radius:12px;padding:24px;max-width:580px;margin:0 auto;background:#fff}
        .brand-header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:16px}
        .brand-logo{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:bold;color:#1e293b}
        .badge{font-size:11px;font-weight:bold;text-transform:uppercase;background:#eff6ff;color:#2563eb;padding:4px 8px;border-radius:6px}
        h1{font-size:18px;margin:0 0 4px}
        .muted{color:#6b7280;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        td{padding:6px 0;font-size:13px;vertical-align:top}
        .label{color:#6b7280;white-space:nowrap;padding-right:12px}
        .total{font-size:16px;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
      </style></head><body>
      <div class="card">
        <div class="brand-header">
          <div class="brand-logo">
            <span style="color:#ef4444;font-size:22px;">✈</span>
            <span>MakeMyTour</span>
          </div>
          <span class="badge">Holiday Package Master Ticket</span>
        </div>
        <h1>${itinerary.destination} Holiday Package</h1>
        <p class="muted">Master PNR: ${confirmedBooking.bookingId}</p>
        <table>
          <tr><td class="label">Duration</td><td>${itinerary.duration} Days / ${Math.max(1, itinerary.duration - 1)} Nights</td></tr>
          <tr><td class="label">Travel Style</td><td>${itinerary.style}</td></tr>
          <tr><td class="label">Accommodation</td><td>${itinerary.accommodation}</td></tr>
          <tr><td class="label">Travelers</td><td>${travelersList}</td></tr>
          <tr><td class="label">Inclusions</td><td>Daily transport passes, hotel accommodation, and ${itinerary.highlights.length} guided activities</td></tr>
        </table>
        <p class="total">Total Paid: ₹${totalBudget.toLocaleString("en-IN")}</p>
      </div>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `holiday-ticket-${confirmedBooking.bookingId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore state from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("mmt_ai_holiday_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.destination) setDestination(parsed.destination);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.budget) setBudget(parsed.budget);
        if (parsed.travelers) setTravelers(parsed.travelers);
        if (parsed.style) setStyle(parsed.style);
        if (parsed.itinerary) setItinerary(parsed.itinerary);
        if (parsed.passengers && Array.isArray(parsed.passengers)) {
          setPassengers(parsed.passengers);
        }
      }
    } catch {}
  }, []);

  // Sync state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "mmt_ai_holiday_state",
        JSON.stringify({
          destination,
          duration,
          budget,
          travelers,
          style,
          itinerary,
          passengers,
        })
      );
    } catch {}
  }, [destination, duration, budget, travelers, style, itinerary, passengers]);

  // Adjust passenger array when travelers count changes
  const handleTravelersChange = (count: number) => {
    const validCount = Math.max(1, Math.min(20, count));
    setTravelers(validCount);
    setPassengers((prev) => {
      const next = [...prev];
      if (validCount > next.length) {
        for (let i = next.length; i < validCount; i++) {
          next.push({ name: "", age: "", gender: i % 2 === 0 ? "Male" : "Female" });
        }
      } else if (validCount < next.length) {
        next.splice(validCount);
      }
      return next;
    });
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    setItinerary(null);
    setBookingError("");
    await new Promise((r) => setTimeout(r, 1800));
    const result = generateMockItinerary(destination.trim(), duration, budget, travelers, style);
    setItinerary(result);
    setLoading(false);
  };

  const totalBudget = itinerary?.estimatedCostBreakdown.reduce((s, i) => s + i.amount, 0) ?? 0;

  const handleStartBooking = () => {
    setBookingError("");
    if (!user?.id) {
      setBookingError("Please log in to your account to book this holiday package.");
      return;
    }

    // Validate passenger details
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        setBookingError(`Please enter the full name for Traveler ${i + 1}.`);
        return;
      }
      const ageNum = parseInt(passengers[i].age);
      if (!passengers[i].age || isNaN(ageNum) || ageNum <= 0) {
        setBookingError(`Please enter a valid age for Traveler ${i + 1}.`);
        return;
      }
    }

    // Strict Age Limit: Primary traveler must be >= 18
    const leadAge = parseInt(passengers[0].age);
    if (leadAge < 18) {
      setBookingError("The lead traveler (Traveler 1) must be at least 18 years old to book a holiday package.");
      return;
    }

    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!itinerary || !user?.id) return;
    setIsPaymentOpen(false);
    setIsBooking(true);
    setBookingError("");

    try {
      const bookedData = await handleholidaybooking(
        user.id,
        itinerary.destination,
        itinerary.travelers,
        itinerary.duration,
        totalBudget,
        itinerary.accommodation,
        itinerary.style,
        passengers
      );

      // Consolidate booking in Redux & localStorage
      const updatedBookings = [...(user.bookings || []), bookedData];
      const pts = Math.floor(totalBudget);
      const updatedUser = {
        ...user,
        bookings: updatedBookings,
        loyaltyPoints: (user.loyaltyPoints || 0) + pts,
        loyaltyEarned: (user.loyaltyEarned || 0) + pts,
      };
      dispatch(setUser(updatedUser));
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch {}

      setConfirmedBooking(bookedData);
      setShowTicketModal(true);
    } catch (err: any) {
      console.error(err);
      setBookingError(err?.response?.data?.message || err?.message || "Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-12 px-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <BackButton fallbackUrl="/" variant="light" className="mb-4" />
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <span className="bg-white/20 rounded-full px-4 py-1 text-sm font-medium flex items-center gap-2 backdrop-blur-sm">
                <Sparkles size={14} /> AI-Powered Holiday Planner
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-2">Plan Your Dream Trip</h1>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto">
              Personalized day-by-day itineraries with complete accommodation, transport, and sightseeing consolidated into a single master ticket.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={20} /> Customize Your Holiday
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Destination Dropdown */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <MapPin size={14} className="text-indigo-600" /> Choose Destination City
              </label>
              <div className="space-y-2">
                <select
                  value={POPULAR_HOLIDAY_CITIES.includes(destination) ? destination : destination ? "custom" : ""}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setDestination("");
                    } else {
                      setDestination(e.target.value);
                    }
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition bg-white font-medium shadow-sm"
                >
                  <option value="" disabled>Select a city to explore...</option>
                  <optgroup label="Popular Indian Cities & Destinations">
                    <option value="Goa">Goa (Beaches & Nightlife)</option>
                    <option value="Manali">Manali (Snow & Valleys)</option>
                    <option value="Shimla">Shimla (Colonial Charm & Hills)</option>
                    <option value="Kerala">Kerala (Backwaters, Munnar & Alleppey)</option>
                    <option value="Kashmir">Kashmir (Srinagar & Gulmarg)</option>
                    <option value="Jaipur">Jaipur (Pink City & Forts)</option>
                    <option value="Udaipur">Udaipur (City of Lakes & Palaces)</option>
                    <option value="Leh Ladakh">Leh Ladakh (Pangong Lake & Passes)</option>
                    <option value="Andaman">Andaman & Nicobar (Havelock & Radhanagar)</option>
                    <option value="Ooty">Ooty & Coonoor (Nilgiri Hills)</option>
                    <option value="Darjeeling">Darjeeling & Gangtok (Tea Estates)</option>
                    <option value="Rishikesh">Rishikesh & Haridwar (Ganga & Rafting)</option>
                  </optgroup>
                  <optgroup label="Popular International Cities">
                    <option value="Dubai">Dubai (Burj Khalifa, Desert Safari & Marina)</option>
                    <option value="Singapore">Singapore (Sentosa Island & Marina Bay)</option>
                    <option value="Bali">Bali (Ubud, Kuta & Temple Culture)</option>
                    <option value="Bangkok">Bangkok & Pattaya (City Life & Coral Islands)</option>
                    <option value="Phuket">Phuket (Phi Phi Islands & Beaches)</option>
                    <option value="Maldives">Maldives (Overwater Bungalows & Coral Reefs)</option>
                    <option value="Paris">Paris (Eiffel Tower & Louvre Museum)</option>
                    <option value="London">London (Big Ben, London Eye & Heritage)</option>
                    <option value="Switzerland">Switzerland (Interlaken, Lucerne & Alps)</option>
                  </optgroup>
                  <option value="custom">Other / Type Custom City...</option>
                </select>

                {(!POPULAR_HOLIDAY_CITIES.includes(destination) || destination === "") && (
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Type city name (e.g. Amritsar, Coorg, Rome, New York)..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-gray-50/70"
                  />
                )}

                {/* Quick selection chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Goa", "Manali", "Kerala", "Kashmir", "Dubai", "Singapore", "Bali", "Udaipur"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDestination(c)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        destination === c
                          ? "border-black bg-black text-white font-medium"
                          : "border-gray-200 text-gray-600 bg-white hover:border-gray-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Calendar size={14} className="text-indigo-600" /> Duration (days)
              </label>
              <input
                type="number" min={1} max={14}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Users size={14} className="text-indigo-600" /> Travelers
              </label>
              <input
                type="number" min={1} max={20}
                value={travelers}
                onChange={(e) => handleTravelersChange(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Wallet size={14} className="text-indigo-600" /> Total Target Budget (₹)
              </label>
              <input
                type="number" min={1000} step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Plane size={14} className="text-indigo-600" /> Travel Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition bg-white"
              >
                {TRAVEL_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !destination.trim()}
            className="mt-6 w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-base shadow-md"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> AI is crafting your holiday package…</>
            ) : (
              <><Sparkles size={18} /> Generate Holiday Package</>
            )}
          </button>
        </div>

        {/* Result */}
        {itinerary && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{itinerary.destination}</h2>
                  <p className="text-gray-500 mt-1">{itinerary.duration} Days · {itinerary.travelers} Traveler{itinerary.travelers > 1 ? "s" : ""} · {itinerary.style} Style</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-4 py-1.5 rounded-full text-sm">
                    Total Package: ₹{totalBudget.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">Includes Stay, Sightseeing & Passes</span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">{itinerary.overview}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1"><Calendar size={13} /> Best Time to Visit</p>
                  <p className="text-sm text-gray-800 font-medium">{itinerary.bestTimeToVisit}</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-indigo-600 mb-1 flex items-center gap-1"><Hotel size={13} /> Recommended Stay</p>
                  <p className="text-sm text-gray-800 font-medium">{itinerary.accommodation}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🌟 Included In Package Highlights</p>
                <div className="flex flex-wrap gap-2">
                  {itinerary.highlights.map((h) => (
                    <span key={h} className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Wallet className="text-emerald-500" size={20} /> All-Inclusive Package Breakdown
              </h3>
              <div className="space-y-3">
                {itinerary.estimatedCostBreakdown.map((item) => {
                  const pct = Math.round((item.amount / totalBudget) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold text-gray-900">₹{item.amount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-4 border-t border-gray-100 font-bold text-gray-900 text-base">
                  <span>Grand Total Package Price</span>
                  <span className="text-blue-600 text-lg">₹{totalBudget.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Day-by-Day */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sun className="text-amber-500" size={20} /> Consolidated Day-by-Day Schedule
              </h3>
              <div className="space-y-3">
                {itinerary.days.map((day) => <DayCard key={day.day} plan={day} />)}
              </div>
            </div>

            {/* Packing Tips */}
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🎒 Packing Checklist
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itinerary.packingTips.map((tip) => (
                  <li key={tip} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                SINGLE CONSOLIDATED TICKET BOOKING SECTION
            ══════════════════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-blue-200">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-blue-100">
                <div>
                  <span className="bg-blue-100 text-blue-800 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                    Single Ticket Guarantee
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 mt-2">
                    Book Complete {itinerary.destination} Package
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Your hotel stay, transport passes, and daily activities will be issued under <strong>1 single Master PNR ticket</strong>.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Total Payable</span>
                  <div className="text-3xl font-black text-blue-600 flex items-center gap-0.5 justify-end">
                    <IndianRupee size={24} />
                    {totalBudget.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Package Inclusions summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Hotel size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Hotel / Stay</p>
                    <p className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">{itinerary.accommodation}</p>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Plane size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Transport Pass</p>
                    <p className="text-xs font-semibold text-gray-800">All {itinerary.duration} Days Covered</p>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Ticket size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Activity Passes</p>
                    <p className="text-xs font-semibold text-gray-800">{itinerary.highlights.length} Experiences Included</p>
                  </div>
                </div>
              </div>

              {/* Traveler Details Form */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <Users size={18} className="text-blue-600" /> Traveler Information ({passengers.length})
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">Lead traveler must be 18+</span>
                </div>

                <div className="space-y-3">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                          Traveler {idx + 1} {idx === 0 ? "(Lead Contact)" : ""}
                        </span>
                        {idx === 0 && (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                            Must be 18 or older
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-6">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Rahul Sharma"
                            value={p.name}
                            onChange={(e) => handlePassengerChange(idx, "name", e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Age</label>
                          <input
                            type="number"
                            min={idx === 0 ? 18 : 1}
                            max={120}
                            placeholder={idx === 0 ? "18+" : "Age"}
                            value={p.age}
                            onChange={(e) => handlePassengerChange(idx, "age", e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(idx, "gender", e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="mb-5 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleStartBooking}
                disabled={isBooking}
                className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-lg disabled:opacity-50"
              >
                {isBooking ? (
                  <><Loader2 className="animate-spin" size={20} /> Processing Single Ticket Booking…</>
                ) : (
                  <>
                    <ShieldCheck size={22} />
                    Confirm & Pay for Complete Package • ₹{totalBudget.toLocaleString("en-IN")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Payment Modal
      ───────────────────────────────────────────────────────────── */}
      <FakePaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalBudget}
      />

      {/* ─────────────────────────────────────────────────────────────
          Consolidated Single Ticket Modal
      ───────────────────────────────────────────────────────────── */}
      {showTicketModal && confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-6 text-white text-center relative">
              <button
                onClick={() => setShowTicketModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1.5 transition"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                Single Ticket Confirmed
              </span>
              <h2 className="text-2xl font-black mt-2">{itinerary?.destination} Holiday Package</h2>
              <p className="text-blue-100 text-xs mt-0.5 font-mono">Master PNR: {confirmedBooking.bookingId}</p>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-5">
              {/* Properly aligned MakeMyTour Logo Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-xl font-bold">✈</span>
                  <span className="font-bold text-gray-900 text-lg">MakeMyTour</span>
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                  Single Master Ticket
                </span>
              </div>

              {/* Key Details Grid */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Duration</span>
                  <span className="font-bold text-gray-800">{itinerary?.duration} Days / {Math.max(1, (itinerary?.duration || 1) - 1)} Nights</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Travel Style</span>
                  <span className="font-bold text-gray-800">{itinerary?.style}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-400 block font-medium">Accommodation Included</span>
                  <span className="font-semibold text-gray-800 text-xs">{itinerary?.accommodation}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 block font-medium">Consolidated Inclusions</span>
                  <span className="text-xs text-gray-700">Daily transport passes, hotel stay, and {itinerary?.highlights.length} guided activities.</span>
                </div>
              </div>

              {/* Travelers */}
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Travelers ({passengers.length})
                </span>
                <div className="space-y-1.5">
                  {passengers.map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <span className="font-semibold text-gray-800">{i + 1}. {p.name}</span>
                      <span className="text-gray-500">{p.gender} · Age {p.age}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Row */}
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase block">Total Amount Paid</span>
                  <span className="text-xs text-emerald-600">Earned +{Math.floor(totalBudget)} Loyalty Points</span>
                </div>
                <div className="text-2xl font-black text-emerald-700 flex items-center gap-0.5">
                  <IndianRupee size={20} />
                  {totalBudget.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 print:hidden">
                <button
                  onClick={() => router.push("/profile")}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition"
                >
                  <Ticket size={16} /> View in My Bookings
                </button>
                <button
                  onClick={handleDownloadTicket}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition"
                >
                  <Download size={16} /> Download Ticket
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition"
                >
                  <Printer size={16} /> Print Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}