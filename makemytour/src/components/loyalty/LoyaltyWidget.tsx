import { useMemo } from "react";
import { Star, Zap, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Tier thresholds + config (client-computed from loyaltyEarned — never reduced)
// ---------------------------------------------------------------------------
export const TIERS = [
  { key: "silver",   label: "Silver",   minEarned: 0,      color: "from-slate-400 to-slate-500",    ring: "ring-slate-300",   icon: Star,  redeemPct: 10, earnRate: 1.0 },
  { key: "gold",     label: "Gold",     minEarned: 5_000,  color: "from-amber-400 to-yellow-500",   ring: "ring-amber-300",   icon: Zap,   redeemPct: 15, earnRate: 1.25 },
  { key: "platinum", label: "Platinum", minEarned: 20_000, color: "from-purple-500 to-violet-600",  ring: "ring-purple-300",  icon: Award, redeemPct: 20, earnRate: 1.5 },
] as const;

export function getTier(earned: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (earned >= TIERS[i].minEarned) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(earned: number) {
  for (const t of TIERS) {
    if (earned < t.minEarned) return t;
  }
  return null;
}

interface Props {
  points: number;     // spendable balance
  earned: number;     // lifetime total (for tier)
  compact?: boolean;  // true = sidebar widget, false = bigger card
}

export default function LoyaltyWidget({ points, earned, compact = true }: Props) {
  const tier = useMemo(() => getTier(earned), [earned]);
  const nextTier = useMemo(() => getNextTier(earned), [earned]);
  const TierIcon = tier.icon;

  const progress = nextTier
    ? Math.min(100, ((earned - tier.minEarned) / (nextTier.minEarned - tier.minEarned)) * 100)
    : 100;

  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-100 shadow-sm`}>
      {/* gradient header */}
      <div className={`bg-gradient-to-r ${tier.color} px-5 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-white/20 ring-2 ${tier.ring} flex items-center justify-center`}>
              <TierIcon size={15} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">MMT Rewards</p>
              <p className="font-bold text-sm leading-none">{tier.label} Member</p>
            </div>
          </div>
          <Link href="/loyalty" className="text-white/70 hover:text-white transition-colors">
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight">{points.toLocaleString("en-IN")}</p>
          <p className="text-xs opacity-75 -mt-0.5">available points</p>
        </div>
      </div>

      {/* progress to next tier */}
      <div className="bg-white px-5 py-3">
        {nextTier ? (
          <>
            <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
              <span>{tier.label}</span>
              <span>{nextTier.label} at {nextTier.minEarned.toLocaleString()} pts</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tier.color} rounded-full transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              {(nextTier.minEarned - earned).toLocaleString()} pts to {nextTier.label}
            </p>
          </>
        ) : (
          <p className="text-xs text-purple-600 font-semibold text-center py-1">
            🏆 You are a Platinum member — top tier!
          </p>
        )}
      </div>
    </div>
  );
}
