import { useRouter } from "next/router";
import ReviewSection from "@/components/reviews/ReviewSection";
import { HomeIcon, MapPin, CreditCard, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { gethomestay, handlehomestaybooking } from "@/api";
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

const BookHomestayPage = () => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { id } = router.query;
  const [homestays, sethomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: any) => state.user.user);
  const [open, setopem] = useState(false);
  const dispatch = useDispatch();

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

  if (loading) {
    return <Loader />;
  }
  if (homestays.length === 0) {
    return <div>No homestay data available for this ID.</div>;
  }
  const homestay = homestays[0];

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = Number.parseInt(e.target.value);
    setQuantity(
      isNaN(value) ? 1 : Math.max(1, Math.min(value, homestay.availableRooms))
    );
  };

  const totalPrice = homestay?.pricePerNight * quantity;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + taxes;

  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handlehomestaybooking(
        user?.id,
        homestay?.id,
        quantity,
        grandTotal
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
            <Label htmlFor="pricePerNight" className="flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              Price Per Night
            </Label>
            <Input
              id="pricePerNight"
              value={`₹ ${homestay.pricePerNight}`}
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

          <div className="mb-6">
            <h4 className="text-gray-800 font-semibold mb-2">Amenities:</h4>
            <p className="text-gray-600">{homestay.amenities}</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-gray-600">Available Rooms: </span>
              <span className="font-semibold">
                {homestay.availableRooms}
              </span>
            </div>
            <div className="text-2xl font-bold">
              ₹ {homestay.pricePerNight.toLocaleString()}{" "}
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
        <ReviewSection serviceType="Homestay" serviceId={id as string} />
      </div>
    </div>
  );
};

export default BookHomestayPage;
