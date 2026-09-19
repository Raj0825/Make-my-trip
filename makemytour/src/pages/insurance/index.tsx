import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Shield,
  Plane,
  HeartPulse,
  Skull,
  Accessibility,
  Luggage,
  CalendarX,
  Check,
  X,
  Users,
  Calendar,
  Globe2,
  IndianRupee,
  FileText,
  CheckCircle2,
  Printer,
  Download,
  Phone,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import BackButton from "@/components/navigation/BackButton";
import FakePaymentModal from "@/components/payment/FakePaymentModal";

// ---------------------------------------------------------------------------
// Plan tiers. Coverage amounts scale with trip cost via the calculator below;
// these are the "per traveler, per plan" base coverage figures shown on cards.
// ---------------------------------------------------------------------------
interface Plan {
  key: string;
  name: string;
  premiumPerDay: number;
  color: string;
  coverage: {
    flightDelay: number;
    accidentalDeath: number;
    permanentDisability: number;
    medicalEmergency: number;
    baggageLoss: number;
    tripCancellation: number;
  };
}

const PLANS: Plan[] = [
  {
    key: "basic",
    name: "Basic",
    premiumPerDay: 25,
    color: "gray",
    coverage: {
      flightDelay: 2500,
      accidentalDeath: 500000,
      permanentDisability: 250000,
      medicalEmergency: 100000,
      baggageLoss: 10000,
      tripCancellation: 15000,
    },
  },
  {
    key: "standard",
    name: "Standard",
    premiumPerDay: 45,
    color: "blue",
    coverage: {
      flightDelay: 5000,
      accidentalDeath: 1500000,
      permanentDisability: 750000,
      medicalEmergency: 300000,
      baggageLoss: 25000,
      tripCancellation: 40000,
    },
  },
  {
    key: "premium",
    name: "Premium",
    premiumPerDay: 75,
    color: "purple",
    coverage: {
      flightDelay: 10000,
      accidentalDeath: 5000000,
      permanentDisability: 2500000,
      medicalEmergency: 1000000,
      baggageLoss: 50000,
      tripCancellation: 100000,
    },
  },
];

const COVERAGE_ROWS: { key: keyof Plan["coverage"]; label: string; icon: any }[] = [
  { key: "flightDelay", label: "Flight Delay / Cancellation", icon: Plane },
  { key: "accidentalDeath", label: "Accidental Death", icon: Skull },
  { key: "permanentDisability", label: "Permanent Disability", icon: Accessibility },
  { key: "medicalEmergency", label: "Medical Emergency Abroad", icon: HeartPulse },
  { key: "baggageLoss", label: "Baggage Loss/Delay", icon: Luggage },
  { key: "tripCancellation", label: "Trip Cancellation", icon: CalendarX },
];

function generatePolicyNo() {
  return "POL" + Math.floor(1000000 + Math.random() * 8999999).toString();
}

