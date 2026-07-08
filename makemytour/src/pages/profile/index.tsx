import React, { useState } from "react";
import {
  User, Phone, Mail, Edit2, Calendar, CreditCard,
  X, Check, LogOut, Plane, Building2, Train, Bus,
  Car, Home, AlertCircle, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { editprofile, cancelbooking } from "@/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const CANCELLATION_REASONS = [
  "Change of plans",
  "Found a better deal",
  "Medical emergency",
  "Work obligation",
  "Weather concerns",
  "Visa/travel document issue",
  "Family emergency",
  "Other",
];

const bookingIcon = (type: string) => {
  const cls = "w-6 h-6";
  switch (type) {
    case "Flight": return <Plane className={cls + " text-blue-600"} />;
    case "Hotel": return <Building2 className={cls + " text-green-600"} />;
    case "Train": return <Train className={cls + " text-purple-600"} />;
    case "Bus": return <Bus className={cls + " text-orange-600"} />;
    case "Cab": return <Car className={cls + " text-yellow-600"} />;
    case "Homestay": return <Home className={cls + " text-pink-600"} />;
    default: return <CreditCard className={cls + " text-gray-600"} />;
  }
};

const iconBg = (type: string) => {
  switch (type) {
    case "Flight": return "bg-blue-100";
    case "Hotel": return "bg-green-100";
    case "Train": return "bg-purple-100";
    case "Bus": return "bg-orange-100";
    case "Cab": return "bg-yellow-100";
    case "Homestay": return "bg-pink-100";
    default: return "bg-gray-100";
  }
};

