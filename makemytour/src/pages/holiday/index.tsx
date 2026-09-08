import { useState } from "react";
import {
  MapPin, Calendar, Users, Wallet, Sparkles, Loader2,
  Sun, Utensils, Hotel, Camera, Info, Clock, ChevronDown, ChevronUp, Plane
} from "lucide-react";

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

  // Find closest matching destination
  const matchedKey = Object.keys(DESTINATIONS).find((k) => key.includes(k) || k.includes(key));
  const base: Itinerary = matchedKey ? DESTINATIONS[matchedKey] : DESTINATIONS["goa"];

  // Scale the budget breakdown proportionally
  const budgetRatio = budget / base.budget;
  const durationRatio = duration / base.duration;
  const scaledBreakdown = base.estimatedCostBreakdown.map((item) => ({
    label: item.label,
    amount: Math.round(item.amount * budgetRatio * durationRatio),
  }));

  const days = base.days.slice(0, Math.min(duration, base.days.length));
  // Pad days if needed
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
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState(20000);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("Adventure");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const handleGenerate = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    setItinerary(null);
    // Simulate AI "thinking" delay
    await new Promise((r) => setTimeout(r, 2200));
    const result = generateMockItinerary(destination.trim(), duration, budget, travelers, style);
    setItinerary(result);
    setLoading(false);
  };

  const totalBudget = itinerary?.estimatedCostBreakdown.reduce((s, i) => s + i.amount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <span className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2">
              <Sparkles size={14} /> AI-Powered Holiday Planner
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Plan Your Dream Trip</h1>
          <p className="text-blue-100 text-lg">Tell us where you want to go — our AI creates a personalized day-by-day itinerary in seconds.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Input Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-10 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={20} /> Tell us about your trip
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Destination */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                <MapPin size={14} /> Destination
              </label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Goa, Manali, Kerala, Rajasthan…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                <Calendar size={14} /> Duration (days)
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
              <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                <Users size={14} /> Travelers
              </label>
              <input
                type="number" min={1} max={20}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                <Wallet size={14} /> Budget (₹)
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
              <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                <Plane size={14} /> Travel Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              >
                {TRAVEL_STYLES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !destination.trim()}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> AI is crafting your itinerary…</>
            ) : (
              <><Sparkles size={18} /> Generate My Itinerary</>
            )}
          </button>
        </div>

        {/* Result */}
        {itinerary && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{itinerary.destination}</h2>
                  <p className="text-gray-500 mt-1">{itinerary.duration} Days · {itinerary.travelers} Traveler{itinerary.travelers > 1 ? "s" : ""} · {itinerary.style}</p>
                </div>
                <span className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-full text-sm">
                  Budget: ₹{itinerary.budget.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">{itinerary.overview}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1"><Calendar size={12} /> Best Time to Visit</p>
                  <p className="text-sm text-gray-700">{itinerary.bestTimeToVisit}</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-indigo-600 mb-2 flex items-center gap-1"><Hotel size={12} /> Recommended Stay</p>
                  <p className="text-sm text-gray-700">{itinerary.accommodation}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-5">
                <p className="text-sm font-semibold text-gray-600 mb-2">🌟 Trip Highlights</p>
                <div className="flex flex-wrap gap-2">
                  {itinerary.highlights.map((h) => (
                    <span key={h} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{h}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Wallet className="text-green-500" size={20} /> Estimated Budget Breakdown
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
                <div className="flex justify-between pt-3 border-t border-gray-100 font-bold text-gray-900">
                  <span>Total Estimate</span>
                  <span>₹{totalBudget.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Day-by-Day */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sun className="text-amber-500" size={20} /> Day-by-Day Itinerary
              </h3>
              <div className="space-y-3">
                {itinerary.days.map((day) => <DayCard key={day.day} plan={day} />)}
              </div>
            </div>

            {/* Packing Tips */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
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
          </div>
        )}
      </div>
    </div>
  );
}