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
  Home,
  Truck,
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
  { code: "USD", name: "US Dollar", flag: "🇺🇸", baseRate: 83.12 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", baseRate: 90.45 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", baseRate: 105.3 },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", baseRate: 22.63 },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", baseRate: 61.8 },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", baseRate: 54.2 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", baseRate: 0.56 },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭", baseRate: 2.32 },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", baseRate: 60.9 },
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

// Mini order receipt after "booking" forex, printable/downloadable like the
// e-tickets elsewhere in the app.
function OrderReceipt({
  fromAmount,
  fromCode,
  toAmount,
  toCode,
  rate,
  deliveryMode,
  orderId,
  onClose,
}: {
  fromAmount: number;
  fromCode: string;
  toAmount: number;
  toCode: string;
  rate: number;
  deliveryMode: string;
  orderId: string;
  onClose: () => void;
}) {
  const handlePrint = () => window.print();
  const handleDownload = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Forex Order ${orderId}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.card{border:1px solid #e5e7eb;border-radius:12px;padding:20px;max-width:480px}
      h1{font-size:18px;margin:0 0 4px}.muted{color:#6b7280;font-size:12px}table{width:100%;border-collapse:collapse;margin-top:12px}
      td{padding:6px 0;font-size:13px}.label{color:#6b7280}.total{font-size:16px;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}</style></head><body>
      <div class="card"><h1>Forex Order Confirmation</h1><p class="muted">Order ID: ${orderId}</p>
      <table>
        <tr><td class="label">You Pay</td><td>${fromAmount.toLocaleString()} ${fromCode}</td></tr>
        <tr><td class="label">You Get</td><td>${toAmount.toLocaleString()} ${toCode}</td></tr>
        <tr><td class="label">Exchange Rate</td><td>1 ${toCode} = ₹${rate.toFixed(2)}</td></tr>
        <tr><td class="label">Delivery</td><td>${deliveryMode}</td></tr>
      </table><p class="total">Amount Payable: ₹${fromAmount.toLocaleString()}</p></div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forex-order-${orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:static print:p-0">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden print:shadow-none">
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={20} /> Order Confirmed</div>
          <button onClick={onClose} className="hover:opacity-80"><X size={20} /></button>
        </div>
        <div className="p-6">
          <p className="text-xs text-gray-500 mb-1">Order ID</p>
          <p className="font-mono font-semibold text-gray-800 mb-4">{orderId}</p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-600">You Pay</span><span className="font-semibold">₹{fromAmount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">You Get</span><span className="font-semibold">{toAmount.toLocaleString()} {toCode}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Rate</span><span className="font-semibold">1 {toCode} = ₹{rate.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="font-semibold">{deliveryMode}</span></div>
          </div>
          <div className="flex gap-3 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex-1 flex items-center gap-2"><Printer size={16} /> Print</Button>
            <Button onClick={handleDownload} className="flex-1 flex items-center gap-2 bg-blue-600 text-white"><Download size={16} /> Download</Button>
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
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "delivery" | "card">("pickup");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [order, setOrder] = useState<{ orderId: string } | null>(null);

  const fromRate = liveRates.find((r) => r.code === fromCode)?.rate ?? 1;
  const toRate = liveRates.find((r) => r.code === toCode)?.rate ?? 1;
  const convertedAmount = (fromAmount * fromRate) / toRate;
  const effectiveRate = toRate / fromRate === 0 ? 0 : fromRate / toRate; // INR-per-toCode equivalent when swapping bases
  const displayRate = toCode === "INR" ? fromRate : (fromCode === "INR" ? toRate : fromRate / toRate);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const filteredLocations = selectedCity === "All" ? EXCHANGE_LOCATIONS : EXCHANGE_LOCATIONS.filter((l) => l.city === selectedCity);

  const handleOrder = () => {
    setOrder({ orderId: generatePolicyNo() });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
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

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
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
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {QUICK_AMOUNTS.map((amt) => (
                  <button key={amt} type="button" onClick={() => setFromAmount(amt)}
                    className="text-[11px] px-2 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                    {fromCode === "INR" ? `₹${amt.toLocaleString()}` : amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={swap}
              className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center mx-auto transition-transform hover:rotate-180 duration-300">
              <ArrowLeftRight size={16} className="text-blue-600" />
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

          <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
            <Info size={12} /> 1 {toCode} = ₹{(toCode === "INR" ? 1 : toRate).toFixed(2)} · 1 {fromCode} = ₹{(fromCode === "INR" ? 1 : fromRate).toFixed(2)}
          </p>

          {/* Delivery mode + order */}
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">How would you like it?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { key: "pickup", icon: MapPin, label: "Branch Pickup", sub: "Collect cash at a location" },
                { key: "delivery", icon: Truck, label: "Home Delivery", sub: "Doorstep delivery, 1-2 days" },
                { key: "card", icon: CreditCard, label: "Forex Card", sub: "Prepaid multi-currency card" },
              ].map((m) => (
                <button key={m.key} type="button" onClick={() => setDeliveryMode(m.key as any)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${deliveryMode === m.key ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                  <m.icon size={16} className={deliveryMode === m.key ? "text-blue-600" : "text-gray-500"} />
                  <p className="text-sm font-medium mt-1">{m.label}</p>
                  <p className="text-[11px] text-gray-500">{m.sub}</p>
                </button>
              ))}
            </div>
            <Button onClick={handleOrder} className="w-full bg-blue-600 text-white py-3" disabled={fromAmount <= 0}>
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
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border ${selectedCity === c ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}>
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
              { icon: Truck, label: "Doorstep Delivery" },
              { icon: Wallet, label: "Zero Hidden Fees" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-4 border border-gray-100">
                <Icon className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => router.push("/insurance")} className="w-full text-center text-sm text-blue-600 hover:underline flex items-center justify-center gap-1">
          Also planning a trip? Check out Travel Insurance <ShieldCheck size={14} />
        </button>
      </div>

      {order && (
        <OrderReceipt
          fromAmount={fromAmount}
          fromCode={fromCode}
          toAmount={convertedAmount}
          toCode={toCode}
          rate={displayRate}
          deliveryMode={deliveryMode === "pickup" ? "Branch Pickup" : deliveryMode === "delivery" ? "Home Delivery" : "Forex Card"}
          orderId={order.orderId}
          onClose={() => setOrder(null)}
        />
      )}
    </div>
  );
}