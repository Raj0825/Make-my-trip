import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, IndianRupee, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import RefundProgress from "@/components/refund/RefundProgress";
import RefundInfoCard from "@/components/refund/RefundInfoCard";
import RefundTimeline from "@/components/refund/RefundTimeline";

const STATUS_LABEL: Record<string, string> = {
  PENDING:   "Refund Requested",
  PROCESSED: "Processing by Bank",
  COMPLETED: "Refund Credited",
  NO_REFUND: "No Refund",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "bg-yellow-400/20 text-yellow-200",
  PROCESSED: "bg-blue-400/20 text-blue-100",
  COMPLETED: "bg-green-400/20 text-green-100",
  NO_REFUND: "bg-gray-400/20 text-gray-200",
};

export default function RefundPage() {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const id = router.query.bookingId as string;
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const user = JSON.parse(saved);
        const found = user?.bookings?.find(
          (b: any) => b.bookingId === id && b.cancelled
        );
        setBooking(found || null);
      }
    } catch {}
    setLoading(false);
  }, [router.isReady, router.query.bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 max-w-md">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Booking not found</h2>
          <p className="text-gray-500 text-sm mb-6">
            We couldn't find a cancelled booking with this ID. Please check your profile.
          </p>
          <Link href="/profile"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const status = booking.refundStatus || "NO_REFUND";
  const hasRefund = status !== "NO_REFUND" && booking.refundAmount > 0;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white rounded-b-3xl shadow-xl">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/profile"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 text-sm transition">
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="uppercase tracking-[0.25em] text-blue-200 text-xs font-semibold mb-2">
                Refund Tracking · {booking.type}
              </p>
              {hasRefund ? (
                <div className="flex items-center gap-1 text-4xl font-bold">
                  <IndianRupee className="w-8 h-8" />
                  {booking.refundAmount.toLocaleString("en-IN")}
                </div>
              ) : (
                <h1 className="text-3xl font-bold">No Refund Applicable</h1>
              )}
              <p className="mt-2 text-blue-100 text-sm">
                {hasRefund ? "Your refund is on its way." : "This booking was cancelled outside the refund window."}
              </p>
              <div className={`inline-flex mt-4 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md ${STATUS_COLOR[status] || "bg-white/20 text-white"}`}>
                {STATUS_LABEL[status] || status}
              </div>
            </div>
            <div className="hidden md:flex w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl items-center justify-center text-5xl shrink-0">
              💸
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {hasRefund && <RefundProgress status={status} />}
        <RefundInfoCard
          refundAmount={booking.refundAmount}
          bookingId={booking.bookingId}
          cancelledAt={booking.cancelledAt}
          cancellationReason={booking.cancellationReason}
          expectedDate={booking.expectedRefundDate || "—"}
        />
        {hasRefund && (
          <RefundTimeline
            status={status}
            cancelledAt={booking.cancelledAt}
            expectedDate={booking.expectedRefundDate}
          />
        )}
      </div>
    </div>
  );
}