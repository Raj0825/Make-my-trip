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

  if (!userId) return null; // only signed-in users get recommendations at all

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Based on your bookings and browsing history — tell us what's useful so we can do better.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-xl p-4 bg-gray-50 animate-pulse h-40" />
            ))}
          </div>
        ) : recs.length === 0 ? (
          <div className="text-sm text-gray-500 py-6 text-center border border-dashed rounded-lg">
            Nothing to recommend yet — browse or book a hotel, flight, or homestay and we'll start
            tailoring suggestions to you.
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}