import { Shield, Check, Plane, HeartPulse, Skull, Luggage } from "lucide-react";

export const INSURANCE_PREMIUM = 49; // small flat add-on fee, per booking

export const INSURANCE_COVERAGE = {
  flightDelay: 2500,
  accidentalDeath: 500000,
  medicalEmergency: 100000,
  baggageLoss: 10000,
};

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  premium?: number;
}

/**
 * Small opt-in card offered inside every booking dialog (train, bus, flight,
 * cab, homestay) — "Add Travel Insurance for ₹49". Ticking it adds the
 * premium to the fare total; the parent page is responsible for including
 * `premium` in its grand total and showing the coverage summary on the
 * resulting ticket/receipt when checked.
 */
export default function InsuranceAddOn({ checked, onChange, premium = INSURANCE_PREMIUM }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full text-left rounded-xl border-2 p-3.5 transition-all ${
        checked ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${checked ? "bg-blue-600" : "bg-gray-100"}`}>
            {checked ? <Check size={15} className="text-white" /> : <Shield size={15} className="text-gray-500" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Add Travel Insurance</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Covers flight delay, accidents & medical emergencies for just ₹{premium}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              <span className="flex items-center gap-1 text-[10px] text-gray-500"><Plane size={11} className="text-blue-600" /> Delay ₹{INSURANCE_COVERAGE.flightDelay.toLocaleString()}</span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500"><Skull size={11} className="text-blue-600" /> Accident ₹{INSURANCE_COVERAGE.accidentalDeath.toLocaleString()}</span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500"><HeartPulse size={11} className="text-blue-600" /> Medical ₹{INSURANCE_COVERAGE.medicalEmergency.toLocaleString()}</span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500"><Luggage size={11} className="text-blue-600" /> Baggage ₹{INSURANCE_COVERAGE.baggageLoss.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <span className="text-sm font-bold text-gray-800 shrink-0">+₹{premium}</span>
      </div>
    </button>
  );
}

/** Coverage block to print on a ticket/receipt when insurance was added. */
export function InsuranceReceiptBlock({ policyNo, premium = INSURANCE_PREMIUM }: { policyNo: string; premium?: number }) {
  return (
    <div className="border-t border-dashed border-gray-200 pt-3 mt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
        <Shield size={12} className="text-blue-600" /> Travel Insurance Included
      </p>
      <p className="text-[11px] text-gray-500 mb-1">Policy No: <span className="font-mono text-gray-700">{policyNo}</span></p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-600">
        <span>Flight Delay: ₹{INSURANCE_COVERAGE.flightDelay.toLocaleString()}</span>
        <span>Accidental Death: ₹{INSURANCE_COVERAGE.accidentalDeath.toLocaleString()}</span>
        <span>Medical Emergency: ₹{INSURANCE_COVERAGE.medicalEmergency.toLocaleString()}</span>
        <span>Baggage Loss: ₹{INSURANCE_COVERAGE.baggageLoss.toLocaleString()}</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">Premium paid: ₹{premium}</p>
    </div>
  );
}

export function generateInsurancePolicyNo(seed?: string) {
  const base = seed ? seed.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() : Math.floor(100000 + Math.random() * 899999).toString();
  return `POL${base}`;
}