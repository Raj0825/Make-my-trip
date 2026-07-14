import { Clock, AlertTriangle, PlaneTakeoff, Plane, PlaneLanding, CheckCircle2, XCircle } from "lucide-react";

interface StatusEvent {
  status: string;
  message: string;
  timestamp: string;
}

interface FlightStatusData {
  status: string;
  delayMinutes?: number;
  delayReason?: string;
  revisedDepartureTime?: string;
  estimatedArrivalTime?: string;
  lastUpdated: string;
  history: StatusEvent[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ON_TIME: { label: "On Time", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  BOARDING: { label: "Boarding", color: "bg-blue-100 text-blue-700", icon: PlaneTakeoff },
  DELAYED: { label: "Delayed", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  DEPARTED: { label: "Departed", color: "bg-indigo-100 text-indigo-700", icon: Plane },
  IN_AIR: { label: "In Air", color: "bg-sky-100 text-sky-700", icon: Plane },
  LANDED: { label: "Landed", color: "bg-gray-200 text-gray-700", icon: PlaneLanding },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function FlightStatusBadge({ status }: { status: FlightStatusData | null }) {
  if (!status) return null;

  const config = STATUS_CONFIG[status.status] || STATUS_CONFIG.ON_TIME;
  const Icon = config.icon;

  return (
    <div className={`rounded-lg p-3 ${config.color}`}>
      <div className="flex items-center gap-2 font-semibold text-sm">
        <Icon size={16} />
        {config.label}
        {status.status === "DELAYED" && status.delayMinutes && (
          <span>
            by {status.delayMinutes >= 60
              ? `${Math.floor(status.delayMinutes / 60)}h ${status.delayMinutes % 60}m`
              : `${status.delayMinutes}m`}
          </span>
        )}
      </div>
      {status.status === "DELAYED" && status.delayReason && (
        <p className="text-xs mt-1 opacity-80">Reason: {status.delayReason}</p>
      )}
      {status.estimatedArrivalTime && (
        <p className="text-xs mt-1 flex items-center gap-1 opacity-80">
          <Clock size={12} /> Est. arrival: {new Date(status.estimatedArrivalTime).toLocaleString()}
        </p>
      )}
      <p className="text-[10px] mt-1 opacity-60">
        Updated {new Date(status.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  );
}