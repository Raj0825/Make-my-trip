import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface Props {
  status: string;
  cancelledAt?: string;
  expectedDate?: string;
}

export default function RefundTimeline({ status, cancelledAt, expectedDate }: Props) {
  // Map our 3-state backend status to 4-step UI journey
  const statusToIndex: Record<string, number> = {
    PENDING:   0,
    PROCESSED: 2,
    COMPLETED: 3,
  };
  const currentIndex = statusToIndex[status] ?? 0;

  const steps = [
    {
      title: "Booking Cancelled",
      subtitle: cancelledAt || "Refund initiated",
      key: "REQUESTED",
    },
    {
      title: "Refund Approved",
      subtitle: "Verified by our team",
      key: "APPROVED",
    },
    {
      title: "Processing by Bank",
      subtitle: "Estimated 1–3 working days",
      key: "PROCESSING",
    },
    {
      title: "Refund Credited",
      subtitle: status === "COMPLETED" ? "Done ✓" : expectedDate ? `Expected by ${expectedDate}` : "Pending",
      key: "COMPLETED",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Refund Journey</h2>
      <div className="relative">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;
          return (
            <div key={step.key} className="flex gap-4 relative pb-8 last:pb-0">
              {index !== steps.length - 1 && (
                <div className={`absolute left-5 top-10 w-0.5 h-full ${completed ? "bg-green-400" : "bg-gray-200"}`} />
              )}
              <div className="z-10 shrink-0">
                {completed && <CheckCircle2 size={40} className="text-green-500" />}
                {active    && <Loader2 size={40} className="text-blue-500 animate-spin" />}
                {!completed && !active && <Circle size={40} className="text-gray-300" />}
              </div>
              <div className="flex-1 pt-1">
                <h3 className={`font-semibold text-base ${completed ? "text-green-600" : active ? "text-blue-600" : "text-gray-400"}`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">{step.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
