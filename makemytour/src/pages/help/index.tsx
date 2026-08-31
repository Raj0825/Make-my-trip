import { useState } from "react";
import { useSelector } from "react-redux";
import {
  LifeBuoy, ChevronDown, Search, Mail, Phone, MessageCircle, Plane, Building2,
  TrainFront, Bus as BusIcon, Car as CarIcon, Home as HomeIcon, CreditCard, Shield,
  CheckCircle2, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FAQ { q: string; a: string; category: string; }

const CATEGORIES = [
  { key: "all", label: "All Topics", icon: LifeBuoy },
  { key: "booking", label: "Bookings", icon: CheckCircle2 },
  { key: "cancellation", label: "Cancellation & Refunds", icon: CreditCard },
  { key: "payment", label: "Payments", icon: CreditCard },
  { key: "insurance", label: "Travel Insurance", icon: Shield },
  { key: "account", label: "Account", icon: MessageCircle },
];

const FAQS: FAQ[] = [
  { category: "booking", q: "How do I book a train, bus, flight, cab, or homestay?", a: "Search your route from the homepage, pick a listing, choose your seat/room/class on the detail page, and confirm — you'll get an e-ticket instantly with a QR code, PNR, and Print/Download options." },
  { category: "booking", q: "Can I book multiple travelers at once?", a: "Yes — every booking page lets you set the number of passengers/rooms/seats before confirming, and the fare summary updates live as you change it." },
  { category: "booking", q: "How do I use the Holiday Planner?", a: "Go to Holiday from the homepage nav, enter your from/to cities, budget, duration, and traveler count. It recommends transport, a hotel, things to do, food, and photo spots, and can book the whole trip in one click." },
  { category: "cancellation", q: "How do I cancel a booking?", a: "Open My Bookings in your profile, find the booking, and tap Cancel. You'll see your refund eligibility before confirming." },
  { category: "cancellation", q: "What's the refund policy?", a: "You're eligible for a 50% refund if you cancel within 24 hours of booking. After 24 hours, cancellations are not eligible for a refund. Refunds are typically processed within 7 working days." },
  { category: "cancellation", q: "Where can I track my refund?", a: "Once a cancellation is processed, a 'Track Refund' link appears on that booking in My Bookings, showing the current refund status." },
  { category: "payment", q: "What payment methods are supported?", a: "UPI, credit/debit cards, wallet balance, and cash-on-arrival for cabs are all supported at checkout." },
  { category: "payment", q: "Why did my price change slightly at checkout?", a: "Prices update live via our dynamic pricing engine based on demand — the small difference you may see reflects that, and is always shown clearly before you confirm." },
  { category: "insurance", q: "What does Travel Insurance cover?", a: "Our add-on travel insurance (available for a small fee during any booking) covers flight delay/cancellation, accidental death, medical emergencies, and baggage loss. Coverage amounts are shown before you add it." },
  { category: "insurance", q: "How do I get a copy of my insurance policy?", a: "Your policy details (including policy number and coverage) appear directly on your e-ticket/receipt if you added insurance during booking, and you can print or download it from there." },
  { category: "account", q: "How do I update my profile details?", a: "Go to your Profile and tap Edit Profile to update your name, email, or phone number." },
  { category: "account", q: "How do I save a listing for later?", a: "Tap the heart icon on any train, bus, flight, cab, hotel, or homestay page to save it — find all your saved listings under My Wishlist in your profile." },
];

export default function HelpCenterPage() {
  const user = useSelector((state: any) => state.user.user);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [form, setForm] = useState({ name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "", email: user?.email || "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const filtered = FAQS.filter((f) => {
    const matchesCategory = category === "all" || f.category === category;
    const matchesQuery = !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No support-ticket backend exists yet — this simply confirms receipt in
    // the UI. Wire this up to a real ticketing endpoint/email service later.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <LifeBuoy size={30} /> Help & Support
          </h1>
          <p className="text-blue-100 mb-6">Search our FAQs or reach out — we're happy to help.</p>
          <div className="relative max-w-lg mx-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for help (e.g. refund, cancellation, insurance)"
              className="w-full rounded-full pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-16 space-y-6">
        {/* Quick contact options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="tel:+911800123456" className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><Phone size={16} className="text-blue-600" /></div>
            <div><p className="text-sm font-semibold">Call Us</p><p className="text-xs text-gray-500">1800-123-456 (24x7)</p></div>
          </a>
          <a href="mailto:support@makemytour.example" className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><Mail size={16} className="text-blue-600" /></div>
            <div><p className="text-sm font-semibold">Email Us</p><p className="text-xs text-gray-500">support@makemytour.example</p></div>
          </a>
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><MessageCircle size={16} className="text-blue-600" /></div>
            <div><p className="text-sm font-semibold">Live Chat</p><p className="text-xs text-gray-500">Use the form below</p></div>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.key;
            return (
              <button key={c.key} type="button" onClick={() => setCategory(c.key)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}>
                <Icon size={12} /> {c.label}
              </button>
            );
          })}
        </div>

        {/* FAQ accordion */}
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No results for "{query}" — try a different search or browse a category above.</p>
          ) : (
            filtered.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={faq.q} className="border-b border-gray-100 last:border-0">
                  <button type="button" onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between text-left py-4 px-2">
                    <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                    <ChevronDown size={16} className={`text-gray-400 shrink-0 ml-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && <p className="text-sm text-gray-600 px-2 pb-4">{faq.a}</p>}
                </div>
              );
            })
          )}
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">Still need help? Send us a message</h2>
          {submitted ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-gray-800">Message received!</p>
              <p className="text-sm text-gray-500">Our support team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea id="message" required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white flex items-center justify-center gap-2">
                <Send size={14} /> Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}