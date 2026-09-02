import { useEffect } from "react";
import { Users, User } from "lucide-react";
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
      <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <Users size={14} /> Traveler Details
      </p>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-2 border border-gray-100 rounded-lg p-3 bg-gray-50/60">
            <div>
              <Label htmlFor={`pax-name-${i}`} className="text-xs text-gray-500 flex items-center gap-1">
                <User size={11} /> Traveler {i + 1} Name
              </Label>
              <Input
                id={`pax-name-${i}`}
                value={passengers[i]?.name || ""}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor={`pax-age-${i}`} className="text-xs text-gray-500">Age</Label>
              <Input
                id={`pax-age-${i}`}
                type="number"
                min={0}
                max={120}
                value={passengers[i]?.age || ""}
                onChange={(e) => update(i, "age", e.target.value)}
                placeholder="Age"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}