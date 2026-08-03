import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getRecommendations } from "@/api";
import RecommendationCard, { Recommendation } from "./RecommendationCard";

export default function RecommendationsSection({ userId }: { userId?: string }) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;
    getRecommendations(userId, 6)
      .then((data) => active && setRecs(data))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  const handleFeedback = (entityType: string, entityId: string) => {
    setRecs((prev) => prev.filter((r) => !(r.entityType === entityType && r.entityId === entityId)));
  };

  if (!userId || loading || recs.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={20} className="text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Based on your bookings and browsing history — tell us what's useful so we can do better.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recs.map((rec) => (
          <RecommendationCard
            key={`${rec.entityType}-${rec.entityId}`}
            rec={rec}
            userId={userId}
            onFeedback={handleFeedback}
          />
        ))}
      </div>
    </section>
  );
}