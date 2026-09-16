"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModerationPanel from "@/components/reviews/ModerationPanel";
import AdminLogin from "@/components/admin/AdminLogin";
import { isAdminLoggedIn, adminLogout } from "@/api";
import BackButton from "@/components/navigation/BackButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Textarea } from "@/components/ui/textarea";
import FlightList from "@/components/Flights/Flightlist";
import {
  addflight,
  addhotel,
  editflight,
  edithotel,
  deletehotel,
  deleteflight,
  deletetrain,
  deletebus,
  deletecab,
  deletehomestay,
  deletebooking,
  getuserbyemail,
  addtrain,
  edittrain,
  addbus,
  editbus,
  addcab,
  editcab,
  addhomestay,
  edithomestay,
} from "@/api";
import HotelList from "@/components/Hotel/Hotel";
import TrainList from "@/components/Train/Trainlist";
import BusList from "@/components/Bus/Buslist";
import CabList from "@/components/Cab/Cablist";
import HomestayList from "@/components/Homestay/Homestay";
const mockFlights = [
  {
    _id: "1",
    flightName: "AirOne 101",
    from: "New York",
    to: "London",
    departureTime: "2023-07-01T08:00",
    arrivalTime: "2023-07-01T20:00",
    price: 500,
    availableSeats: 150,
  },
  {
    _id: "2",
    flightName: "SkyHigh 202",
    from: "Paris",
    to: "Tokyo",
    departureTime: "2023-07-02T10:00",
    arrivalTime: "2023-07-03T06:00",
    price: 800,
    availableSeats: 200,
  },
  {
    _id: "3",
    flightName: "EagleWings 303",
    from: "Los Angeles",
    to: "Sydney",
    departureTime: "2023-07-03T22:00",
    arrivalTime: "2023-07-05T06:00",
    price: 1200,
    availableSeats: 180,
  },
];

const mockHotels = [
  {
    _id: "1",
    hotelName: "Luxury Palace",
    location: "Paris, France",
    pricePerNight: 300,
    availableRooms: 50,
    amenities: "Wi-Fi, Pool, Spa, Restaurant",
  },
  {
    _id: "2",
    hotelName: "Seaside Resort",
    location: "Bali, Indonesia",
    pricePerNight: 200,
    availableRooms: 100,
    amenities: "Beach Access, Wi-Fi, Restaurant, Water Sports",
  },
  {
    _id: "3",
    hotelName: "Mountain Lodge",
    location: "Aspen, Colorado",
    pricePerNight: 250,
    availableRooms: 30,
    amenities: "Ski-in/Ski-out, Fireplace, Hot Tub, Restaurant",
  },
];
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
  bookings?: any[];
}

