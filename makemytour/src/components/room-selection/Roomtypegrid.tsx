import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Crown, Check } from "lucide-react";
import { getRoomTypes, getBookingPreferences } from "@/api";

interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  amenities: string;
  photoUrls: string[];
  premium: boolean;
}

interface Props {
  hotelId: string;
  selectedRoomTypeId: string | null;
  onSelect: (roomType: RoomType) => void;
  rememberPreference: boolean;
  onRememberPreferenceChange: (checked: boolean) => void;
}

function PhotoCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (!photos || photos.length === 0) return null;

  return (
    <div className="relative h-40 rounded-t-xl overflow-hidden group">
      <img src={photos[index]} alt={name} className="w-full h-full object-cover" />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
            }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function RoomTypeGrid({
  hotelId,
  selectedRoomTypeId,
  onSelect,
  rememberPreference,
  onRememberPreferenceChange,
}: Props) {
  const user = useSelector((state: any) => state.user.user);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferredName, setPreferredName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRoomTypes(hotelId);
        setRoomTypes(data);
      } catch {
        setRoomTypes([]);
      }
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 20000); // reflect availability changes live
    return () => clearInterval(interval);
  }, [hotelId]);

  useEffect(() => {
    if (!user) return;
    getBookingPreferences(user.id)
      .then((pref) => {
        if (pref?.preferredRoomTypeName) setPreferredName(pref.preferredRoomTypeName);
      })
      .catch(() => {});
  }, [user]);

  if (loading) {
    return <div className="text-sm text-gray-400 py-6 text-center">Loading room options...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roomTypes.map((rt) => {
          const isSelected = selectedRoomTypeId === rt.id;
          const isSoldOut = rt.availableRooms <= 0;
          const isRecommended = preferredName === rt.name;

          return (
            <button
              key={rt.id}
              type="button"
              disabled={isSoldOut}
              onClick={() => onSelect(rt)}
              className={`text-left rounded-xl border-2 overflow-hidden transition-all bg-white ${
                isSoldOut
                  ? "opacity-50 cursor-not-allowed border-gray-200"
                  : isSelected
                  ? "border-blue-600 shadow-md"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <PhotoCarousel photos={rt.photoUrls} name={rt.name} />
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm flex items-center gap-1">
                    {rt.name}
                    {rt.premium && <Crown size={14} className="text-amber-500" />}
                  </span>
                  {isSelected && (
                    <span className="bg-blue-600 text-white rounded-full p-0.5">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                {isRecommended && (
                  <p className="text-[11px] text-green-700 mb-1">Matches your saved preference</p>
                )}
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{rt.amenities}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700">
                    ₹{rt.pricePerNight.toLocaleString()}
                    <span className="text-[10px] text-gray-400 font-normal">/night</span>
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {isSoldOut ? "Sold out" : `${rt.availableRooms} left`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {user && (
        <label className="flex items-center gap-2 text-xs text-gray-600 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberPreference}
            onChange={(e) => onRememberPreferenceChange(e.target.checked)}
          />
          Remember my preferred room type for future bookings
        </label>
      )}
    </div>
  );
}