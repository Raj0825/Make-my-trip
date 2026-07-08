import { useRouter } from "next/router";
import {
  Bus as BusIcon,
  Clock,
  Calendar,
  MapPin,
  CreditCard,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getbus, handlebusbooking } from "@/api";
import { useDispatch, useSelector } from "react-redux";
interface Bus {
  id: string;
  busName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
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
import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";

const BookBusPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [open, setopem] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await getbus();
        const filteredData = data.filter((bus: any) => bus.id === id);
        setBuses(filteredData);
      } catch (error) {
        console.error("Error fetching buses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, [id, user]);

  if (loading) {
    return <Loader />;
  }
  if (buses.length === 0) {
    return <div>No bus data available for this ID.</div>;
  }
  const bus = buses[0];

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = Number.parseInt(e.target.value);
    setQuantity(
      isNaN(value) ? 1 : Math.max(1, Math.min(value, bus.availableSeats))
    );
  };

  const totalPrice = bus?.price * quantity;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + taxes;

  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handlebusbooking(
        user?.id,
        bus?.id,
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

  const BookingContent = () => (
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <BusIcon className="w-6 h-6 mr-2" />
          Bus Booking Details
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="busName" className="flex items-center">
              <BusIcon className="w-4 h-4 mr-2" />
              Bus Name
            </Label>
            <Input id="busName" value={bus?.busName} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              From
            </Label>
            <Input id="from" value={bus?.from} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              To
            </Label>
            <Input id="to" value={bus?.to} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departureTime" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Departure Time
            </Label>
            <Input
              id="departureTime"
              value={new Date(bus.departureTime).toLocaleString()}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrivalTime" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Arrival Time
            </Label>
            <Input
              id="arrivalTime"
              value={new Date(bus.arrivalTime).toLocaleString()}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              Number of Tickets
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={bus.availableSeats}
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
        <Button className="w-full bg-blue-600 text-white" onClick={handlebooking}>
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
            <BusIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">{bus.busName}</h1>
              <p className="text-gray-600">
                {bus.from} → {bus.to}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Departure: {formatDate(bus.departureTime)}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Arrival: {formatDate(bus.arrivalTime)}
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-gray-600">Available Seats: </span>
              <span className="font-semibold">{bus.availableSeats}</span>
            </div>
            <div className="text-2xl font-bold">
              ₹ {bus.price.toLocaleString()}
            </div>
          </div>
          <Dialog open={open} onOpenChange={setopem}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 text-white py-3">
                Book Now
              </Button>
            </DialogTrigger>
            {user ? (
              <BookingContent />
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
      </div>
    </div>
  );
};

export default BookBusPage;
