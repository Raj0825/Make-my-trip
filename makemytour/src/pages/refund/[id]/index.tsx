import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, CreditCard, CalendarDays, BadgeIndianRupee } from "lucide-react";
import RefundProgress from "@/components/refund/RefundProgress";
import RefundTimeline from "@/components/refund/RefundTimeline";
import RefundInfoCard from "@/components/refund/RefundInfoCard";

export default function RefundPage() {
  const router = useRouter();
  const { id } = router.query;

  // Dummy Data (Replace with API later)
  const refund = {
    bookingId: id || "BK12345678",
    amount: 7431.5,
    status: "PROCESSING",
    progress: 75,
    expectedDate: "15 July 2026",
    paymentMethod: "UPI",
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/profile">
            <ArrowLeft className="cursor-pointer hover:scale-110 transition" />
          </Link>

          <div>
            <h1 className="text-3xl font-bold">
              Refund Tracking
            </h1>

            <p className="text-blue-100">
              Booking ID : {refund.bookingId}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-10 px-5">

        {/* Progress */}
        <RefundProgress
          progress={refund.progress}
          status={refund.status}
        />

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 mt-8">

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 text-blue-600">
              <BadgeIndianRupee />
              <h2 className="font-semibold">
                Refund Amount
              </h2>
            </div>

            <p className="text-3xl font-bold mt-3">
              ₹ {refund.amount}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 text-green-600">
              <CalendarDays />
              <h2 className="font-semibold">
                Expected Refund
              </h2>
            </div>

            <p className="text-xl font-semibold mt-3">
              {refund.expectedDate}
            </p>
          </div>

          <div className="mt-8">
              <RefundInfoCard
                  refundAmount={refund.amount}
                  bookingId={String(refund.bookingId)}
                  refundId="RFD-20260708-001"
                  paymentMethod={refund.paymentMethod}
                  expectedDate={refund.expectedDate}
              />
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 text-purple-600">
              <CreditCard />
              <h2 className="font-semibold">
                Payment Method
              </h2>
            </div>

            <p className="text-xl font-semibold mt-3">
              {refund.paymentMethod}
            </p>
          </div>

        </div>

        {/* Timeline */}
        <div className="mt-10">
          <RefundTimeline status={refund.status} />
        </div>

      </div>
    </div>
  );
}