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

function PolicyDocument({
  plan,
  travelers,
  days,
  premium,
  applicant,
  onClose,
}: {
  plan: Plan;
  travelers: number;
  days: number;
  premium: number;
  applicant: { name: string; age: string; nominee: string };
  onClose: () => void;
}) {
  const policyNo = useMemo(() => generatePolicyNo(), []);
  const issuedOn = new Date().toLocaleDateString();

  const handlePrint = () => window.print();
  const handleDownload = () => {
    const rows = COVERAGE_ROWS.map(
      (r) => `<tr><td class="label">${r.label}</td><td>₹${plan.coverage[r.key].toLocaleString()}</td></tr>`
    ).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Policy ${policyNo}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.card{border:1px solid #e5e7eb;border-radius:12px;padding:20px;max-width:560px}
      h1{font-size:18px;margin:0 0 4px}.muted{color:#6b7280;font-size:12px}table{width:100%;border-collapse:collapse;margin-top:12px}
      td{padding:6px 0;font-size:13px}.label{color:#6b7280}.total{font-size:16px;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}</style></head><body>
      <div class="card"><h1>Travel Insurance Policy</h1><p class="muted">Policy No: ${policyNo} · Issued ${issuedOn}</p>
      <table>
        <tr><td class="label">Plan</td><td>${plan.name}</td></tr>
        <tr><td class="label">Applicant</td><td>${applicant.name} (age ${applicant.age})</td></tr>
        <tr><td class="label">Nominee</td><td>${applicant.nominee}</td></tr>
        <tr><td class="label">Travelers Covered</td><td>${travelers}</td></tr>
        <tr><td class="label">Trip Duration</td><td>${days} day(s)</td></tr>
        ${rows}
      </table><p class="total">Premium Paid: ₹${premium.toLocaleString()}</p></div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `policy-${policyNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:static print:p-0">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden print:shadow-none max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between print:hidden sticky top-0">
          <div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={20} /> Policy Issued</div>
          <button onClick={onClose} className="hover:opacity-80"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-1.5"><Shield size={18} className="text-blue-600" /> {plan.name} Travel Insurance</h3>
              <p className="text-gray-500 text-sm">Policy No: <span className="font-mono font-semibold text-gray-800">{policyNo}</span></p>
              <p className="text-xs text-gray-400">Issued on {issuedOn}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm mb-4">
            <div><p className="text-gray-400 text-[11px] uppercase">Applicant</p><p className="font-medium">{applicant.name} ({applicant.age} yrs)</p></div>
            <div><p className="text-gray-400 text-[11px] uppercase">Nominee</p><p className="font-medium">{applicant.nominee}</p></div>
            <div><p className="text-gray-400 text-[11px] uppercase">Travelers</p><p className="font-medium">{travelers}</p></div>
            <div><p className="text-gray-400 text-[11px] uppercase">Duration</p><p className="font-medium">{days} day(s)</p></div>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Amount you can receive</p>
          <div className="space-y-1.5 mb-4">
            {COVERAGE_ROWS.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-700"><Icon size={13} className="text-blue-600" /> {r.label}</span>
                  <span className="font-semibold">₹{plan.coverage[r.key].toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 pt-3 mb-5">
            <span className="text-gray-600 text-sm">Premium Paid</span>
            <span className="text-xl font-bold">₹ {premium.toLocaleString()}</span>
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

  const plan = PLANS.find((p) => p.key === planKey) || PLANS[1];
  const internationalMultiplier = tripType === "international" ? 1.6 : 1;
  const premium = Math.round(plan.premiumPerDay * days * travelers * internationalMultiplier);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIssuedPolicy({ plan, travelers, days, premium, applicant });
    setShowApply(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-800 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Shield size={30} /> Travel Insurance</h1>
          <p className="text-blue-100">Cover flight delays, accidents, medical emergencies, and more — for as little as a few rupees a day.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16 space-y-6">
        {/* Premium calculator */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in-up">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><IndianRupee size={18} className="text-blue-600" /> Premium Calculator</h2>
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

      {issuedPolicy && (
        <PolicyDocument
          plan={issuedPolicy.plan}
          travelers={issuedPolicy.travelers}
          days={issuedPolicy.days}
          premium={issuedPolicy.premium}
          applicant={issuedPolicy.applicant}
          onClose={() => setIssuedPolicy(null)}
        />
      )}
    </div>
  );
}