const RefundBadge = ({ status }: { status: string }) => {
  if (!status || status === "NO_REFUND") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <XCircle className="w-3 h-3" /> No Refund
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Clock className="w-3 h-3" /> Refund Pending
      </span>
    );
  }
  if (status === "PROCESSED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <AlertCircle className="w-3 h-3" /> Refund Processed
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="w-3 h-3" /> Refund Completed
      </span>
    );
  }
  return null;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const logout = () => {
    dispatch(clearUser());
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return dateString; }
  };

  const handleEditFormChange = (field: any, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const data = await editprofile(
        user?.id, userData.firstName, userData.lastName,
        userData.email, userData.phoneNumber
      );
      dispatch(setUser(data));
      setIsEditing(false);
    } catch {
      setIsEditing(false);
    }
  };

  const openCancelDialog = (booking: any) => {
    setSelectedBooking(booking);
    setCancelReason(CANCELLATION_REASONS[0]);
    setCancelError("");
    setCancelDialogOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !user?.id) return;
    setCancelLoading(true);
    setCancelError("");
    try {
      const updatedBooking = await cancelbooking(user.id, selectedBooking.bookingId, cancelReason);
      // Update user in Redux store
      const updatedBookings = user.bookings.map((b: any) =>
        b.bookingId === selectedBooking.bookingId ? { ...b, ...updatedBooking } : b
      );
      dispatch(setUser({ ...user, bookings: updatedBookings }));
      setCancelDialogOpen(false);
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || "Cancellation failed. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const hoursSinceBooking = (dateStr: string) => {
    try {
      const bookingDate = new Date(dateStr);
      const now = new Date();
      return Math.abs(now.getTime() - bookingDate.getTime()) / 36e5;
    } catch { return 999; }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Profile Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Profile</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)}
                    className="text-red-600 flex items-center space-x-1 hover:text-red-700">
                    <Edit2 className="w-4 h-4" /><span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  {["firstName", "lastName", "email", "phoneNumber"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field === "phoneNumber" ? "Phone Number" : field.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type={field === "email" ? "email" : field === "phoneNumber" ? "tel" : "text"}
                        value={(userData as any)[field]}
                        onChange={(e) => handleEditFormChange(field, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  ))}
                  <div className="flex space-x-3">
                    <button onClick={handleSave}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4" /><span>Save</span>
                    </button>
                    <button onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                      <X className="w-4 h-4" /><span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <p>{user?.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <p>{user?.phoneNumber}</p>
                  </div>
                  <button onClick={logout}
                    className="w-full mt-4 flex items-center justify-center space-x-2 text-red-600 hover:text-red-700">
                    <LogOut className="w-4 h-4" /><span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Refund Policy Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Cancellation Policy
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>50% refund</strong> if cancelled within 24 hours of booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span><strong>No refund</strong> if cancelled after 24 hours of booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Refunds are processed within <strong>7 working days</strong></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
              {user?.bookings?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet.</p>
              ) : (
                <div className="space-y-4">
                  {user?.bookings?.map((booking: any, index: number) => (
                    <div key={index}
                      className={`border rounded-lg p-4 transition-shadow ${booking.cancelled ? "bg-gray-50 border-gray-200" : "hover:shadow-md"}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${iconBg(booking.type)}`}>
                            {bookingIcon(booking.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{booking.type}</h3>
                            <p className="text-sm text-gray-500">ID: {booking.bookingId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹ {booking.totalPrice?.toLocaleString("en-IN")}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {booking.cancelled ? (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                Cancelled
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="w-4 h-4" />
                          <span>Qty: {booking.quantity}</span>
                        </div>
                      </div>

                      {/* Cancellation details */}
                      {booking.cancelled && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <RefundBadge status={booking.refundStatus} />
                            {booking.refundAmount > 0 && (
                              <span className="text-sm font-medium text-gray-700">
                                Refund: ₹ {booking.refundAmount?.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            {booking.cancellationReason && (
                              <p>Reason: <span className="font-medium">{booking.cancellationReason}</span></p>
                            )}
                            {booking.cancelledAt && (
                              <p>Cancelled on: <span className="font-medium">{booking.cancelledAt}</span></p>
                            )}
                            {booking.expectedRefundDate && booking.refundStatus !== "COMPLETED" && (
                              <p>Expected refund by: <span className="font-medium">{formatDate(booking.expectedRefundDate)}</span></p>
                            )}
                            {booking.refundStatus === "COMPLETED" && (
                              <p className="text-green-600 font-medium">✓ Refund has been credited to your account</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cancel button */}
                      {!booking.cancelled && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => openCancelDialog(booking)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Cancel Booking
                          </button>
                          {hoursSinceBooking(booking.date) <= 24 && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Eligible for 50% refund (within 24hrs of booking)
                            </p>
                          )}
                          {hoursSinceBooking(booking.date) > 24 && (
                            <p className="text-xs text-orange-500 mt-1">
                              ⚠ No refund applicable (past 24hr window)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Cancel Booking
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-5 mt-2">
              {/* Booking summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                <p><span className="text-gray-500">Type:</span> <span className="font-medium">{selectedBooking.type}</span></p>
                <p><span className="text-gray-500">Booking ID:</span> <span className="font-medium">{selectedBooking.bookingId}</span></p>
                <p><span className="text-gray-500">Amount Paid:</span> <span className="font-medium">₹ {selectedBooking.totalPrice?.toLocaleString("en-IN")}</span></p>
              </div>

              {/* Refund preview */}
              <div className={`rounded-lg p-4 text-sm ${hoursSinceBooking(selectedBooking.date) <= 24 ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
                {hoursSinceBooking(selectedBooking.date) <= 24 ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-green-700">50% Refund Applicable</p>
                      <p className="text-green-600">You will receive ₹ {(selectedBooking.totalPrice * 0.5).toLocaleString("en-IN")} within 7 working days.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-orange-700">No Refund Applicable</p>
                      <p className="text-orange-600">Cancellation window (24hrs) has passed. No refund will be issued.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reason dropdown */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Cancellation</Label>
                <select
                  id="reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {cancelError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{cancelError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCancelBooking}
                  disabled={cancelLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
                <Button
                  onClick={() => setCancelDialogOpen(false)}
                  variant="outline"
                  className="flex-1">
                  Keep Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
