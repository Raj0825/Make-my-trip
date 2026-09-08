import { useEffect } from "react";
import { Users, User, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PassengerInfo {
  name: string;
  age: string;
}

interface Props {
  count: number;
  passengers: PassengerInfo[];
  onChange: (passengers: PassengerInfo[]) => void;
}

/**
 * Renders one name/age field pair per traveler and keeps the passengers
 * array in sync with `count` (growing/shrinking as quantity changes
 * elsewhere on the page). Used in every booking dialog so a group booking
 * captures who's actually travelling, not just how many seats/rooms.
 * Age limit: traveler must be 18 or older.
 */
export default function PassengerDetailsForm({ count, passengers, onChange }: Props) {
  useEffect(() => {
    if (passengers.length === count) return;
    const next = Array.from({ length: count }, (_, i) => passengers[i] || { name: "", age: "" });
    onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const update = (index: number, field: keyof PassengerInfo, value: string) => {
    const next = passengers.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange(next);
  };

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
        <Users size={14} /> Traveler Details
      </p>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => {
          const age = Number(passengers[i]?.age);
          const ageInvalid = passengers[i]?.age !== "" && age < 18;
          return (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <User size={11} /> Traveler {i + 1}
              </p>
              <div className="grid grid-cols-[1fr_120px] gap-3 items-start">
                <div>
                  <Label htmlFor={`pax-name-${i}`} className="text-xs text-gray-500 mb-1 block">
                    Full Name
                  </Label>
                  <Input
                    id={`pax-name-${i}`}
                    value={passengers[i]?.name || ""}
                    onChange={(e) => update(i, "name", e.target.value)}
                    placeholder="Enter full name"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor={`pax-age-${i}`} className="text-xs text-gray-500 mb-1 block">
                    Age (18+)
                  </Label>
                  <Input
                    id={`pax-age-${i}`}
                    type="number"
                    min={18}
                    max={120}
                    value={passengers[i]?.age || ""}
                    onChange={(e) => update(i, "age", e.target.value)}
                    placeholder="Age"
                    className={`h-9 ${ageInvalid ? "border-red-400 focus:ring-red-400" : ""}`}
                  />
                </div>
              </div>
              {ageInvalid && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> Traveler must be 18 or older to book.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}