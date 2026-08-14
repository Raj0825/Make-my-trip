import { Check, IndianRupee } from "lucide-react";

export interface SeatTypePriceOption {
  key: string;
  label: string;
  price: number;
  sublabel?: string;
}

interface Props {
  title?: string;
  options: SeatTypePriceOption[];
  selectedKey: string;
}

/**
 * Reusable ticket-pricing chart: shows the price for every seat/class/type
 * option on this booking (AC vs Non-AC, Seater vs Sleeper, Economy vs
 * Business, coach class, cab tier, etc.) as horizontal bars, with the
 * currently-selected option highlighted in blue. Drop into any booking page
 * — train, bus, flight, cab — right where the person picks their type.
 */
export default function SeatTypeChart({ title = "Price by Type", options, selectedKey }: Props) {
  if (!options || options.length === 0) return null;
  const maxPrice = Math.max(...options.map((o) => o.price), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="space-y-2.5">
        {options.map((opt) => {
          const isSelected = opt.key === selectedKey;
          const widthPct = Math.max(6, Math.round((opt.price / maxPrice) * 100));
          return (
            <div key={opt.key}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${
                    isSelected ? "text-blue-700" : "text-gray-600"
                  }`}
                >
                  {isSelected && (
                    <span className="bg-blue-600 text-white rounded-full p-0.5">
                      <Check size={9} />
                    </span>
                  )}
                  {opt.label}
                  {opt.sublabel && <span className="text-gray-400 font-normal">· {opt.sublabel}</span>}
                </span>
                <span className={`text-xs font-bold flex items-center ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                  <IndianRupee size={10} />
                  {Math.round(opt.price).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${isSelected ? "bg-blue-600" : "bg-gray-300"}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}