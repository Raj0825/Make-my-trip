import { useMemo, useState } from "react";

interface PricePoint {
  price: number;
  timestamp: number;
  reason?: string;
}

interface CurrentPricing {
  price: number;
  basePrice?: number;
  timestamp?: number;
  reason?: string;
}

interface Props {
  history: PricePoint[];
  /** The live price right now - always shown as the final "Now" point, even if history is empty or stale. */
  current?: CurrentPricing;
}

function formatMoney(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function formatDateShort(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PriceHistoryChart({ history, current }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const data = useMemo(() => {
    const cleaned = [...(history || [])].sort((a, b) => a.timestamp - b.timestamp);

    // Always guarantee at least a starting point and a "Now" point, so the chart
    // is never blank just because the price happens not to have changed yet.
    if (current) {
      const hasStart = cleaned.length > 0;
      if (!hasStart && current.basePrice != null) {
        cleaned.unshift({
          price: current.basePrice,
          timestamp: (current.timestamp || Date.now()) - 24 * 60 * 60 * 1000,
          reason: "Starting price",
        });
      }
      const last = cleaned[cleaned.length - 1];
      const isSameAsLast = last && Math.abs(last.price - current.price) < 0.01;
      if (!isSameAsLast || cleaned.length === 0) {
        cleaned.push({
          price: current.price,
          timestamp: current.timestamp || Date.now(),
          reason: current.reason || "Current price",
        });
      }
    }
    return cleaned;
  }, [history, current]);

  const { points, minP, maxP, width, height, padding, midP } = useMemo(() => {
    const width = 600;
    const height = 220;
    const padding = 44;

    if (data.length === 0) {
      return { points: [] as any[], minP: 0, maxP: 0, midP: 0, width, height, padding };
    }

    const prices = data.map((h) => h.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const midP = (minP + maxP) / 2;
    const range = maxP - minP || Math.max(minP * 0.1, 1);
    const effMin = minP - range * 0.15;
    const effMax = maxP + range * 0.15;
    const effRange = effMax - effMin || 1;

    const points = data.map((h, i) => {
      const x = data.length === 1 ? width / 2 : padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((h.price - effMin) / effRange) * (height - padding * 2);
      return { x, y, ...h, index: i };
    });

    return { points, minP, maxP, midP, width, height, padding };
  }, [data]);

  if (points.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-6 text-center border border-dashed rounded-lg">
        Price data isn't available yet for this item.
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : "";

  const gridLines = [minP, midP, maxP];
  const active = selected != null ? points[selected] : points[points.length - 1];
  const isLastPoint = active?.index === points.length - 1;

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-red-600" /> Price over time
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-600 ring-2 ring-red-100" /> Tap a point for details
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        <defs>
          <linearGradient id="priceHistoryFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal gridlines with price labels, so the scale is readable without guessing */}
        {gridLines.map((val, i) => {
          const range = (maxP - minP) || Math.max(minP * 0.1, 1);
          const effMin = minP - range * 0.15;
          const effMax = maxP + range * 0.15;
          const effRange = effMax - effMin || 1;
          const y = height - padding - ((val - effMin) / effRange) * (height - padding * 2);
          return (
            <g key={i}>
              <line x1={padding - 6} y1={y} x2={width - padding + 6} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={4} y={y + 4} fontSize="12" fill="#6b7280">
                {formatMoney(val)}
              </text>
            </g>
          );
        })}

        {/* baseline axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />

        {points.length > 1 && <path d={areaPath} fill="url(#priceHistoryFill)" />}
        {points.length > 1 && <path d={linePath} fill="none" stroke="#dc2626" strokeWidth={2.5} />}

        {points.map((p, i) => {
          const isActive = active?.index === i;
          const isNow = i === points.length - 1;
          return (
            <g key={i} onClick={() => setSelected(i)} style={{ cursor: "pointer" }}>
              {/* generous invisible hit-area so it's easy to tap on mobile */}
              <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 7 : 5}
                fill={isNow ? "#dc2626" : "#f87171"}
                stroke="#fff"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {isNow && (
                <text x={p.x} y={height - padding + 20} fontSize="11" fill="#dc2626" fontWeight="600" textAnchor="middle">
                  Now
                </text>
              )}
            </g>
          );
        })}

        {/* x-axis start/end date labels */}
        <text x={points[0].x} y={height - 6} fontSize="11" fill="#9ca3af" textAnchor="start">
          {formatDateShort(points[0].timestamp)}
        </text>
        {points.length > 1 && (
          <text x={points[points.length - 1].x} y={height - 6} fontSize="11" fill="#9ca3af" textAnchor="end">
            {formatDateShort(points[points.length - 1].timestamp)}
          </text>
        )}
      </svg>

      {/* Always-visible detail panel instead of a hover-only tooltip, so it works on touchscreens too */}
      {active && (
        <div className="mt-2 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
          <div>
            <span className="font-semibold text-gray-900">{formatMoney(active.price)}</span>
            <span className="text-gray-400 mx-1.5">·</span>
            <span className="text-gray-500">{active.reason || "Standard pricing"}</span>
          </div>
          <span className="text-xs text-gray-400">
            {isLastPoint ? "Right now" : formatDateTime(active.timestamp)}
          </span>
        </div>
      )}
    </div>
  );
}