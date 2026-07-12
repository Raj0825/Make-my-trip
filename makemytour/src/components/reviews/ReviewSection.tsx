import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Star, ThumbsUp, Flag, MessageCircle, Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getReviews,
  createReview,
  replyToReview,
  markReviewHelpful,
  flagReview,
  uploadReviewPhoto,
} from "@/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface Reply {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface Review {
  id: string;
  serviceType: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText: string;
  photoUrls: string[];
  createdAt: string;
  helpfulCount: number;
  helpfulUserIds: string[];
  flagCount: number;
  replies: Reply[];
}

interface Props {
  serviceType: "Flight" | "Hotel" | "Train" | "Bus" | "Cab" | "Homestay";
  serviceId: string;
}

function StarRow({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} onClick={() => onChange(n)}>
          <Star
            size={26}
            className={
              n <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ serviceType, serviceId }: Props) {
  const user = useSelector((state: any) => state.user.user);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"newest" | "helpful" | "rating">("newest");
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  // write-review form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // reply state
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // flag state
  const [flagOpenFor, setFlagOpenFor] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getReviews(serviceType, serviceId, sort, minRating);
      setReviews(data || []);
    } catch {
      setReviews([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceType, serviceId, sort, minRating]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmitReview = async () => {
    if (!user) return alert("Please log in to write a review.");
    if (rating === 0) return alert("Please select a star rating.");
    if (!text.trim()) return alert("Please write your review.");

    setSubmitting(true);
    try {
      const photoUrls: string[] = [];
      for (const file of photoFiles) {
        const url = await uploadReviewPhoto(file);
        photoUrls.push(url);
      }
      await createReview({
        serviceType,
        serviceId,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName || ""}`.trim(),
        rating,
        reviewText: text,
        photoUrls,
      });
      setRating(0);
      setText("");
      setPhotoFiles([]);
      setShowForm(false);
      await load();
    } catch (e) {
      alert("Failed to submit review. Please try again.");
    }
    setSubmitting(false);
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) return alert("Please log in to mark reviews as helpful.");
    await markReviewHelpful(reviewId, user.id);
    await load();
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!user) return alert("Please log in to reply.");
    if (!replyText.trim()) return;
    await replyToReview(reviewId, user.id, `${user.firstName} ${user.lastName || ""}`.trim(), replyText);
    setReplyText("");
    setReplyOpenFor(null);
    await load();
  };

  const handleFlagSubmit = async (reviewId: string) => {
    if (!user) return alert("Please log in to flag a review.");
    await flagReview(reviewId, user.id, flagReason);
    setFlagReason("");
    setFlagOpenFor(null);
    alert("Thanks — this review has been reported to our moderators.");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 text-white text-2xl font-bold w-16 h-16 rounded-lg flex items-center justify-center">
            {avgRating ?? "—"}
          </div>
          <div>
            <div className="font-semibold text-lg">Ratings & Reviews</div>
            <div className="text-gray-500 text-sm">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-slate-50">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 block mb-1">Your rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <Textarea
            placeholder="Share details of your experience..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mb-3"
            rows={4}
          />
          <div className="mb-3">
            <label className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer">
              <Camera size={18} />
              Add photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setPhotoFiles(Array.from(e.target.files).slice(0, 5));
                  }
                }}
              />
            </label>
            {photoFiles.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {photoFiles.map((f, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      className="w-16 h-16 object-cover rounded-md border"
                      alt="preview"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoFiles((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-white border rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleSubmitReview} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Submit Review"}
          </Button>
        </div>
      )}

      {/* Sort / Filter bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap text-sm">
        <span className="text-gray-500">Sort by:</span>
        {(["newest", "helpful", "rating"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-3 py-1 rounded-full border ${
              sort === s ? "bg-blue-500 text-white border-blue-500" : "text-gray-600 border-gray-300"
            }`}
          >
            {s === "newest" ? "Newest" : s === "helpful" ? "Most Helpful" : "Highest Rated"}
          </button>
        ))}
        <span className="text-gray-500 ml-3">Filter:</span>
        <select
          className="border border-gray-300 rounded-full px-3 py-1 text-gray-600"
          value={minRating ?? ""}
          onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">All ratings</option>
          <option value="4">4★ & up</option>
          <option value="3">3★ & up</option>
          <option value="2">2★ & up</option>
          <option value="1">1★ & up</option>
        </select>
      </div>

      {/* Review list */}
      {loading ? (
        <div className="text-gray-400 text-sm py-6 text-center">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-gray-400 text-sm py-6 text-center">
          No reviews yet — be the first to share your experience.
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => {
            const isMarkedHelpful = user && r.helpfulUserIds?.includes(user.id);
            return (
              <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {r.userName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.userName || "Anonymous"}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <StarRow value={r.rating} />
                </div>

                <p className="text-gray-700 text-sm mt-2">{r.reviewText}</p>

                {r.photoUrls?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {r.photoUrls.map((url, i) => (
                      <img
                        key={i}
                        src={`${BACKEND_URL}${url}`}
                        className="w-20 h-20 object-cover rounded-md border"
                        alt="review"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <button
                    onClick={() => handleHelpful(r.id)}
                    className={`flex items-center gap-1 hover:text-blue-600 ${
                      isMarkedHelpful ? "text-blue-600 font-semibold" : ""
                    }`}
                  >
                    <ThumbsUp size={14} /> Helpful ({r.helpfulCount})
                  </button>
                  <button
                    onClick={() => setReplyOpenFor(replyOpenFor === r.id ? null : r.id)}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <MessageCircle size={14} /> Reply
                  </button>
                  <button
                    onClick={() => setFlagOpenFor(flagOpenFor === r.id ? null : r.id)}
                    className="flex items-center gap-1 hover:text-red-600"
                  >
                    <Flag size={14} /> Report
                  </button>
                </div>

                {replyOpenFor === r.id && (
                  <div className="mt-3 flex gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={() => handleReplySubmit(r.id)}>
                      Post
                    </Button>
                  </div>
                )}

                {flagOpenFor === r.id && (
                  <div className="mt-3 flex gap-2">
                    <Textarea
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="Why are you reporting this review? (optional)"
                      rows={2}
                      className="text-sm"
                    />
                    <Button size="sm" variant="destructive" onClick={() => handleFlagSubmit(r.id)}>
                      Report
                    </Button>
                  </div>
                )}

                {r.replies?.length > 0 && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-100 space-y-2">
                    {r.replies.map((rep) => (
                      <div key={rep.id} className="text-sm">
                        <span className="font-medium">{rep.userName}</span>{" "}
                        <span className="text-gray-400 text-xs">
                          {new Date(rep.createdAt).toLocaleDateString()}
                        </span>
                        <p className="text-gray-600">{rep.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}