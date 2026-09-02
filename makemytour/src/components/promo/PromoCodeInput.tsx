import { useState } from "react";
import { Tag, Check, X, Loader2 } from "lucide-react";
import { validatePromoCode } from "@/api";

interface Props {
  subtotal: number;
  appliedCode: string | null;
  discount: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
}

/**
 * Promo code field used in every booking dialog's fare summary. Validates
 * server-side against the promo catalog (so client tampering can't fabricate
 * a discount) and reports the resulting discount amount up to the parent,
 * which is responsible for subtracting it from the grand total.
 */
export default function PromoCodeInput({ subtotal, appliedCode, discount, onApply, onRemove }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await validatePromoCode(input.trim(), subtotal);
      if (result?.valid) {
        onApply(result.code, result.discount);
        setInput("");
      } else {
        setError(result?.message || "Invalid promo code");
      }
    } catch {
      setError("Couldn't validate code — please try again");
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm">
        <span className="flex items-center gap-1.5 text-green-700 font-medium">
          <Check size={14} /> {appliedCode} applied — you saved ₹{discount.toLocaleString()}
        </span>
        <button type="button" onClick={onRemove} className="text-green-700 hover:text-green-900">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="w-full h-9 rounded-md border border-input bg-transparent pl-8 pr-3 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !input.trim()}
          className="h-9 px-4 rounded-md bg-gray-800 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}