function UserSearch() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await getuserbyemail(email);
    setUser(data);
  };

  const handleDeleteUserBooking = async (bookingId: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete booking "${bookingId}"? This will remove it permanently.`);
    if (!confirmDelete) return;

    try {
      setDeletingBookingId(bookingId);
      await deletebooking(bookingId, user?._id || user?.id);
      setUser((prev: any) => ({
        ...prev,
        bookings: (prev.bookings || []).filter((b: any) => b.bookingId !== bookingId),
      }));
    } catch (err: any) {
      console.error("Failed to delete booking:", err);
      alert("Failed to delete booking. Please check that Spring Boot is restarted.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Search user by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      {user && (
        <div className="border p-4 rounded-md space-y-4">
          <div>
            <h3 className="font-bold mb-2">User Details</h3>
            <p>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Phone:</strong> {user.phoneNumber}
            </p>
          </div>

          {user.bookings && user.bookings.length > 0 && (
            <div className="pt-3 border-t">
              <h4 className="font-semibold text-sm mb-3">User Bookings ({user.bookings.length})</h4>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {user.bookings.map((b: any) => (
                  <div key={b.bookingId} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                          {b.type}
                        </span>
                        <span className="text-gray-700 font-semibold">₹{b.totalPrice?.toLocaleString?.("en-IN") ?? b.totalPrice}</span>
                        {b.cancelled && <span className="text-red-600 font-bold">[Cancelled]</span>}
                      </div>
                      <p className="text-gray-500 mt-1 font-mono text-[11px]">Booking ID: {b.bookingId}</p>
                      {b.date && <p className="text-gray-400 text-[10px]">{new Date(b.date).toLocaleDateString()}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUserBooking(b.bookingId)}
                      disabled={deletingBookingId === b.bookingId}
                      className="h-7 px-2.5 text-xs bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingBookingId === b.bookingId ? "Deleting..." : "Delete Booking"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Hotel {
  id?: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}

function AddEditHotel({
  hotel,
  onSaved,
  onDeleted,
  onCancel,
}: {
  hotel: Hotel | null;
  onSaved?: () => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<Hotel>({
    hotelName: "",
    location: "",
    pricePerNight: 0,
    availableRooms: 0,
    amenities: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (hotel) {
      setFormData(hotel);
    } else {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  }, [hotel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!hotel) return;
    const hotelId = hotel.id || (hotel as any)._id;
    if (!hotelId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${formData.hotelName || hotel.hotelName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deletehotel(hotelId);
      onDeleted?.();
    } catch (err: any) {
      console.error("Failed to delete hotel:", err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      if (status === 405 || status === 404) {
        alert(`Delete endpoint returned HTTP ${status}. Please restart your Spring Boot application in IntelliJ so the newly added delete route is loaded.`);
      } else if (err?.code === "ERR_NETWORK") {
        alert("Network Error: Could not reach Spring Boot backend on http://localhost:8080. Please ensure the backend is running.");
      } else {
        alert(`Failed to delete hotel: ${serverMsg || 'Unknown error'}. Please ensure Spring Boot is restarted.`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hotel) {
      await edithotel(
        hotel.id || (hotel as any)._id,
        formData.hotelName,
        formData.location,
        formData.pricePerNight,
        formData.availableRooms,
        formData.amenities
      );
      onSaved?.();
      return;
    }
    await addhotel(
      formData.hotelName,
      formData.location,
      formData.pricePerNight,
      formData.availableRooms,
      formData.amenities
    );
    onSaved?.();
    if (!hotel) {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {hotel ? "Edit Hotel" : "Add New Hotel"}
        </h3>
        {hotel && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Cancel Edit
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor="hotelName">Hotel Name</Label>
        <Input
          id="hotelName"
          name="hotelName"
          value={formData.hotelName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="pricePerNight">Price Per Night</Label>
        <Input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableRooms">Available Rooms</Label>
        <Input
          id="availableRooms"
          name="availableRooms"
          type="number"
          value={formData.availableRooms}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="amenities">Amenities</Label>
        <Textarea
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isDeleting}>
          {hotel ? "Update Hotel" : "Add Hotel"}
        </Button>
        {hotel && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Hotel"}
          </Button>
        )}
      </div>
    </form>
  );
}

interface Flight {
  id?: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  firstClassSeats?: number;
  businessSeats?: number;
  premiumEconomySeats?: number;
  economySeats?: number;
}

function AddEditFlight({
  flight,
  onSaved,
  onDeleted,
  onCancel,
}: {
  flight: Flight | null;
  onSaved?: () => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}) {
  const emptyFlight: Flight = {
    flightName: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
    firstClassSeats: 0,
    businessSeats: 0,
    premiumEconomySeats: 0,
    economySeats: 0,
  };
  const [formData, setFormData] = useState<Flight>(emptyFlight);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (flight) {
      setFormData({
        firstClassSeats: 0,
        businessSeats: 0,
        premiumEconomySeats: 0,
        economySeats: 0,
        ...flight,
      });
    } else {
      setFormData(emptyFlight);
    }
  }, [flight]);

  // Total seats is always the sum of the 4 cabin sections - no separate manual entry,
  // so the two numbers can never drift apart.
  const totalSeats =
    Number(formData.firstClassSeats || 0) +
    Number(formData.businessSeats || 0) +
    Number(formData.premiumEconomySeats || 0) +
    Number(formData.economySeats || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!flight) return;
    const flightId = flight.id || (flight as any)?._id;
    if (!flightId) {
      alert("Cannot delete: flight ID is missing.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete flight "${flight.flightName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteflight(flightId);
      onDeleted?.();
    } catch (err: any) {
      console.error("Failed to delete flight:", err);
      const status = err?.response?.status;
      if (status === 404) {
        alert(
          `Flight ID "${flightId}" was not found on the server, or the backend server was not restarted. Please restart Spring Boot in IntelliJ IDEA.`
        );
      } else if (status === 405) {
        alert(
          "DELETE method not supported yet by running server. Please restart Spring Boot in IntelliJ IDEA to register the new delete endpoint."
        );
      } else {
        alert("Failed to delete flight. Please check your network or restart Spring Boot.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classSeats = {
      firstClassSeats: Number(formData.firstClassSeats || 0),
      businessSeats: Number(formData.businessSeats || 0),
      premiumEconomySeats: Number(formData.premiumEconomySeats || 0),
      economySeats: Number(formData.economySeats || 0),
    };
    if (flight) {
      await editflight(
        flight?.id,
        formData.flightName,
        formData.from,
        formData.to,
        formData.departureTime,
        formData.arrivalTime,
        formData.price,
        totalSeats,
        classSeats
      );
      onSaved?.();
      return;
    }
    await addflight(
      formData.flightName,
      formData.from,
      formData.to,
      formData.departureTime,
      formData.arrivalTime,
      formData.price,
      totalSeats,
      classSeats
    );
    onSaved?.();
    if (!flight) {
      setFormData(emptyFlight);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {flight ? "Edit Flight" : "Add New Flight"}
        </h3>
        {flight && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Cancel Edit
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor="flightName">Flight Name</Label>
        <Input
          id="flightName"
          name="flightName"
          value={formData.flightName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="departureTime">Departure Time</Label>
        <Input
          id="departureTime"
          name="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="arrivalTime">Arrival Time</Label>
        <Input
          id="arrivalTime"
          name="arrivalTime"
          type="datetime-local"
          value={formData.arrivalTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label>Seats per Cabin Class</Label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div>
            <Label htmlFor="economySeats" className="text-xs text-gray-500">Economy</Label>
            <Input
              id="economySeats"
              name="economySeats"
              type="number"
              min="0"
              value={formData.economySeats}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="premiumEconomySeats" className="text-xs text-gray-500">Premium Economy</Label>
            <Input
              id="premiumEconomySeats"
              name="premiumEconomySeats"
              type="number"
              min="0"
              value={formData.premiumEconomySeats}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="businessSeats" className="text-xs text-gray-500">Business</Label>
            <Input
              id="businessSeats"
              name="businessSeats"
              type="number"
              min="0"
              value={formData.businessSeats}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="firstClassSeats" className="text-xs text-gray-500">First Class</Label>
            <Input
              id="firstClassSeats"
              name="firstClassSeats"
              type="number"
              min="0"
              value={formData.firstClassSeats}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Total available seats: <span className="font-semibold text-gray-700">{totalSeats}</span> (calculated automatically)
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isDeleting}>
          {flight ? "Update Flight" : "Add Flight"}
        </Button>
        {flight && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Flight"}
          </Button>
        )}
      </div>
    </form>
  );
}

interface Train {
  id?: string;
  trainName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

function AddEditTrain({
  train,
  onSaved,
  onDeleted,
  onCancel,
}: {
  train: Train | null;
  onSaved?: () => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<Train>({
    trainName: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (train) {
      setFormData(train);
    } else {
      setFormData({
        trainName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  }, [train]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!train) return;
    const trainId = train.id || (train as any)?._id;
    if (!trainId) {
      alert("Cannot delete: train ID is missing.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete train "${train.trainName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deletetrain(trainId);
      onDeleted?.();
    } catch (err: any) {
      console.error("Failed to delete train:", err);
      const status = err?.response?.status;
      if (status === 404) {
        alert(
          `Train ID "${trainId}" was not found on the server, or the backend server was not restarted. Please restart Spring Boot in IntelliJ IDEA.`
        );
      } else if (status === 405) {
        alert(
          "DELETE method not supported yet by running server. Please restart Spring Boot in IntelliJ IDEA to register the new delete endpoint."
        );
      } else {
        alert("Failed to delete train. Please check your network or restart Spring Boot.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (train) {
      await edittrain(
        train?.id,
        formData.trainName,
        formData.from,
        formData.to,
        formData.departureTime,
        formData.arrivalTime,
        formData.price,
        formData.availableSeats
      );
      onSaved?.();
      return;
    }
    await addtrain(
      formData.trainName,
      formData.from,
      formData.to,
      formData.departureTime,
      formData.arrivalTime,
      formData.price,
      formData.availableSeats
    );
    onSaved?.();
    if (!train) {
      setFormData({
        trainName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {train ? "Edit Train" : "Add New Train"}
        </h3>
        {train && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Cancel Edit
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor="trainName">Train Name</Label>
        <Input
          id="trainName"
          name="trainName"
          value={formData.trainName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="departureTime">Departure Time</Label>
        <Input
          id="departureTime"
          name="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="arrivalTime">Arrival Time</Label>
        <Input
          id="arrivalTime"
          name="arrivalTime"
          type="datetime-local"
          value={formData.arrivalTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableSeats">Available Seats</Label>
        <Input
          id="availableSeats"
          name="availableSeats"
          type="number"
          value={formData.availableSeats}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isDeleting}>
          {train ? "Update Train" : "Add Train"}
        </Button>
        {train && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Train"}
          </Button>
        )}
      </div>
    </form>
  );
}

interface Bus {
  id?: string;
  busName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

function AddEditBus({
  bus,
  onSaved,
  onDeleted,
  onCancel,
}: {
  bus: Bus | null;
  onSaved?: () => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<Bus>({
    busName: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (bus) {
      setFormData(bus);
    } else {
      setFormData({
        busName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  }, [bus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!bus) return;
    const busId = bus.id || (bus as any)?._id;
    if (!busId) {
      alert("Cannot delete: bus ID is missing.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete bus "${bus.busName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deletebus(busId);
      onDeleted?.();
    } catch (err: any) {
      console.error("Failed to delete bus:", err);
      const status = err?.response?.status;
      if (status === 404) {
        alert(
          `Bus ID "${busId}" was not found on the server, or the backend server was not restarted. Please restart Spring Boot in IntelliJ IDEA.`
        );
      } else if (status === 405) {
        alert(
          "DELETE method not supported yet by running server. Please restart Spring Boot in IntelliJ IDEA to register the new delete endpoint."
        );
      } else {
        alert("Failed to delete bus. Please check your network or restart Spring Boot.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bus) {
      await editbus(
        bus?.id,
        formData.busName,
        formData.from,
        formData.to,
        formData.departureTime,
        formData.arrivalTime,
        formData.price,
        formData.availableSeats
      );
      onSaved?.();
      return;
    }
    await addbus(
      formData.busName,
      formData.from,
      formData.to,
      formData.departureTime,
      formData.arrivalTime,
      formData.price,
      formData.availableSeats
    );
    onSaved?.();
    if (!bus) {
      setFormData({
        busName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {bus ? "Edit Bus" : "Add New Bus"}
        </h3>
        {bus && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Cancel Edit
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor="busName">Bus Name</Label>
        <Input
          id="busName"
          name="busName"
          value={formData.busName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="departureTime">Departure Time</Label>
        <Input
          id="departureTime"
          name="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="arrivalTime">Arrival Time</Label>
        <Input
          id="arrivalTime"
          name="arrivalTime"
          type="datetime-local"
          value={formData.arrivalTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableSeats">Available Seats</Label>
        <Input
          id="availableSeats"
          name="availableSeats"
          type="number"
          value={formData.availableSeats}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isDeleting}>
          {bus ? "Update Bus" : "Add Bus"}
        </Button>
        {bus && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Bus"}
          </Button>
        )}
      </div>
    </form>
  );
}

interface Cab {
  id?: string;
  cabType: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  distanceKm: number;
  estimatedDuration: string;
}

const EMPTY_CAB_FORM: Cab = {
  cabType: "",
  from: "",
  to: "",
  departureTime: "",
  arrivalTime: "",
  price: 0,
  availableSeats: 0,
  distanceKm: 0,
  estimatedDuration: "",
};

function AddEditCab({
  cab,
  onSaved,
  onDeleted,
  onCancel,
}: {
  cab: Cab | null;
  onSaved?: () => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<Cab>(EMPTY_CAB_FORM);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (cab) {
      setFormData({ ...EMPTY_CAB_FORM, ...cab });
    } else {
      setFormData(EMPTY_CAB_FORM);
    }
  }, [cab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!cab) return;
    const cabId = cab.id || (cab as any)?._id;
    if (!cabId) {
      alert("Cannot delete: cab ID is missing.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete cab "${cab.cabType}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deletecab(cabId);
      onDeleted?.();
    } catch (err: any) {
      console.error("Failed to delete cab:", err);
      const status = err?.response?.status;
      if (status === 404) {
        alert(
          `Cab ID "${cabId}" was not found on the server, or the backend server was not restarted. Please restart Spring Boot in IntelliJ IDEA.`
        );
      } else if (status === 405) {
        alert(
          "DELETE method not supported yet by running server. Please restart Spring Boot in IntelliJ IDEA to register the new delete endpoint."
        );
      } else {
        alert("Failed to delete cab. Please check your network or restart Spring Boot.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cab) {
      await editcab(
        cab?.id,
        formData.cabType,
        formData.from,
        formData.to,
        formData.departureTime,
        formData.arrivalTime,
        formData.price,
        formData.availableSeats,
        formData.distanceKm,
        formData.estimatedDuration
      );
      onSaved?.();
      return;
    }
    await addcab(
      formData.cabType,
      formData.from,
      formData.to,
      formData.departureTime,
      formData.arrivalTime,
      formData.price,
      formData.availableSeats,
      formData.distanceKm,
      formData.estimatedDuration
    );
    onSaved?.();
    if (!cab) {
      setFormData(EMPTY_CAB_FORM);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {cab ? "Edit Cab" : "Add New Cab"}
        </h3>
        {cab && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Cancel Edit
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor="cabType">Cab Type</Label>
        <Input
          id="cabType"
          name="cabType"
          value={formData.cabType}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="departureTime">Departure Time</Label>
        <Input
          id="departureTime"
          name="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="arrivalTime">Arrival Time</Label>
        <Input
          id="arrivalTime"
          name="arrivalTime"
          type="datetime-local"
          value={formData.arrivalTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableSeats">Available Seats</Label>
        <Input
          id="availableSeats"
          name="availableSeats"
          type="number"
          value={formData.availableSeats}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="distanceKm">Distance (km)</Label>
          <Input
            id="distanceKm"
            name="distanceKm"
            type="number"
            step="0.1"
            min="0"
            value={formData.distanceKm}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="estimatedDuration">Estimated Time</Label>
          <Input
            id="estimatedDuration"
            name="estimatedDuration"
            placeholder="e.g. 1h 20m"
            value={formData.estimatedDuration}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isDeleting}>
          {cab ? "Update Cab" : "Add Cab"}
        </Button>
        {cab && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Cab"}
          </Button>
        )}
      </div>
    </form>
  );
}

interface Homestay {
  id?: string;
  homestayName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
  checkInTime: string;
  checkOutTime: string;
}

const HOMESTAY_TIME_OPTIONS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

const EMPTY_HOMESTAY_FORM: Homestay = {
  homestayName: "",
  location: "",
  pricePerNight: 0,
  availableRooms: 0,
  amenities: "",
  checkInTime: "12:00 PM",
  checkOutTime: "11:00 AM",
};

function AddEditHomestay({
  homestay,
  onSaved,
  onDeleted,
  onCancel,
}: {
  homestay: Homestay | null;
  onSaved?: () => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<Homestay>(EMPTY_HOMESTAY_FORM);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (homestay) {
      setFormData({
        ...EMPTY_HOMESTAY_FORM,
        ...homestay,
        checkInTime: homestay.checkInTime || EMPTY_HOMESTAY_FORM.checkInTime,
        checkOutTime: homestay.checkOutTime || EMPTY_HOMESTAY_FORM.checkOutTime,
      });
    } else {
      setFormData(EMPTY_HOMESTAY_FORM);
    }
  }, [homestay]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!homestay) return;
    const homestayId = homestay.id || (homestay as any)?._id;
    if (!homestayId) {
      alert("Cannot delete: homestay ID is missing.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete homestay "${homestay.homestayName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deletehomestay(homestayId);
      onDeleted?.();
    } catch (err: any) {
      console.error("Failed to delete homestay:", err);
      const status = err?.response?.status;
      if (status === 404) {
        alert(
          `Homestay ID "${homestayId}" was not found on the server, or the backend server was not restarted. Please restart Spring Boot in IntelliJ IDEA.`
        );
      } else if (status === 405) {
        alert(
          "DELETE method not supported yet by running server. Please restart Spring Boot in IntelliJ IDEA to register the new delete endpoint."
        );
      } else {
        alert("Failed to delete homestay. Please check your network or restart Spring Boot.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (homestay) {
      await edithomestay(
        homestay.id,
        formData.homestayName,
        formData.location,
        formData.pricePerNight,
        formData.availableRooms,
        formData.amenities,
        formData.checkInTime,
        formData.checkOutTime
      );
      onSaved?.();
      return;
    }
    await addhomestay(
      formData.homestayName,
      formData.location,
      formData.pricePerNight,
      formData.availableRooms,
      formData.amenities,
      formData.checkInTime,
      formData.checkOutTime
    );
    onSaved?.();
    if (!homestay) {
      setFormData(EMPTY_HOMESTAY_FORM);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {homestay ? "Edit Homestay" : "Add New Homestay"}
        </h3>
        {homestay && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Cancel Edit
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor="homestayName">Homestay Name</Label>
        <Input
          id="homestayName"
          name="homestayName"
          value={formData.homestayName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="pricePerNight">Price Per Night</Label>
        <Input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableRooms">Available Rooms</Label>
        <Input
          id="availableRooms"
          name="availableRooms"
          type="number"
          value={formData.availableRooms}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkInTime">Check-in Time</Label>
          <select
            id="checkInTime"
            name="checkInTime"
            value={formData.checkInTime}
            onChange={handleChange}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          >
            {HOMESTAY_TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="checkOutTime">Check-out Time</Label>
          <select
            id="checkOutTime"
            name="checkOutTime"
            value={formData.checkOutTime}
            onChange={handleChange}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          >
            {HOMESTAY_TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="amenities">Amenities</Label>
        <Textarea
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isDeleting}>
          {homestay ? "Update Homestay" : "Add Homestay"}
        </Button>
        {homestay && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Homestay"}
          </Button>
        )}
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedCab, setSelectedCab] = useState(null);
  const [selectedHomestay, setSelectedHomestay] = useState(null);
  const [flightRefresh, setFlightRefresh] = useState(0);
  const [hotelRefresh, setHotelRefresh] = useState(0);
  const [trainRefresh, setTrainRefresh] = useState(0);
  const [busRefresh, setBusRefresh] = useState(0);
  const [cabRefresh, setCabRefresh] = useState(0);
  const [homestayRefresh, setHomestayRefresh] = useState(0);
  const [authed, setAuthed] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    setAuthed(isAdminLoggedIn());
    setCheckedAuth(true);
  }, []);

  if (!checkedAuth) {
    return null;
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  const handleLogout = () => {
    adminLogout();
    setAuthed(false);
  };

  return (
    <div className="container mx-auto p-4 bg-white max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton fallbackUrl="/" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8 text-black">
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="trains">Trains</TabsTrigger>
          <TabsTrigger value="buses">Buses</TabsTrigger>
          <TabsTrigger value="cabs">Cabs</TabsTrigger>
          <TabsTrigger value="homestays">Homestays</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <CardTitle>Manage Flights</CardTitle>
              <CardDescription>
                Add, edit, or remove flights from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FlightList
                  onSelect={setSelectedFlight}
                  refreshKey={flightRefresh}
                  onDeleted={(deletedId: string) => {
                    if (
                      (selectedFlight as any)?.id === deletedId ||
                      (selectedFlight as any)?._id === deletedId
                    ) {
                      setSelectedFlight(null);
                    }
                    setFlightRefresh((k) => k + 1);
                  }}
                />
                <AddEditFlight
                  flight={selectedFlight}
                  onSaved={() => {
                    setFlightRefresh((k) => k + 1);
                    setSelectedFlight(null);
                  }}
                  onDeleted={() => {
                    setFlightRefresh((k) => k + 1);
                    setSelectedFlight(null);
                  }}
                  onCancel={() => setSelectedFlight(null)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Manage Hotels</CardTitle>
              <CardDescription>
                Add, edit, or remove hotels from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <HotelList
                  onSelect={setSelectedHotel}
                  refreshKey={hotelRefresh}
                  onDeleted={(deletedId: string) => {
                    if (
                      (selectedHotel as any)?.id === deletedId ||
                      (selectedHotel as any)?._id === deletedId
                    ) {
                      setSelectedHotel(null);
                    }
                    setHotelRefresh((k) => k + 1);
                  }}
                />
                <AddEditHotel
                  hotel={selectedHotel}
                  onSaved={() => {
                    setHotelRefresh((k) => k + 1);
                    setSelectedHotel(null);
                  }}
                  onDeleted={() => {
                    setHotelRefresh((k) => k + 1);
                    setSelectedHotel(null);
                  }}
                  onCancel={() => setSelectedHotel(null)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trains">
          <Card>
            <CardHeader>
              <CardTitle>Manage Trains</CardTitle>
              <CardDescription>
                Add, edit, or remove trains from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <TrainList
                  onSelect={setSelectedTrain}
                  refreshKey={trainRefresh}
                  onDeleted={(deletedId: string) => {
                    if (
                      (selectedTrain as any)?.id === deletedId ||
                      (selectedTrain as any)?._id === deletedId
                    ) {
                      setSelectedTrain(null);
                    }
                    setTrainRefresh((k) => k + 1);
                  }}
                />
                <AddEditTrain
                  train={selectedTrain}
                  onSaved={() => {
                    setTrainRefresh((k) => k + 1);
                    setSelectedTrain(null);
                  }}
                  onDeleted={() => {
                    setTrainRefresh((k) => k + 1);
                    setSelectedTrain(null);
                  }}
                  onCancel={() => setSelectedTrain(null)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="buses">
          <Card>
            <CardHeader>
              <CardTitle>Manage Buses</CardTitle>
              <CardDescription>
                Add, edit, or remove buses from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <BusList
                  onSelect={setSelectedBus}
                  refreshKey={busRefresh}
                  onDeleted={(deletedId: string) => {
                    if (
                      (selectedBus as any)?.id === deletedId ||
                      (selectedBus as any)?._id === deletedId
                    ) {
                      setSelectedBus(null);
                    }
                    setBusRefresh((k) => k + 1);
                  }}
                />
                <AddEditBus
                  bus={selectedBus}
                  onSaved={() => {
                    setBusRefresh((k) => k + 1);
                    setSelectedBus(null);
                  }}
                  onDeleted={() => {
                    setBusRefresh((k) => k + 1);
                    setSelectedBus(null);
                  }}
                  onCancel={() => setSelectedBus(null)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cabs">
          <Card>
            <CardHeader>
              <CardTitle>Manage Cabs</CardTitle>
              <CardDescription>
                Add, edit, or remove cabs from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <CabList
                  onSelect={setSelectedCab}
                  refreshKey={cabRefresh}
                  onDeleted={(deletedId: string) => {
                    if (
                      (selectedCab as any)?.id === deletedId ||
                      (selectedCab as any)?._id === deletedId
                    ) {
                      setSelectedCab(null);
                    }
                    setCabRefresh((k) => k + 1);
                  }}
                />
                <AddEditCab
                  cab={selectedCab}
                  onSaved={() => {
                    setCabRefresh((k) => k + 1);
                    setSelectedCab(null);
                  }}
                  onDeleted={() => {
                    setCabRefresh((k) => k + 1);
                    setSelectedCab(null);
                  }}
                  onCancel={() => setSelectedCab(null)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="homestays">
          <Card>
            <CardHeader>
              <CardTitle>Manage Homestays</CardTitle>
              <CardDescription>
                Add, edit, or remove homestays from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <HomestayList
                  onSelect={setSelectedHomestay}
                  refreshKey={homestayRefresh}
                  onDeleted={(deletedId: string) => {
                    if (
                      (selectedHomestay as any)?.id === deletedId ||
                      (selectedHomestay as any)?._id === deletedId
                    ) {
                      setSelectedHomestay(null);
                    }
                    setHomestayRefresh((k) => k + 1);
                  }}
                />
                <AddEditHomestay
                  homestay={selectedHomestay}
                  onSaved={() => {
                    setHomestayRefresh((k) => k + 1);
                    setSelectedHomestay(null);
                  }}
                  onDeleted={() => {
                    setHomestayRefresh((k) => k + 1);
                    setSelectedHomestay(null);
                  }}
                  onCancel={() => setSelectedHomestay(null)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Search for users by email.</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Review Moderation</CardTitle>
              <CardDescription>
                Reviews flagged by multiple users appear here for approval or removal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModerationPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  );
}