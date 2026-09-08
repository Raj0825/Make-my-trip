import { useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { Info, ThumbsUp, ThumbsDown, Plane, Hotel as HotelIcon, Home as HomeIcon } from "lucide-react";
import { sendRecommendationFeedback } from "@/api";

export interface Recommendation {
  entityType: "FLIGHT" | "HOTEL" | "HOMESTAY";
  entityId: string;
  name: string;
  location: string;
  price: number;
  reason: string;
  matchedTags: string[];
}

const ROUTE_BY_TYPE: Record<string, string> = {
  FLIGHT: "/book-flight",
  HOTEL: "/book-hotel",
  HOMESTAY: "/book-homestay",
};

const ICON_BY_TYPE: Record<string, ReactNode> = {
  FLIGHT: <Plane size={14} />,
  HOTEL: <HotelIcon size={14} />,
  HOMESTAY: <HomeIcon size={14} />,
};

export default function RecommendationCard({
  rec,
  userId,
  onFeedback,
}: {
  rec: Recommendation;
  userId?: string;
  onFeedback: (entityType: string, entityId: string) => void;
}) {
  const [showReason, setShowReason] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"HELPFUL" | "IRRELEVANT" | null>(null);
  const router = useRouter();

  const handleFeedback = async (feedback: "HELPFUL" | "IRRELEVANT" | null) => {
    setFeedbackGiven(feedback);
    if (!userId || !feedback) return;
    try {
      await sendRecommendationFeedback(userId, rec.entityType, rec.entityId, feedback);
    } catch {
      // keep the optimistic UI even if the network call fails silently
    }
    if (feedback === "IRRELEVANT") {
      setTimeout(() => onFeedback(rec.entityType, rec.entityId), 300);
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow relative">
      <button
        type="button"
        onClick={() => router.push(`${ROUTE_BY_TYPE[rec.entityType]}/${rec.entityId}`)}
        className="text-left w-full"
      >
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
          {ICON_BY_TYPE[rec.entityType]}
          <span>{rec.entityType === "FLIGHT" ? "Flight" : rec.entityType === "HOTEL" ? "Hotel" : "Homestay"}</span>
        </div>
        <div className="font-semibold text-gray-900 truncate">{rec.name}</div>
        <div className="text-sm text-gray-500">{rec.location}</div>
        <div className="text-lg font-bold mt-2">₹{Math.round(rec?.price || 0).toLocaleString()}</div>
      </button>

      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={() => setShowReason((s) => !s)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Info size={12} /> Why this recommendation?
        </button>

        <div className="flex items-center gap-1">
            <button
              type="button"
              title="Helpful"
              onClick={() => handleFeedback(feedbackGiven === "HELPFUL" ? null : "HELPFUL")}
              className={`p-1 rounded transition-colors ${feedbackGiven === "HELPFUL" ? "bg-green-100 text-green-600" : "hover:bg-green-50 text-gray-400 hover:text-green-600"}`}
            >
              <ThumbsUp size={14} />
            </button>
            <button
              type="button"
              title="Not relevant"
              onClick={() => handleFeedback(feedbackGiven === "IRRELEVANT" ? null : "IRRELEVANT")}
              className={`p-1 rounded transition-colors ${feedbackGiven === "IRRELEVANT" ? "bg-red-100 text-red-500" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
      </div>

      {showReason && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 leading-relaxed">
          {rec.reason}
        </div>
      )}
    </div>
  );
}