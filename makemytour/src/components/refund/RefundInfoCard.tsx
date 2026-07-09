import {
  BadgeIndianRupee,
  CreditCard,
  CalendarDays,
  ReceiptText,
  Tag,
} from "lucide-react";

interface RefundInfoProps {
  refundAmount: number;
  bookingId: string;
  cancelledAt: string;
  cancellationReason: string;
  expectedDate: string;
}

export default function RefundInfoCard({
  refundAmount,
  bookingId,
  cancelledAt,
  cancellationReason,
  expectedDate,
}: RefundInfoProps) {
  const rows = [
    {
      icon: <BadgeIndianRupee className="text-green-600 w-5 h-5" />,
      label: "Refund Amount",
      value: <span className="text-xl font-bold text-green-600">₹ {refundAmount.toLocaleString("en-IN")}</span>,
    },
    {
      icon: <ReceiptText className="text-blue-600 w-5 h-5" />,
      label: "Booking ID",
      value: <span className="font-mono text-sm font-semibold text-gray-700 truncate max-w-[180px]">{bookingId}</span>,
    },
    {
      icon: <Tag className="text-orange-500 w-5 h-5" />,
      label: "Cancellation Reason",
      value: <span className="font-semibold text-gray-700">{cancellationReason}</span>,
    },
    {
      icon: <CreditCard className="text-purple-600 w-5 h-5" />,
      label: "Cancelled On",
      value: <span className="font-semibold text-gray-700">{cancelledAt}</span>,
    },
    {
      icon: <CalendarDays className="text-red-500 w-5 h-5" />,
      label: "Expected Refund Date",
      value: <span className="font-semibold text-gray-700">{expectedDate}</span>,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-5">Refund Details</h2>
      <div className="divide-y divide-gray-100">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              {row.icon}
              <span className="text-gray-500 text-sm">{row.label}</span>
            </div>
            <div className="text-right">{row.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-700 text-sm">Need Help?</h3>
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
          Refunds typically take 5–7 working days depending on your bank. If your refund is delayed beyond the expected date, contact our support team.
        </p>
        <button className="mt-3 bg-blue-600 hover:bg-blue-700 transition text-white text-sm px-4 py-2 rounded-lg font-semibold">
          Contact Support
        </button>
      </div>
    </div>
  );
}
