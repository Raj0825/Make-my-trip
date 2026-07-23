import { useEffect, useState } from "react";
import { Snowflake, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { freezePrice, getEffectivePrice } from "@/api";

interface Props {
  userId: string;
  entityType: string;
  entityId: string;
  minutes?: number;
  onFrozen?: (frozenPrice: number, expiresAt: number) => void;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "expired";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

export default function PriceFreezeButton({ userId, entityType, entityId, minutes = 60, onFrozen }: Props) {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getEffectivePrice(userId, entityType, entityId)
      .then((data) => {
        if (data?.frozen && data?.expiresAt) setExpiresAt(data.expiresAt);
      })
      .catch(() => {});
  }, [userId, entityType, entityId]);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const remaining = expiresAt ? expiresAt - now : 0;
  const isActive = !!expiresAt && remaining > 0;

  const handleFreeze = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const freeze = await freezePrice(userId, entityType, entityId, minutes);
      setExpiresAt(freeze.expiresAt);
      setNow(Date.now());
      onFrozen?.(freeze.frozenPrice, freeze.expiresAt);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (isActive) {
    return (
      <div className="flex items-center gap-2 text-sm bg-sky-50 text-sky-700 rounded-lg px-3 py-2">
        <Snowflake size={16} />
        <span className="font-medium">Price locked</span>
        <span className="flex items-center gap-1 text-sky-600">
          <Clock size={13} />
          {formatRemaining(remaining)}
        </span>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center gap-2"
      disabled={loading || !userId}
      onClick={handleFreeze}
      title={!userId ? "Log in to freeze this price" : undefined}
    >
      <Snowflake size={16} />
      {loading ? "Locking price…" : `Freeze this price for ${minutes >= 60 ? `${Math.round(minutes / 60)}h` : `${minutes}m`}`}
    </Button>
  );
}