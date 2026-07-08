import {
  BadgeIndianRupee,
  CreditCard,
  CalendarDays,
  ReceiptText,
} from "lucide-react";

interface RefundInfoProps {
  refundAmount: number;
  bookingId: string;
  refundId: string;
  paymentMethod: string;
  expectedDate: string;
}

export default function RefundInfoCard({
  refundAmount,
  bookingId,
  refundId,
  paymentMethod,
  expectedDate,
}: RefundInfoProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Refund Details
      </h2>

      <div className="space-y-6">

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BadgeIndianRupee className="text-green-600" />
            <span className="text-gray-600">
              Refund Amount
            </span>
          </div>

          <span className="text-2xl font-bold text-green-600">
            ₹ {refundAmount.toLocaleString()}
          </span>
        </div>

        <hr />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ReceiptText className="text-blue-600" />
            <span className="text-gray-600">
              Booking ID
            </span>
          </div>

          <span className="font-semibold">
            {bookingId}
          </span>
        </div>

        <hr />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ReceiptText className="text-orange-500" />
            <span className="text-gray-600">
              Refund ID
            </span>
          </div>

          <span className="font-semibold">
            {refundId}
          </span>
        </div>

        <hr />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CreditCard className="text-purple-600" />
            <span className="text-gray-600">
              Payment Method
            </span>
          </div>

          <span className="font-semibold">
            {paymentMethod}
          </span>
        </div>

        <hr />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-red-500" />
            <span className="text-gray-600">
              Expected Refund Date
            </span>
          </div>

          <span className="font-semibold">
            {expectedDate}
          </span>
        </div>

      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-700">
          Need Help?
        </h3>

        <p className="text-sm text-gray-600 mt-2">
          Refunds usually take 5–7 working days depending on your
          payment provider. If your refund is delayed, please contact
          our support team.
        </p>

        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg"
        >
          Contact Support
        </button>
      </div>

    </div>
  );
}