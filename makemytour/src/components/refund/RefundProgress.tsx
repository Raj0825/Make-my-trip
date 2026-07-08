import { CheckCircle, Loader2 } from "lucide-react";

interface Props {
  progress: number;
  status: string;
}

export default function RefundProgress({
  progress,
  status,
}: Props) {
  const getStatusColor = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "PROCESSING":
        return "bg-orange-500";
      case "APPROVED":
        return "bg-blue-500";
      default:
        return "bg-red-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "COMPLETED":
        return "Refund Completed";
      case "PROCESSING":
        return "Processing by Bank";
      case "APPROVED":
        return "Refund Approved";
      default:
        return "Refund Requested";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Refund Progress
          </h2>

          <p className="text-gray-500 mt-1">
            Your refund is being processed.
          </p>
        </div>

        {status === "COMPLETED" ? (
          <CheckCircle
            size={38}
            className="text-green-500"
          />
        ) : (
          <Loader2
            size={38}
            className="animate-spin text-orange-500"
          />
        )}
      </div>

      {/* Progress Percentage */}

      <div className="flex justify-between mb-2">

        <span className="font-medium">
          {getStatusText()}
        </span>

        <span className="font-bold">
          {progress}%
        </span>

      </div>

      {/* Progress Bar */}

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">

        <div
          className={`${getStatusColor()} h-4 rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      {/* Stage Labels */}

      <div className="flex justify-between mt-5 text-sm text-gray-500">

        <div className="text-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
          Requested
        </div>

        <div className="text-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
          Approved
        </div>

        <div className="text-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-2"></div>
          Processing
        </div>

        <div className="text-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
          Credited
        </div>

      </div>

    </div>
  );
}