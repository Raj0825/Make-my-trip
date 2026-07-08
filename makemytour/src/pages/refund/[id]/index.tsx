import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import RefundProgress from "@/components/refund/RefundProgress";
import RefundInfoCard from "@/components/refund/RefundInfoCard";
import RefundTimeline from "@/components/refund/RefundTimeline";

export default function RefundPage() {
  const router = useRouter();
  const { id } = router.query;

  // Temporary data
  // Replace this with your API response later
  const refund = {
    bookingId: String(id || "BK12345678"),
    refundId: "RFD-20260708-001",
    amount: 7431.5,
    status: "PROCESSING",
    progress: 75,
    expectedDate: "15 July 2026",
    paymentMethod: "UPI",
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white rounded-b-3xl shadow-xl">

        <div className="max-w-6xl mx-auto px-6 py-8">

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">

            <div>

              <p className="uppercase tracking-[0.3em] text-blue-100 text-sm">
                Refund Tracking
              </p>

              <h1 className="text-4xl font-bold mt-2">
                ₹ {refund.amount.toLocaleString()}
              </h1>

              <p className="mt-3 text-blue-100">
                Your refund is currently being processed.
              </p>

              <div className="inline-flex mt-5 px-5 py-2 rounded-full bg-white/20 backdrop-blur-md">
                Processing by Bank
              </div>

            </div>

            <div className="hidden md:flex">

              <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-6xl">

                💸

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Body */}

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        <RefundProgress
          progress={refund.progress}
          status={refund.status}
        />

        <RefundInfoCard
          refundAmount={refund.amount}
          bookingId={refund.bookingId}
          refundId={refund.refundId}
          paymentMethod={refund.paymentMethod}
          expectedDate={refund.expectedDate}
        />

        <RefundTimeline
          status={refund.status}
        />

      </div>

    </div>
  );
}