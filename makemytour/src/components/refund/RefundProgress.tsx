import { CheckCircle, Loader2 } from "lucide-react";

interface Props {
  status: string;
}

const STATUS_CONFIG: Record<string, { progress: number; color: string; text: string }> = {
  PENDING:   { progress: 25,  color: "bg-yellow-500", text: "Refund Requested" },
  PROCESSED: { progress: 65,  color: "bg-blue-500",   text: "Processing by Bank" },
  COMPLETED: { progress: 100, color: "bg-green-500",  text: "Refund Credited" },
};

export default function RefundProgress({ status }: Props) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["PENDING"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Refund Progress</h2>
          <p className="text-gray-500 text-sm mt-0.5">Your refund is being processed.</p>
        </div>
        {status === "COMPLETED" ? (
          <CheckCircle size={34} className="text-green-500" />
        ) : (
          <Loader2 size={34} className="animate-spin text-blue-500" />
        )}
      </div>

      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-700">{cfg.text}</span>
        <span className="font-bold text-gray-800">{cfg.progress}%</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`${cfg.color} h-3 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${cfg.progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-4 text-xs text-gray-400">
        {[
          { label: "Requested", color: "bg-yellow-400" },
          { label: "Approved",  color: "bg-blue-400" },
          { label: "Processing",color: "bg-indigo-400" },
          { label: "Credited",  color: "bg-green-500" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5">
            <div className={`w-2.5 h-2.5 ${s.color} rounded-full`} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
