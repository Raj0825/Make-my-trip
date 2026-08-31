import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { addToWishlist, removeFromWishlist, getWishlist } from "@/api";

interface Props {
  userId?: string;
  type: string; // "Train" | "Bus" | "Flight" | "Cab" | "Hotel" | "Homestay"
  entityId: string;
  className?: string;
}

/**
 * Small heart button for listing/detail pages. Loads the user's current
 * wishlist state on mount so the heart renders filled if already saved, and
 * toggles it on click. Renders nothing if there's no logged-in user.
 */
export default function WishlistButton({ userId, type, entityId, className = "" }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getWishlist(userId)
      .then((list: any[]) => {
        if (!active) return;
        setSaved((list || []).some((f) => f.type === type && f.entityId === entityId));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [userId, type, entityId]);

  if (!userId) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        await removeFromWishlist(userId, type, entityId);
        setSaved(false);
      } else {
        await addToWishlist(userId, type, entityId);
        setSaved(true);
      }
    } catch (e) {
      console.error("Wishlist toggle failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors disabled:opacity-50 ${
        saved ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200"
      } ${className}`}
    >
      <Heart size={16} className={saved ? "fill-red-500" : ""} />
    </button>
  );
}