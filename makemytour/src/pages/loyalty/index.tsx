import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  Star, Zap, Award, TrendingUp, Gift, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Info, ShieldCheck,
} from "lucide-react";
import LoyaltyWidget, { TIERS, getTier, getNextTier } from "@/components/loyalty/LoyaltyWidget";
import Link from "next/link";
import Head from "next/head";

const HOW_TO_EARN = [
  { icon: TrendingUp, title: "Book anything", desc: "Earn 1 point per ₹1 spent on every booking — flights, hotels, trains, buses, cabs, homestays." },
  { icon: Zap,        title: "Gold bonus",    desc: "Gold members earn 1.25× points on every booking." },
  { icon: Award,      title: "Platinum bonus", desc: "Platinum members earn 1.5× points on every booking." },
];

const HOW_TO_REDEEM = [
  { icon: Gift,       title: "Checkout discount", desc: "Use points for a ₹ discount at checkout. Silver: up to 10%, Gold: 15%, Platinum: 20% of fare." },
  { icon: ShieldCheck, title: "Points never expire", desc: "Your MMT Reward points never expire as long as your account is active." },
];

const PERK_ROWS = [
  { tier: "Silver",   color: "bg-slate-100 text-slate-700",   perks: ["Earn 1 pt / ₹1", "Redeem up to 10% of fare"] },
  { tier: "Gold",     color: "bg-amber-100 text-amber-800",   perks: ["Earn 1.25 pts / ₹1", "Redeem up to 15% of fare", "Priority support badge"] },
  { tier: "Platinum", color: "bg-purple-100 text-purple-800", perks: ["Earn 1.5 pts / ₹1", "Redeem up to 20% of fare", "Priority support badge", "Free cancellation badge"] },
];

export default function LoyaltyPage() {
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user]);

  if (!user) return null;

  const points = user.loyaltyPoints ?? 0;
  const earned = user.loyaltyEarned ?? 0;
  const history: any[] = user.loyaltyHistory ?? [];
  const tier = getTier(earned);
  const nextTier = getNextTier(earned);

  return (
    <>
      <Head>
        <title>MMT Rewards — Loyalty Points | MakeMyTour</title>
        <meta name="description" content="View your MMT Rewards loyalty points balance, tier status, transaction history, and redeem points on your next booking." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-20 pt-8 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mb-6 font-medium">
            ← Back to Profile
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">MMT Rewards</h1>
          <p className="text-gray-500 mb-8">Earn points on every booking. Redeem for discounts.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left column */}
            <div className="space-y-6">
              {/* Balance card */}
              <LoyaltyWidget points={points} earned={earned} />

              {/* Tier breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Tier Benefits</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {PERK_ROWS.map((row) => (
                    <div key={row.tier} className="px-5 py-4">
                      <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${row.color}`}>{row.tier}</span>
                      <ul className="space-y-1">
                        {row.perks.map((p) => (
                          <li key={p} className="flex items-center gap-1.5 text-sm text-gray-600">
                            <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Available", value: points.toLocaleString("en-IN"), sub: "spendable pts" },
                  { label: "Lifetime Earned", value: earned.toLocaleString("en-IN"), sub: "total pts" },
                  { label: "Tier", value: tier.label, sub: `${nextTier ? `${(nextTier.minEarned - earned).toLocaleString()} to ${nextTier.label}` : "Top tier 🏆"}` },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.sub}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Transaction history */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Points History</h2>
                </div>
                {history.length === 0 ? (
                  <div className="py-16 text-center">
                    <Gift size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No transactions yet</p>
                    <p className="text-gray-400 text-sm mt-1">Make your first booking to start earning points!</p>
                    <Link href="/" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700">
                      Book now <ArrowUpRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {history.map((event: any, i: number) => {
                      const isEarned = event.type === "EARNED" || (event.points ?? 0) > 0;
                      const pts = Math.abs(event.points ?? 0);
                      const date = event.date ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
                      return (
                        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isEarned ? "bg-green-50" : "bg-orange-50"}`}>
                            {isEarned ? <ArrowUpRight size={14} className="text-green-600" /> : <ArrowDownLeft size={14} className="text-orange-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{event.description || (isEarned ? "Points earned" : "Points redeemed")}</p>
                            <p className="text-xs text-gray-400">{date}</p>
                          </div>
                          <span className={`text-sm font-bold ${isEarned ? "text-green-600" : "text-orange-500"}`}>
                            {isEarned ? "+" : "-"}{pts.toLocaleString("en-IN")} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* How to earn / redeem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500" /> How to Earn</h3>
                  <div className="space-y-3">
                    {HOW_TO_EARN.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex gap-3">
                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon size={13} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Gift size={16} className="text-purple-500" /> How to Redeem</h3>
                  <div className="space-y-3">
                    {HOW_TO_REDEEM.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex gap-3">
                        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon size={13} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                    <Info size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    Points toggle appears automatically in the Fare Summary of every booking dialog when you have a balance.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
