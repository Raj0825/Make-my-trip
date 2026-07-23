import { useMemo } from "react";

interface PricePoint {
  price: number;
  timestamp: number;
  reason?: string;
}

export default function PriceHistoryChart({ history }: { history: PricePoint[] }) {
  const { points, minP, maxP, width, height, padding } = useMemo(() => {
    const width = 560;
    const height = 180;
    const padding = 32;

    if (!history || history.length === 0) {
      return { points: [], minP: 0, maxP: 0, width, height, padding };
    }

    const prices = history.map((h) => h.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    const points = history.map((h, i) => {
      const x = padding + (i / Math.max(history.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((h.price - minP) / range) * (height - padding * 2);
      return { x, y, ...h };
    });

    return { points, minP, maxP, width, height, padding };
  }, [history]);

  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-6 text-center border border-dashed rounded-lg">
        No price changes recorded yet for this item.
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="priceHistoryFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        <path d={areaPath} fill="url(#priceHistoryFill)" />
        <path d={linePath} fill="none" stroke="#dc2626" strokeWidth={2} />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#dc2626" />
            <title>
              ₹{p.price.toLocaleString()} — {new Date(p.timestamp).toLocaleString()}
              {p.reason ? ` (${p.reason})` : ""}
            </title>
          </g>
        ))}

        <text x={padding} y={16} fontSize="11" fill="#6b7280">
          ₹{maxP.toLocaleString()}
        </text>
        <text x={padding} y={height - padding + 16} fontSize="11" fill="#6b7280">
          ₹{minP.toLocaleString()}
        </text>
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>{new Date(history[0].timestamp).toLocaleDateString()}</span>
        <span>{new Date(history[history.length - 1].timestamp).toLocaleDateString()}</span>
      </div>
    </div>
  );
}