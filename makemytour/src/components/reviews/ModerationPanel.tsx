import { useEffect, useState } from "react";
import { Star, Flag, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFlaggedReviews, moderateReview } from "@/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function ModerationPanel() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getFlaggedReviews();
      setReviews(data || []);
    } catch {
      setReviews([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleModerate = async (reviewId: string, action: "APPROVE" | "REMOVE") => {
    await moderateReview(reviewId, action);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Flagged Reviews</h2>
        <span className="text-sm text-gray-500">
          {reviews.length} awaiting moderation
        </span>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-6 text-center">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-gray-400 text-sm py-6 text-center">
          Nothing flagged right now — you're all caught up.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{r.userName}</span>
                  <span className="text-gray-400">
                    · {r.serviceType} #{r.serviceId}
                  </span>
                  <span className="flex items-center gap-0.5 text-yellow-600">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={12}
                        className={n <= r.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
                      />
                    ))}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                  <Flag size={12} /> {r.flagCount} reports
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-2">{r.reviewText}</p>

              {r.photoUrls?.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {r.photoUrls.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={`${BACKEND_URL}${url}`}
                      className="w-16 h-16 object-cover rounded border"
                      alt="review"
                    />
                  ))}
                </div>
              )}

              {r.flagReasons?.length > 0 && (
                <div className="text-xs text-gray-500 mb-3">
                  Reasons reported: {r.flagReasons.join(", ")}
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleModerate(r.id, "APPROVE")}>
                  <Check size={14} className="mr-1" /> Approve (keep visible)
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleModerate(r.id, "REMOVE")}>
                  <X size={14} className="mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}