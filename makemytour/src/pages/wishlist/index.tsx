import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  Heart, Plane, TrainFront, Bus as BusIcon, Car as CarIcon, Building2, Home as HomeIcon,
  MapPin, Trash2, Ticket,
} from "lucide-react";
import {
  getWishlist, removeFromWishlist,
  gethotel, getflight, gettrain, getbus, getcab, gethomestay,
} from "@/api";
import Loader from "@/components/Loader";

const TYPE_META: Record<string, { icon: any; route: string; nameField: string; priceField: string; fetch: () => Promise<any[]> }> = {
  Flight:   { icon: Plane,      route: "book-flight",   nameField: "flightName",   priceField: "price",         fetch: getflight },
  Hotel:    { icon: Building2,  route: "book-hotel",     nameField: "hotelName",    priceField: "pricePerNight", fetch: gethotel },
  Train:    { icon: TrainFront, route: "book-train",     nameField: "trainName",    priceField: "price",         fetch: gettrain },
  Bus:      { icon: BusIcon,    route: "book-bus",       nameField: "busName",      priceField: "price",         fetch: getbus },
  Cab:      { icon: CarIcon,    route: "book-cab",       nameField: "cabType",      priceField: "price",         fetch: getcab },
  Homestay: { icon: HomeIcon,   route: "book-homestay",  nameField: "homestayName", priceField: "pricePerNight", fetch: gethomestay },
};

export default function WishlistPage() {
  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);
  const [favorites, setFavorites] = useState<{ type: string; entityId: string; addedAt: string }[]>([]);
  const [entities, setEntities] = useState<Record<string, Record<string, any>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    const load = async () => {
      try {
        const [favs, ...lists] = await Promise.all([
          getWishlist(user.id),
          ...Object.values(TYPE_META).map((m) => m.fetch()),
        ]);
        setFavorites(favs || []);
        const typeKeys = Object.keys(TYPE_META);
        const map: Record<string, Record<string, any>> = {};
        typeKeys.forEach((type, i) => {
          const byId: Record<string, any> = {};
          (lists[i] || []).forEach((item: any) => { if (item?.id) byId[item.id] = item; });
          map[type] = byId;
        });
        setEntities(map);
      } catch (e) {
        console.error("Error loading wishlist:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const items = useMemo(() => {
    return favorites
      .map((f) => {
        const meta = TYPE_META[f.type];
        const entity = meta ? entities[f.type]?.[f.entityId] : null;
        if (!meta || !entity) return null;
        return {
          ...f,
          meta,
          name: entity[meta.nameField] || f.type,
          price: entity[meta.priceField],
          location: entity.location || (entity.from && entity.to ? `${entity.from} → ${entity.to}` : ""),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [favorites, entities]);

  const handleRemove = async (type: string, entityId: string) => {
    if (!user?.id) return;
    setFavorites((prev) => prev.filter((f) => !(f.type === type && f.entityId === entityId)));
    try {
      await removeFromWishlist(user.id, type, entityId);
    } catch (e) {
      console.error("Failed to remove from wishlist:", e);
    }
  };

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Log in to see your saved trips.</p>
          <button onClick={() => router.push("/")} className="text-blue-600 font-medium hover:underline">Go to Home</button>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My Wishlist
        </h1>
        <p className="text-gray-500 text-sm mb-6">{items.length} saved listing{items.length !== 1 ? "s" : ""}</p>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Nothing saved yet — tap the heart icon on any listing to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => {
              const Icon = item.meta.icon;
              return (
                <div key={`${item.type}-${item.entityId}`} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    {item.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {item.location}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-blue-700">
                        {typeof item.price === "number" ? `₹${item.price.toLocaleString()}` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link href={`/${item.meta.route}/${item.entityId}`}
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                          <Ticket className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.type, item.entityId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}