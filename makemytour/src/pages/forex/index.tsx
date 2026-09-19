import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeftRight,
  Banknote,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  CreditCard,
  Wallet,
  FileText,
  CheckCircle2,
  Printer,
  Download,
  X,
  Info,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/navigation/BackButton";

// ---------------------------------------------------------------------------
// Static base rates (INR per 1 unit of foreign currency). A small deterministic
// "live" jitter is applied every few seconds so the page feels real-time,
// the way a forex site's ticking rates do — this is a demo, not a live feed.
// ---------------------------------------------------------------------------
interface CurrencyDef {
  code: string;
  name: string;
  flag: string;
  baseRate: number; // INR per 1 unit
}

const CURRENCIES: CurrencyDef[] = [
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", baseRate: 1 },
  { code: "USD", name: "US Dollar", flag: "🇺🇸", baseRate: 95 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", baseRate: 103.4 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", baseRate: 120.4 },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", baseRate: 25.87 },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", baseRate: 70.6 },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", baseRate: 61.95 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", baseRate: 0.64 },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭", baseRate: 2.65 },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", baseRate: 69.6 },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000];

const EXCHANGE_LOCATIONS = [
  { name: "MakeMyTour Forex – Andheri", city: "Mumbai", address: "Shop 4, SV Road, Andheri West", hours: "9:30 AM – 7:30 PM", rating: 4.6 },
  { name: "MakeMyTour Forex – Connaught Place", city: "Delhi", address: "Block A, Inner Circle, CP", hours: "10:00 AM – 8:00 PM", rating: 4.7 },
  { name: "MakeMyTour Forex – Koramangala", city: "Bangalore", address: "80 Feet Road, Koramangala 5th Block", hours: "9:00 AM – 7:00 PM", rating: 4.5 },
  { name: "MakeMyTour Forex – Airport T2", city: "Mumbai", address: "Departure Level, Terminal 2, CSMIA", hours: "24 Hours", rating: 4.3 },
  { name: "MakeMyTour Forex – Banjara Hills", city: "Hyderabad", address: "Road No. 12, Banjara Hills", hours: "9:30 AM – 7:00 PM", rating: 4.6 },
  { name: "MakeMyTour Forex – Salt Lake", city: "Kolkata", address: "Sector V, Salt Lake City", hours: "10:00 AM – 6:30 PM", rating: 4.4 },
];

const CITIES = Array.from(new Set(EXCHANGE_LOCATIONS.map((l) => l.city)));

function hashJitter(seed: string, tick: number) {
  let hash = 0;
  const s = seed + tick;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) % 10000;
  return (hash / 10000 - 0.5) * 0.006; // ±0.3% jitter
}

function generatePolicyNo() {
  return "FX" + Math.floor(100000 + Math.random() * 899999).toString();
}