function InsuranceConfirmationView({
  plan,
  travelers,
  days,
  premium,
  applicant,
  tripType,
  onReset,
}: {
  plan: Plan;
  travelers: number;
  days: number;
  premium: number;
  applicant: { name: string; age: string; nominee: string };
  tripType: string;
  onReset: () => void;
}) {
  const router = useRouter();
  const policyNo = useMemo(() => generatePolicyNo(), []);
  const issuedOn = new Date().toLocaleDateString();

  const handlePrint = () => window.print();
  const handleDownload = () => {
    const rows = COVERAGE_ROWS.map(
      (r) => `<tr><td class="label">${r.label}</td><td>₹${plan.coverage[r.key].toLocaleString()}</td></tr>`
    ).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Insurance Policy ${policyNo}</title>
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
          <span class="badge">${plan.name} Travel Insurance</span>
        </div>
        <h1>Certificate of Insurance</h1>
        <p class="muted">Policy No: ${policyNo} · Issued ${issuedOn}</p>
        <table>
          <tr><td class="label">Plan Tier</td><td>${plan.name}</td></tr>
          <tr><td class="label">Primary Insured</td><td>${applicant.name} (${applicant.age} yrs)</td></tr>
          <tr><td class="label">Nominee</td><td>${applicant.nominee}</td></tr>
          <tr><td class="label">Travelers Covered</td><td>${travelers} traveler(s)</td></tr>
          <tr><td class="label">Duration</td><td>${days} day(s) (${tripType})</td></tr>
          <tr><td class="label">Status</td><td>Active & Verified</td></tr>
          ${rows}
        </table>
        <p class="total">Total Premium Paid: ₹${premium.toLocaleString()}</p>
      </div>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insurance-policy-${policyNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Confirmation Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Policy Issued & Active
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">Travel Insurance Confirmation</h1>
          <p className="text-blue-200 mt-2 text-sm sm:text-base">
            Your journey is now comprehensively protected under MakeMyTour Secure Shield.
          </p>
          <p className="text-xs font-mono text-blue-300 mt-2">Policy Number: {policyNo}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 space-y-6">
        {/* Main Certificate Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          {/* Properly aligned MakeMyTour Logo Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xl font-bold">✈</span>
              <span className="font-bold text-gray-900 text-xl">MakeMyTour</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
              {plan.name} Plan Certificate
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="text-blue-600" size={24} /> {plan.name} Coverage Policy
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Policy No: <span className="font-mono font-semibold text-gray-800">{policyNo}</span> · Issued on {issuedOn}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-medium">Premium Paid</span>
              <span className="text-2xl font-black text-emerald-600">₹ {premium.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Insured Details Grid */}
          <div className="bg-gray-50 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6 border border-gray-100">
            <div>
              <p className="text-gray-400 text-[11px] font-bold uppercase">Primary Applicant</p>
              <p className="font-semibold text-gray-900 mt-0.5">{applicant.name || "Primary Traveler"}</p>
              <p className="text-xs text-gray-500">{applicant.age} Years</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-bold uppercase">Appointed Nominee</p>
              <p className="font-semibold text-gray-900 mt-0.5">{applicant.nominee || "Immediate Family"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-bold uppercase">Travelers Insured</p>
              <p className="font-semibold text-gray-900 mt-0.5">{travelers} Traveler{travelers > 1 ? "s" : ""}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-bold uppercase">Trip Duration</p>
              <p className="font-semibold text-gray-900 mt-0.5">{days} Days ({tripType})</p>
            </div>
          </div>

          {/* Detailed Coverage Table */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              Included Coverage & Maximum Sum Insured
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COVERAGE_ROWS.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.key} className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100/70 text-sm">
                    <span className="flex items-center gap-2 text-gray-800 font-medium">
                      <Icon size={16} className="text-blue-600 shrink-0" />
                      {r.label}
                    </span>
                    <span className="font-bold text-blue-900">
                      ₹ {plan.coverage[r.key].toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 border-gray-300 py-3"
            >
              <Printer size={16} /> Print Policy Certificate
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 shadow-md"
            >
              <Download size={16} /> Download Policy PDF/HTML
            </Button>
          </div>
        </div>

        {/* 24x7 Claims Assistance */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Phone size={20} className="text-blue-600" /> 24x7 Worldwide Emergency Assistance & Claims
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            If you experience travel delays, medical issues, or luggage loss during your trip, contact our round-the-clock claims department immediately:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase">Toll-Free Helpline</p>
              <p className="text-base font-bold text-blue-700 mt-1">1800 209 5858</p>
              <p className="text-xs text-gray-500 mt-0.5">Free from any mobile or landline</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase">International Medical</p>
              <p className="text-base font-bold text-blue-700 mt-1">+91 22 6734 7800</p>
              <p className="text-xs text-gray-500 mt-0.5">Collect calls accepted abroad</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase">Instant Claims Email</p>
              <p className="text-base font-bold text-blue-700 mt-1">claims@makemytour.com</p>
              <p className="text-xs text-gray-500 mt-0.5">2-hour cashless approval turnaround</p>
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
            ← Insure Another Trip
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Book Flights & Hotels
            </Button>
            <Button
              onClick={() => router.push("/profile")}
              variant="outline"
              className="border-gray-300 font-medium"
            >
              Go to My Bookings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InsurancePage() {
  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);

  const [tripCost, setTripCost] = useState<number>(50000);
  const [travelers, setTravelers] = useState<number>(1);
  const [days, setDays] = useState<number>(7);
  const [tripType, setTripType] = useState<"domestic" | "international">("domestic");
  const [planKey, setPlanKey] = useState<string>("standard");
  const [showApply, setShowApply] = useState(false);
  const [applicant, setApplicant] = useState({ name: user?.name || "", age: "", nominee: "" });
  const [issuedPolicy, setIssuedPolicy] = useState<{ plan: Plan; travelers: number; days: number; premium: number; applicant: typeof applicant } | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const plan = PLANS.find((p) => p.key === planKey) || PLANS[1];
  const internationalMultiplier = tripType === "international" ? 1.6 : 1;
  const premium = Math.round(plan.premiumPerDay * days * travelers * internationalMultiplier);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setShowApply(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIssuedPolicy({ plan, travelers, days, premium, applicant });
    setIsPaymentOpen(false);
  };

  if (issuedPolicy) {
    return (
      <InsuranceConfirmationView
        plan={issuedPolicy.plan}
        travelers={issuedPolicy.travelers}
        days={issuedPolicy.days}
        premium={issuedPolicy.premium}
        applicant={issuedPolicy.applicant}
        tripType={tripType}
        onReset={() => setIssuedPolicy(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-800 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <BackButton variant="dark" className="mb-4" />
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Shield size={30} /> Travel Insurance</h1>
          <p className="text-blue-100">Cover flight delays, accidents, medical emergencies, and more — for as little as a few rupees a day.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16 space-y-6">
        {/* Calculator */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in-up">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><IndianRupee size={18} className="text-blue-600" /> Calculator</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-2">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Trip Cost (₹)</Label>
              <Input type="number" min={0} value={tripCost} onChange={(e) => setTripCost(Math.max(0, Number(e.target.value)))} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users size={12} /> Travelers</Label>
              <Input type="number" min={1} max={10} value={travelers} onChange={(e) => setTravelers(Math.max(1, Math.min(10, Number(e.target.value))))} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12} /> Trip Duration (days)</Label>
              <Input type="number" min={1} max={90} value={days} onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value))))} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Globe2 size={12} /> Trip Type</Label>
              <select value={tripType} onChange={(e) => setTripType(e.target.value as any)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
              </select>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((p) => {
            const planPremium = Math.round(p.premiumPerDay * days * travelers * internationalMultiplier);
            const isSelected = p.key === planKey;
            return (
              <button key={p.key} type="button" onClick={() => setPlanKey(p.key)}
                className={`text-left rounded-2xl border-2 p-5 bg-white transition-all ${isSelected ? "border-blue-600 shadow-xl scale-[1.02]" : "border-gray-200 hover:border-blue-300 hover:shadow-md"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-lg">{p.name}</p>
                  {isSelected && <span className="bg-blue-600 text-white rounded-full p-1"><Check size={12} /></span>}
                </div>
                <p className="text-2xl font-bold text-blue-700 mb-3">₹{planPremium.toLocaleString()} <span className="text-xs font-normal text-gray-400">total premium</span></p>
                <ul className="space-y-1.5">
                  {COVERAGE_ROWS.slice(0, 4).map((r) => (
                    <li key={r.key} className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Check size={12} className="text-green-600" /> {r.label}</span>
                      <span className="font-medium text-gray-800">₹{p.coverage[r.key].toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Full coverage comparison table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Coverage Comparison</h2>
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="py-2 font-medium">Benefit</th>
                {PLANS.map((p) => <th key={p.key} className="py-2 font-medium text-right">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {COVERAGE_ROWS.map((r) => {
                const Icon = r.icon;
                return (
                  <tr key={r.key} className="border-b border-gray-50">
                    <td className="py-2.5 flex items-center gap-2"><Icon size={14} className="text-blue-600" /> {r.label}</td>
                    {PLANS.map((p) => (
                      <td key={p.key} className={`py-2.5 text-right font-medium ${p.key === planKey ? "text-blue-700" : "text-gray-700"}`}>
                        ₹{p.coverage[r.key].toLocaleString()}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Apply CTA */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold text-gray-800">{plan.name} Plan · {travelers} traveler(s) · {days} days · {tripType}</p>
            <p className="text-sm text-gray-500">Total premium: <span className="font-bold text-blue-700">₹{premium.toLocaleString()}</span></p>
          </div>
          <Button onClick={() => setShowApply(true)} className="bg-blue-600 text-white px-6 py-3 flex items-center gap-1.5">
            Apply Now <ChevronRight size={16} />
          </Button>
        </div>

        <button onClick={() => router.push("/forex")} className="w-full text-center text-sm text-blue-600 hover:underline flex items-center justify-center gap-1">
          Also need currency for your trip? Check out Forex <Plane size={14} />
        </button>
      </div>

      {/* Application form */}
      {showApply && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><FileText size={18} className="text-blue-600" /> Insurance Application</h3>
              <button onClick={() => setShowApply(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <Label htmlFor="applicantName">Full Name</Label>
                <Input id="applicantName" required value={applicant.name} onChange={(e) => setApplicant({ ...applicant, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="applicantAge">Age</Label>
                <Input id="applicantAge" type="number" min={1} max={100} required value={applicant.age} onChange={(e) => setApplicant({ ...applicant, age: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="nominee">Nominee Name</Label>
                <Input id="nominee" required value={applicant.nominee} onChange={(e) => setApplicant({ ...applicant, nominee: e.target.value })} />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex justify-between text-sm">
                <span className="text-gray-600">{plan.name} Plan · Premium</span>
                <span className="font-bold">₹{premium.toLocaleString()}</span>
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white py-3">Pay & Get Policy</Button>
            </form>
          </div>
        </div>
      )}

      <FakePaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={premium}
      />
    </div>
  );
}