import { Coins } from "lucide-react";

interface Props {
  /** User's current spendable points balance */
  available: number;
  /** Max points redeemable based on tier (% of subtotal) */
  maxRedeemPct: number;
  /** Subtotal (before redemption) the cap is applied against */
  subtotal: number;
  /** Currently applied redeemed points amount (₹ value = pts since 1pt=₹1) */
  redeemedPoints: number;
  onChange: (pts: number) => void;
}

/**
 * Shown in every booking dialog's Fare Summary when the user has a
 * loyalty points balance. Allows toggling between redeeming the max
 * allowed points or not redeeming any.
 */
export default function LoyaltyRedeemToggle({ available, maxRedeemPct, subtotal, redeemedPoints, onChange }: Props) {
  if (available <= 0) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-gray-500 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Coins size={15} />
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-sm">MMT Rewards (0 pts)</p>
            <p className="text-gray-400 text-[11px]">Earn 1 reward point per ₹1 spent to redeem on future trips.</p>
          </div>
        </div>
      </div>
    );
  }

  // Allow redeeming up to full available balance or subtotal
  const maxRedeemable = Math.min(available, Math.max(1, Math.floor(subtotal)));

  if (maxRedeemable <= 0) return null;

  const isApplied = redeemedPoints > 0;

  const toggle = () => {
    onChange(isApplied ? 0 : maxRedeemable);
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3.5 py-3 cursor-pointer transition-all ${
        isApplied
          ? "border-amber-300 bg-amber-50"
          : "border-gray-200 bg-gray-50 hover:border-amber-200 hover:bg-amber-50/40"
      }`}
      onClick={toggle}
      role="button"
      aria-pressed={isApplied}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isApplied ? "bg-amber-500" : "bg-gray-200"} transition-colors`}>
          <Coins size={15} className={isApplied ? "text-white" : "text-gray-500"} />
        </div>
        <div>
          <p className={`text-sm font-semibold ${isApplied ? "text-amber-800" : "text-gray-700"}`}>
            {isApplied ? `Redeeming ${maxRedeemable.toLocaleString("en-IN")} MMT pts` : `Use ${maxRedeemable.toLocaleString("en-IN")} MMT reward pts`}
          </p>
          <p className="text-xs text-gray-500">
            {isApplied
              ? `You save ₹${maxRedeemable.toLocaleString("en-IN")}`
              : `Save ₹${maxRedeemable.toLocaleString("en-IN")} · Balance: ${available.toLocaleString("en-IN")} pts`}
          </p>
        </div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isApplied ? "bg-amber-500 border-amber-500" : "border-gray-300"}`}>
        {isApplied && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  );
}