// Full Forex Confirmation View shown after exchange is placed
function ForexConfirmationView({
  fromAmount,
  fromCode,
  toAmount,
  toCode,
  rate,
  deliveryMode,
  orderId,
  selectedBranch,
  onReset,
}: {
  fromAmount: number;
  fromCode: string;
  toAmount: number;
  toCode: string;
  rate: number;
  deliveryMode: string;
  orderId: string;
  selectedBranch: any;
  onReset: () => void;
}) {
  const router = useRouter();
  const handlePrint = () => window.print();
  const handleDownload = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Forex Order ${orderId}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111;background:#f9fafb}
        .card{border:1px solid #e5e7eb;border-radius:12px;padding:24px;max-width:560px;margin:0 auto;background:#fff}
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
          <span class="badge">Forex Confirmation</span>
        </div>
        <h1>Forex Exchange Order Confirmation</h1>
        <p class="muted">Order Reference: ${orderId} · ${new Date().toLocaleDateString()}</p>
        <table>
          <tr><td class="label">You Pay</td><td>₹${fromAmount.toLocaleString()} (${fromCode})</td></tr>
          <tr><td class="label">You Receive</td><td>${toAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCode}</td></tr>
          <tr><td class="label">Locked Rate</td><td>1 ${toCode} = ₹${rate.toFixed(2)}</td></tr>
          <tr><td class="label">Delivery Method</td><td>${deliveryMode}</td></tr>
          <tr><td class="label">Collection Branch</td><td>${selectedBranch?.name || "MakeMyTour Airport/City Branch"}</td></tr>
          <tr><td class="label">Branch Address</td><td>${selectedBranch?.address || "Terminal 2, CSMIA"}, ${selectedBranch?.city || "Mumbai"}</td></tr>
          <tr><td class="label">Branch Hours</td><td>${selectedBranch?.hours || "9:30 AM – 7:30 PM"}</td></tr>
        </table>
        <p class="total">Amount Payable: ₹${fromAmount.toLocaleString()}</p>
      </div>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forex-order-${orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Confirmation Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Exchange Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">Forex Exchange Order Confirmed</h1>
          <p className="text-blue-200 mt-2 text-sm sm:text-base">
            Your foreign currency exchange has been successfully locked at guaranteed live rates.
          </p>
          <p className="text-xs font-mono text-blue-300 mt-2">Order ID: {orderId}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 space-y-6">
        {/* Main Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xl font-bold">✈</span>
              <span className="font-bold text-gray-900 text-xl">MakeMyTour</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
              Forex Confirmation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50/70 rounded-xl p-5 border border-blue-100">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">You Pay</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-950 mt-1">
                ₹ {fromAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-blue-700 mt-1">{fromCode} (Indian Rupee)</p>
            </div>
            <div className="bg-emerald-50/70 rounded-xl p-5 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">You Receive</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1">
                {toAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCode}
              </p>
              <p className="text-xs text-emerald-700 mt-1">Locked Rate: 1 {toCode} = ₹{rate.toFixed(2)}</p>
            </div>
          </div>

          {/* Key order details */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm mb-6 border border-gray-100">
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Order Status</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Rate Locked & Confirmed
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Delivery Method</span>
              <span className="font-semibold text-gray-800">{deliveryMode}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Collection Center</span>
              <span className="font-semibold text-gray-800">{selectedBranch?.name || "MakeMyTour Forex Center"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Branch Address</span>
              <span className="text-gray-700">{selectedBranch?.address || "Inner Circle"}, {selectedBranch?.city || "Delhi"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Operating Hours</span>
              <span className="text-gray-700">{selectedBranch?.hours || "9:30 AM – 7:30 PM"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 font-medium">Order Placed On</span>
              <span className="text-gray-700">{new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 border-gray-300 py-3"
            >
              <Printer size={16} /> Print Receipt
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 shadow-md"
            >
              <Download size={16} /> Download HTML Receipt
            </Button>
          </div>
        </div>

        {/* KYC & Instructions Checklist */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600" /> Essential Collection & KYC Checklist
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Per Reserve Bank of India (RBI) regulations, please carry the following original documents when collecting foreign exchange or activating your forex card:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Original Valid Passport</strong> + 1 self-attested photocopy</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Valid Visa / Air Ticket</strong> demonstrating upcoming international travel</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span><strong>PAN Card</strong> of the traveler making the transaction</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Order ID Reference:</strong> {orderId} (digital or printed copy)</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Button
            onClick={onReset}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
          >
            ← Exchange More Currency
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/insurance")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Get Travel Insurance
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-300 font-medium"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForexPage() {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const liveRates = useMemo(() => {
    return CURRENCIES.map((c) => ({
      ...c,
      rate: c.code === "INR" ? 1 : c.baseRate * (1 + hashJitter(c.code, tick)),
      change: hashJitter(c.code + "chg", tick),
    }));
  }, [tick]);

  const [fromCode, setFromCode] = useState("INR");
  const [toCode, setToCode] = useState("USD");
  const [fromAmount, setFromAmount] = useState<number>(10000);
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "card">("pickup");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [order, setOrder] = useState<{ orderId: string } | null>(null);

  const fromRate = liveRates.find((r) => r.code === fromCode)?.rate ?? 1;
  const toRate = liveRates.find((r) => r.code === toCode)?.rate ?? 1;
  const convertedAmount = (fromAmount * fromRate) / toRate;
  const displayRate = toCode === "INR" ? fromRate : (fromCode === "INR" ? toRate : fromRate / toRate);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const filteredLocations = selectedCity === "All" ? EXCHANGE_LOCATIONS : EXCHANGE_LOCATIONS.filter((l) => l.city === selectedCity);

  const handleOrder = () => {
    setOrder({ orderId: generatePolicyNo() });
  };

  if (order) {
    const selectedBranch = EXCHANGE_LOCATIONS.find((l) => l.city === selectedCity) || EXCHANGE_LOCATIONS[0];
    return (
      <ForexConfirmationView
        fromAmount={fromAmount}
        fromCode={fromCode}
        toAmount={convertedAmount}
        toCode={toCode}
        rate={displayRate}
        deliveryMode={deliveryMode === "pickup" ? "Branch Pickup" : "Multi-Currency Forex Card"}
        orderId={order.orderId}
        selectedBranch={selectedBranch}
        onReset={() => setOrder(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <BackButton variant="dark" className="mb-4" />
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Banknote size={30} /> Forex Exchange
          </h1>
          <p className="text-blue-100">Get the best live exchange rates, order currency notes or a forex card, and pick up from 6+ cities.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16 space-y-6">
        {/* Converter card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><ArrowLeftRight size={18} className="text-blue-600" /> Currency Converter</h2>
            <span className="flex items-center gap-1 text-[11px] font-medium bg-green-50 text-green-600 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> live rates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">You Pay</Label>
              <div className="flex gap-2">
                <select value={fromCode} onChange={(e) => setFromCode(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 text-sm font-medium bg-white">
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <Input type="number" min={0} value={fromAmount}
                  onChange={(e) => setFromAmount(Math.max(0, Number(e.target.value)))}
                  className="text-lg font-bold" />
              </div>
            </div>

            <button type="button" onClick={swap}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center mx-auto transition-transform hover:rotate-180 duration-300 shadow-sm">
              <ArrowLeftRight size={16} />
            </button>

            <div>
              <Label className="text-xs text-gray-500 mb-1 block">You Get</Label>
              <div className="flex gap-2">
                <select value={toCode} onChange={(e) => setToCode(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 text-sm font-medium bg-white">
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <div className="flex-1 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-lg font-bold text-blue-700">
                  {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 mt-3 flex-wrap">
            {QUICK_AMOUNTS.map((amt) => (
              <button key={amt} type="button" onClick={() => setFromAmount(amt)}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                  fromAmount === amt
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-blue-200 text-blue-800 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-400"
                }`}>
                {fromCode === "INR" ? `₹${amt.toLocaleString()}` : amt.toLocaleString()}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <Info size={12} /> 1 {toCode} = ₹{(toCode === "INR" ? 1 : toRate).toFixed(2)} · 1 {fromCode} = ₹{(fromCode === "INR" ? 1 : fromRate).toFixed(2)}
          </p>

          {/* Delivery mode + order */}
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">How would you like it?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { key: "pickup", icon: MapPin, label: "Branch Pickup", sub: "Collect cash at a location" },
                { key: "card", icon: CreditCard, label: "Forex Card", sub: "Prepaid multi-currency card" },
              ].map((m) => (
                <button key={m.key} type="button" onClick={() => setDeliveryMode(m.key as any)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${deliveryMode === m.key ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300"}`}>
                  <m.icon size={16} className={deliveryMode === m.key ? "text-blue-600" : "text-gray-500"} />
                  <p className="text-sm font-medium mt-1">{m.label}</p>
                  <p className="text-[11px] text-gray-500">{m.sub}</p>
                </button>
              ))}
            </div>
            <Button
              onClick={handleOrder}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-base"
              disabled={fromAmount <= 0}
            >
              Order {toCode} {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} for ₹{fromAmount.toLocaleString()}
            </Button>
          </div>
        </div>

        {/* Live rate table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-600" /> Today's Exchange Rates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                  <th className="py-2 font-medium">Currency</th>
                  <th className="py-2 font-medium text-right">Buy Rate (₹)</th>
                  <th className="py-2 font-medium text-right">Sell Rate (₹)</th>
                  <th className="py-2 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {liveRates.filter((r) => r.code !== "INR").map((r) => {
                  const buy = r.rate * 1.012;
                  const sell = r.rate * 0.988;
                  const up = r.change >= 0;
                  return (
                    <tr key={r.code} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 font-medium">{r.flag} {r.code} <span className="text-gray-400 font-normal">· {r.name}</span></td>
                      <td className="py-2.5 text-right tabular-nums">₹{buy.toFixed(2)}</td>
                      <td className="py-2.5 text-right tabular-nums">₹{sell.toFixed(2)}</td>
                      <td className={`py-2.5 text-right font-medium flex items-center justify-end gap-1 ${up ? "text-green-600" : "text-red-500"}`}>
                        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(r.change * 100).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Rates refresh automatically and are indicative; final rate is confirmed at checkout.</p>
        </div>

        {/* Exchange locations */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-bold flex items-center gap-2"><MapPin size={18} className="text-blue-600" /> Exchange Locations</h2>
            <div className="flex gap-1.5 flex-wrap">
              {["All", ...CITIES].map((c) => (
                <button key={c} type="button" onClick={() => setSelectedCity(c)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${selectedCity === c ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredLocations.map((loc) => (
              <div key={loc.name} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-sm">{loc.name}</p>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> {loc.rating}
                  </span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><MapPin size={12} /> {loc.address}, {loc.city}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {loc.hours}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why choose us / trust strip */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">Why Exchange With Us</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: "RBI Authorized" },
              { icon: TrendingUp, label: "Live Market Rates" },
              { icon: Clock, label: "Instant Pickup" },
              { icon: Wallet, label: "Zero Hidden Fees" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-4 border border-gray-100">
                <Icon className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => router.push("/insurance")} className="w-full text-center text-sm text-blue-600 hover:underline flex items-center justify-center gap-1 font-medium">
          Also planning a trip? Check out Travel Insurance <ShieldCheck size={14} />
        </button>
      </div>
    </div>
  );
}