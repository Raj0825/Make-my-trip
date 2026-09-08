import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  Star, Zap, Award, TrendingUp, Gift, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Info, ShieldCheck, Plane, Hotel, Train,
  Bus, Car, Home, CheckCircle, Tag, Sparkles,
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

const SERVICES = [
  { icon: Plane,  label: "Flights" },
  { icon: Hotel,  label: "Hotels" },
  { icon: Train,  label: "Trains" },
  { icon: Bus,    label: "Buses" },
  { icon: Car,    label: "Cabs" },
  { icon: Home,   label: "Homestays" },
];

const STEPS = [
  { step: "1", title: "Book any service", desc: "Make a booking on flights, hotels, trains, buses, cabs, or homestays.", color: "bg-blue-600" },
  { step: "2", title: "Earn points automatically", desc: "Points are added to your account instantly after every confirmed booking.", color: "bg-indigo-600" },
  { step: "3", title: "Level up your tier", desc: "Accumulate lifetime earnings to unlock Gold (50K pts) and Platinum (100K pts) tiers.", color: "bg-purple-600" },
  { step: "4", title: "Redeem at checkout", desc: "Toggle the rewards slider in the Fare Summary of any booking dialog to apply a discount.", color: "bg-rose-500" },
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
  const progressPct = nextTier
    ? Math.min(100, Math.round(((earned - (tier.minEarned ?? 0)) / (nextTier.minEarned - (tier.minEarned ?? 0))) * 100))
    : 100;

  return (
    <>
      <Head>
        <title>MMT Rewards — Loyalty Points | MakeMyTour</title>
        <meta name="description" content="View your MMT Rewards loyalty points balance, tier status, transaction history, and redeem points on your next booking." />
      </Head>

      {/* ─── HERO ────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-8 font-medium transition-colors">
            ← Back to Profile
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left — user status */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles size={12} /> MMT Rewards Program
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-3">
                Your Rewards,<br />Your Journey
              </h1>
              <p className="text-white/70 text-lg mb-8">
                Earn points on every booking and unlock exclusive benefits as you climb the tiers.
              </p>

              {/* Tier badge + progress */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-white/60 font-medium mb-0.5">Current Tier</p>
                    <p className="text-2xl font-extrabold">{tier.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 font-medium mb-0.5">Points Balance</p>
                    <p className="text-2xl font-extrabold">{points.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                {nextTier && (
                  <>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="text-xs text-white/60">
                      {(nextTier.minEarned - earned).toLocaleString("en-IN")} more points to reach <span className="font-semibold text-white">{nextTier.label}</span>
                    </p>
                  </>
                )}
                {!nextTier && (
                  <p className="text-xs text-amber-300 font-semibold">🏆 You're at the highest tier!</p>
                )}
              </div>
            </div>

            {/* Right — quick stats */}
            <div className="lg:w-72 space-y-3">
              {[
                { label: "Available Points", value: points.toLocaleString("en-IN"), sub: "Ready to redeem", color: "from-blue-500 to-indigo-600" },
                { label: "Lifetime Earned", value: earned.toLocaleString("en-IN"), sub: "Total points ever earned", color: "from-purple-500 to-violet-600" },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-2xl p-5`}>
                  <p className="text-white/70 text-xs font-medium mb-1">{s.label}</p>
                  <p className="text-3xl font-extrabold">{s.value}</p>
                  <p className="text-white/60 text-xs mt-1">{s.sub}</p>
                </div>
              ))}
              <Link href="/" className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm">
                <Plane size={15} /> Book & Earn More Points
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─────────────────────────────────────── */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-20 pt-10 px-4">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* How It Works — 4-step flow */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-500 mb-6">Four simple steps to earn and redeem your rewards.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map((s) => (
                <div key={s.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={`w-9 h-9 rounded-xl ${s.color} text-white font-extrabold text-lg flex items-center justify-center mb-4`}>
                    {s.step}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Earn on every service */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Earn on Every Service</h2>
            <p className="text-gray-500 mb-5">1 point for every ₹1 spent across all 6 travel categories.</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {SERVICES.map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tier Benefits */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tier Benefits</h2>
            <p className="text-gray-500 mb-5">Unlock more perks as you earn more lifetime points.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PERK_ROWS.map((row) => {
                const isActive = tier.label === row.tier;
                return (
                  <div key={row.tier} className={`bg-white rounded-2xl border shadow-sm p-5 ${isActive ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"}`}>
                    {isActive && <p className="text-xs font-bold text-blue-600 mb-2">✦ Your current tier</p>}
                    <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 ${row.color}`}>{row.tier}</span>
                    <ul className="space-y-1.5">
                      {row.perks.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={13} className="text-green-500 flex-shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                    {row.tier === "Gold" && <p className="text-xs text-amber-600 mt-3 font-medium">Requires 50,000 lifetime pts</p>}
                    {row.tier === "Platinum" && <p className="text-xs text-purple-600 mt-3 font-medium">Requires 100,000 lifetime pts</p>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* How to Earn & Redeem */}
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

          {/* Transaction History */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-5">Points History</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
          </section>

        </div>
      </div>
    </>
  );
}
