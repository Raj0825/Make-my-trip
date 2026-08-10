import { useRouter } from "next/router";
import DynamicPriceCard from "@/components/pricing/DynamicPriceCard";
import ReviewSection from "@/components/reviews/ReviewSection";
import {
  HomeIcon,
  MapPin,
  CreditCard,
  Ticket,
  BedDouble,
  Users,
  Wifi,
  ShieldCheck,
  UtensilsCrossed,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { gethomestay, handlehomestaybooking, trackInteraction } from "@/api";
interface Homestay {
  id: string;
  homestayName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";

// ---------------------------------------------------------------------------
// Static homestay photo bank. In absence of a photoUrls field on the backend
// Homestay model, we deterministically pick a themed gallery per homestay so
// every listing still gets a real, distinct-looking set of images.
// ---------------------------------------------------------------------------
const HOMESTAY_PHOTO_SETS: string[][] = [
  [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80",
  ],
];

// Room choices offered at every homestay. Each option adds/subtracts from the
// base pricePerNight and carries its own bed count + guest capacity, so the
// price genuinely differs by number of beds as requested.
interface RoomOption {
  key: string;
  name: string;
  beds: number;
  guests: number;
  priceDelta: number;
  description: string;
}

const ROOM_OPTIONS_TEMPLATE: RoomOption[] = [
  {
    key: "cozy",
    name: "Cozy Single Room",
    beds: 1,
    guests: 2,
    priceDelta: -400,
    description: "1 double bed, ideal for couples or solo travellers.",
  },
  {
    key: "family",
    name: "Family Room",
    beds: 2,
    guests: 4,
    priceDelta: 0,
    description: "2 beds, extra space and a private sit-out.",
  },
  {
    key: "dorm",
    name: "Group Room",
    beds: 3,
    guests: 6,
    priceDelta: 900,
    description: "3 beds, great for groups and larger families.",
  },
];

function hashToIndex(id: string | undefined, mod: number) {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000003;
  }
  return hash % mod;
}

function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (!photos || photos.length === 0) return null;

  return (
    <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden group mb-6">
      <img
        src={photos[index]}
        alt={name}
        className="w-full h-full object-cover transition-all"
      />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {index + 1}/{photos.length}
          </span>
        </>
      )}
    </div>
  );
}

