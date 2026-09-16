import React from "react";
import { Gift, Check, X, Tag } from "lucide-react";

export interface PromoOffer {
  code: string;
  description: string;
  amount?: number;
  percent?: number;
}

const DEFAULT_OFFERS: PromoOffer[] = [
  {
    code: "MMTSECURE",
    description: "Get an instant discount of ₹299 on your booking with this coupon!",
    amount: 299,
  },
  {
    code: "SPECIALUPI",
    description: "Use this code and get ₹362 instant discount on payments via UPI only!",
    amount: 362,
  },
  {
    code: "SAVE500",
    description: "Flat ₹500 discount on your booking!",
    amount: 500,
  },
  {
    code: "FIRST10",
    description: "10% instant discount on your travel booking!",
    percent: 10,
  },
];

interface Props {
  subtotal: number;
  appliedCode: string | null;
  discount: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  offers?: PromoOffer[];
}

export default function PromoCodeInput({
  subtotal,
  appliedCode,
  discount,
  onApply,
  onRemove,
  offers = DEFAULT_OFFERS,
}: Props) {
  const handleToggle = (offer: PromoOffer) => {
    if (appliedCode === offer.code) {
      onRemove();
    } else {
      let disc = 0;
      if (offer.amount) {
        disc = offer.amount;
      } else if (offer.percent) {
        disc = Math.round(subtotal * (offer.percent / 100));
      }
      // Never exceed 50% of subtotal
      disc = Math.min(disc, Math.floor(subtotal * 0.5));
      onApply(offer.code, disc);
    }
  };

  return (
    <div className="bg-[#FFF8E7] p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <Gift className="w-4 h-4 text-amber-600" />
          PROMO CODES
        </h3>
        {appliedCode && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <X size={13} /> Remove
          </button>
        )}
      </div>

      {appliedCode && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-green-300 bg-green-50 px-3.5 py-2.5 text-xs text-green-800 shadow-xs">
          <span className="flex items-center gap-1.5 font-semibold">
            <Check size={14} className="text-green-600" /> {appliedCode} applied — You save ₹{discount.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] bg-green-200/80 text-green-800 font-bold px-2 py-0.5 rounded-full uppercase">
            Active
          </span>
        </div>
      )}

      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
        {offers.map((offer) => {
          const isSelected = appliedCode === offer.code;
          const saving = offer.amount
            ? `₹${offer.amount}`
            : `${offer.percent}% (₹${Math.round(subtotal * ((offer.percent || 0) / 100))})`;

          return (
            <div
              key={offer.code}
              onClick={() => handleToggle(offer)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-green-50/90 border-green-400 ring-2 ring-green-300 shadow-sm"
                  : "bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50/20"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="radio"
                  name="promo_radio"
                  checked={isSelected}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-600 text-xs tracking-wide">
                      {offer.code}
                    </span>
                    <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                      Save {saving}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                    {offer.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}