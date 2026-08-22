import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, History, Radio } from "lucide-react";
import { getCurrentPricing, getPriceHistory } from "@/api";
import { subscribeToPriceUpdates } from "@/lib/pricingSocket";
import PriceHistoryChart from "./PriceHistoryChart";
import PriceFreezeButton from "./PriceFreezeButton";

interface Props {
  entityType: "FLIGHT" | "HOTEL" | "TRAIN" | "BUS" | "CAB" | "HOMESTAY";
  entityId: string;
  userId?: string;
  /** Called whenever the live price changes, so the parent page can update its fare summary. */
  onPriceChange?: (price: number) => void;
  /** Label of the currently-selected seat/room/class type, e.g. "Family Room" or "AC Sleeper". */
  variantLabel?: string;
  /** The actual price of that selected type — shown as the live price, and used to scale the history graph. */
  variantPrice?: number;
}

/**
 * Drop this into any booking detail page to show the Dynamic Pricing Engine's
 * live price, why it is what it is, a price-history graph, and a price-freeze
 * option. Prices update in real time over WebSocket as soon as the engine
 * recalculates (on its schedule, or right after a booking changes demand).
 *
 * When variantLabel/variantPrice are given (the seat/room/class type the
 * person currently has selected), the headline price and the whole history
 * graph are scaled to that type, so switching between e.g. "Family Room" and
 * "Group Room" shows that type's own price and price history — not just the
 * listing's base price.
 */
export default function DynamicPriceCard({ entityType, entityId, userId, onPriceChange, variantLabel, variantPrice }: Props) {
  const [pricing, setPricing] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  useEffect(() => {
    if (!entityId) return;
    let active = true;

    getCurrentPricing(entityType, entityId).then((data) => {
      if (active) {
        setPricing(data);
        onPriceChange?.(data.currentPrice);
      }
    });
    getPriceHistory(entityType, entityId).then((data) => active && setHistory(data));

    const unsubscribe = subscribeToPriceUpdates(entityType, entityId, (update) => {
      setPricing((prev: any) => ({
        ...prev,
        currentPrice: update.price,
        multiplier: update.multiplier,
        demandFactor: update.demandFactor,
        seasonalFactor: update.seasonalFactor,
        seasonalReason: update.reason,
        lastUpdated: update.timestamp,
      }));
      setHistory((prev) => [...prev, update]);
      onPriceChange?.(update.price);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    });

    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  if (!pricing) return null;

  const isSurged = pricing.multiplier > 1.0;
  const isDiscounted = pricing.multiplier < 1.0;

  // Scale the base entity price/history to the selected variant (e.g. Family
  // Room vs Group Room), so the headline and graph reflect what the person
  // actually picked rather than the listing's flat base price.
  const scaleFactor = variantPrice && pricing.currentPrice ? variantPrice / pricing.currentPrice : 1;
  const displayPrice = variantPrice ?? pricing.currentPrice;
  const scaledHistory = history.map((h) => ({ ...h, price: h.price * scaleFactor }));
  const scaledCurrent = {
    price: displayPrice,
    basePrice: pricing.basePrice != null ? pricing.basePrice * scaleFactor : undefined,
    timestamp: pricing.lastUpdated,
    reason: pricing.seasonalReason,
  };

  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">₹{Math.round(displayPrice).toLocaleString("en-IN")}</span>
            {isSurged && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <TrendingUp size={12} />
                {Math.round((pricing.multiplier - 1) * 100)}%
              </span>
            )}
            {isDiscounted && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <TrendingDown size={12} />
                {Math.round((1 - pricing.multiplier) * 100)}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {variantLabel && <span className="font-medium text-gray-600">{variantLabel} · </span>}
            {pricing.seasonalReason || "Standard pricing"} · updates live
          </p>
        </div>

        <span
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
            justUpdated ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          <Radio size={11} />
          {justUpdated ? "price updated" : "live"}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setShowHistory((s) => !s)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-3"
      >
        <History size={13} />
        {showHistory ? "Hide price history" : `View ${variantLabel ? `${variantLabel} ` : ""}price history`}
      </button>

      {showHistory && (
        <div className="mt-3">
          <PriceHistoryChart history={scaledHistory} current={scaledCurrent} />
        </div>
      )}

      {userId && (
        <div className="mt-3">
          <PriceFreezeButton userId={userId} entityType={entityType} entityId={entityId} minutes={60} />
        </div>
      )}
    </div>
  );
}