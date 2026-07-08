import {
  CheckCircle2,
  Loader2,
  Circle,
} from "lucide-react";

interface Props {
  status: string;
}

export default function RefundTimeline({ status }: Props) {
  const steps = [
    {
      title: "Booking Cancelled",
      date: "08 Jul 2026 • 05:05 PM",
      key: "REQUESTED",
    },
    {
      title: "Refund Approved",
      date: "08 Jul 2026 • 05:08 PM",
      key: "APPROVED",
    },
    {
      title: "Processing by Bank",
      date: "Estimated 1–2 Working Days",
      key: "PROCESSING",
    },
    {
      title: "Refund Credited",
      date: "Pending",
      key: "COMPLETED",
    },
  ];

  const currentIndex = steps.findIndex(
    (step) => step.key === status
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">

      <h2 className="text-2xl font-bold mb-8">
        Refund Journey
      </h2>

      <div className="relative">

        {steps.map((step, index) => {

          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <div
              key={step.key}
              className="flex gap-5 relative pb-10 last:pb-0"
            >

              {/* Vertical Line */}

              {index !== steps.length - 1 && (
                <div
                  className={`absolute left-5 top-10 w-1 h-full rounded-full
                  ${
                    completed
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              )}

              {/* Icon */}

              <div className="z-10">

                {completed && (
                  <CheckCircle2
                    size={40}
                    className="text-green-500"
                  />
                )}

                {active && (
                  <Loader2
                    size={40}
                    className="text-orange-500 animate-spin"
                  />
                )}

                {!completed && !active && (
                  <Circle
                    size={40}
                    className="text-gray-300"
                  />
                )}

              </div>

              {/* Text */}

              <div className="flex-1">

                <h3
                  className={`text-lg font-semibold
                  ${
                    completed
                      ? "text-green-600"
                      : active
                      ? "text-orange-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </h3>

                <p className="text-gray-500 mt-1">
                  {step.date}
                </p>

              </div>

            </div>
          );

        })}

      </div>

    </div>
  );
}