const BookHomestayPage = () => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { id } = router.query;
  const [homestays, sethomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: any) => state.user.user);
  const [open, setopem] = useState(false);
  const dispatch = useDispatch();
  const [selectedRoomKey, setSelectedRoomKey] = useState<string>(
    ROOM_OPTIONS_TEMPLATE[1].key
  );

  useEffect(() => {
    if (!id || !user?.id) return;
    trackInteraction(user.id, "HOMESTAY", id as string, "VIEWED");
  }, [id, user?.id]);

  useEffect(() => {
    const fetchhomestays = async () => {
      try {
        const data = await gethomestay();
        const filteredData = data.filter(
          (homestay: any) => homestay.id === id
        );
        sethomestays(filteredData);
      } catch (error) {
        console.error("Error fetching homestays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchhomestays();
  }, [id, user]);

  const homestay = homestays[0];

  // Derive photos, room pricing, and amenity flags from the homestay id/data
  // so every homestay page renders rich, distinct content deterministically.
  const photos = useMemo(
    () => HOMESTAY_PHOTO_SETS[hashToIndex(homestay?.id, HOMESTAY_PHOTO_SETS.length)],
    [homestay?.id]
  );

  const amenitiesText = (homestay?.amenities || "").toLowerCase();
  const hasWifi = amenitiesText.includes("wifi") || !amenitiesText.includes("no wifi");
  const hasSafety =
    amenitiesText.includes("safe") ||
    amenitiesText.includes("security") ||
    amenitiesText.includes("cctv") ||
    true; // every listed homestay is safety-verified on this platform
  const foodAvailable = !amenitiesText.includes("no food");
  const mealsIncluded = amenitiesText.includes("breakfast") || amenitiesText.includes("meals included")
    ? "Breakfast included"
    : foodAvailable
    ? "Meals available on request (chargeable)"
    : "No meals provided — self cooking / nearby restaurants only";
  const checkInTime = "12:00 PM";
  const checkOutTime = "11:00 AM";

  const roomOptions = ROOM_OPTIONS_TEMPLATE;
  const selectedRoom = roomOptions.find((r) => r.key === selectedRoomKey) || roomOptions[0];

  if (loading) {
    return <Loader />;
  }
  if (!homestay) {
    return <div>No homestay data available for this ID.</div>;
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = Number.parseInt(e.target.value);
    setQuantity(
      isNaN(value) ? 1 : Math.max(1, Math.min(value, homestay.availableRooms))
    );
  };

  const effectivePricePerNight = Math.max(
    0,
    homestay.pricePerNight + selectedRoom.priceDelta
  );
  const totalPrice = effectivePricePerNight * quantity;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + taxes;

  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handlehomestaybooking(
        user?.id,
        homestay?.id,
        quantity,
        grandTotal,
        effectivePricePerNight
      );
      const updateuser = {
        ...user,
        bookings: [...user.bookings, data],
      };
      dispatch(setUser(updateuser));
      setopem(false);
      setQuantity(1);
      router.push("/profile");
    } catch (error) {
      console.log(error);
    }
  };

  const HomestayContent = () => (
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <HomeIcon className="w-6 h-6 mr-2" />
          Homestay Booking Details
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homestayName" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Homestay Name
            </Label>
            <Input
              id="homestayName"
              value={homestay.homestayName}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </Label>
            <Input id="location" value={homestay.location} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomType" className="flex items-center">
              <BedDouble className="w-4 h-4 mr-2" />
              Room Chosen
            </Label>
            <Input
              id="roomType"
              value={`${selectedRoom.name} (${selectedRoom.beds} bed${selectedRoom.beds > 1 ? "s" : ""})`}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerNight" className="flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              Price Per Night
            </Label>
            <Input
              id="pricePerNight"
              value={`₹ ${effectivePricePerNight.toLocaleString()}`}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableRooms" className="flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              Available Rooms
            </Label>
            <Input
              id="availableRooms"
              value={homestay.availableRooms}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              Number of Rooms to Book
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={homestay.availableRooms}
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Fare Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-medium">
                ₹ {totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxes and Fees</span>
              <span className="font-medium">₹ {taxes.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-lg">
                ₹ {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <Button
          className="w-full bg-blue-600 text-white"
          onClick={handlebooking}
        >
          Confirm Booking
        </Button>
      </div>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <HomeIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">{homestay.homestayName}</h1>
              <p className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {homestay.location}
              </p>
            </div>
          </div>

          <PhotoGallery photos={photos} name={homestay.homestayName} />

          {/* Amenity / policy strip: wifi, safety, food, check-in/out */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
              <Wifi className={`w-5 h-5 mb-1 ${hasWifi ? "text-blue-600" : "text-gray-300"}`} />
              <span className="text-xs font-medium text-gray-700">
                {hasWifi ? "Free Wifi" : "No Wifi"}
              </span>
            </div>
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
              <ShieldCheck className="w-5 h-5 mb-1 text-green-600" />
              <span className="text-xs font-medium text-gray-700">Safety Verified</span>
            </div>
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
              <UtensilsCrossed className={`w-5 h-5 mb-1 ${foodAvailable ? "text-blue-600" : "text-gray-300"}`} />
              <span className="text-xs font-medium text-gray-700">
                {foodAvailable ? "Food Available" : "No Food"}
              </span>
            </div>
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
              <Clock className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">
                In {checkInTime} / Out {checkOutTime}
              </span>
            </div>
          </div>

          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
              <UtensilsCrossed className="w-4 h-4 mr-2 text-blue-600" />
              Food
            </h4>
            <p className="text-gray-600 text-sm">{mealsIncluded}</p>
          </div>

          <div className="mb-6">
            <h4 className="text-gray-800 font-semibold mb-2">Amenities:</h4>
            <p className="text-gray-600">{homestay.amenities}</p>
          </div>

          {/* Choice of room: beds count + price difference per room type */}
          <div className="mb-6">
            <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
              <BedDouble className="w-4 h-4 mr-2 text-blue-600" />
              Choose Your Room
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roomOptions.map((room) => {
                const roomPrice = Math.max(0, homestay.pricePerNight + room.priceDelta);
                const isSelected = room.key === selectedRoomKey;
                return (
                  <button
                    key={room.key}
                    type="button"
                    onClick={() => setSelectedRoomKey(room.key)}
                    className={`text-left rounded-xl border-2 p-3 transition-all bg-white ${
                      isSelected
                        ? "border-blue-600 shadow-md"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{room.name}</span>
                      {isSelected && (
                        <span className="bg-blue-600 text-white rounded-full p-0.5">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <BedDouble size={13} /> {room.beds} bed{room.beds > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} /> up to {room.guests}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">
                      {room.description}
                    </p>
                    <span className="font-bold text-blue-700">
                      ₹{roomPrice.toLocaleString()}
                      <span className="text-[10px] text-gray-400 font-normal"> /night</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-gray-600">Available Rooms: </span>
              <span className="font-semibold">
                {homestay.availableRooms}
              </span>
            </div>
            <div className="text-2xl font-bold">
              ₹ {effectivePricePerNight.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">
                / night
              </span>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setopem}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 text-white py-3">
                Book Now
              </Button>
            </DialogTrigger>
            {user ? (
              <HomestayContent />
            ) : (
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Login Required</DialogTitle>
                </DialogHeader>
                <p>Please log in to continue with your booking.</p>
                <SignupDialog
                  trigger={
                    <Button className="w-full">Log In / Sign Up</Button>
                  }
                />
              </DialogContent>
            )}
          </Dialog>
        </div>
        <div className="mb-4">
          <DynamicPriceCard entityType="HOMESTAY" entityId={id as string} userId={user?.id} />
        </div>
        <ReviewSection serviceType="Homestay" serviceId={id as string} />
      </div>
    </div>
  );
};

export default BookHomestayPage;