import Link from "next/link";
import React, { useState } from "react";
import {
  User, Phone, Mail, Edit2, Calendar, CreditCard,
  X, Check, LogOut, Plane, Building2, Train, Bus,
  Car, Home, AlertCircle, Clock, CheckCircle2, XCircle,
  IndianRupee, Tag, ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { editprofile, cancelbooking } from "@/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
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

const TYPE_CONFIG: Record<string, { icon: any; bg: string; accent: string; label: string }> = {
  Flight:   { icon: Plane,     bg: "bg-blue-50",   accent: "text-blue-600",   label: "Flight" },
  Hotel:    { icon: Building2, bg: "bg-emerald-50", accent: "text-emerald-600",label: "Hotel" },
  Train:    { icon: Train,     bg: "bg-violet-50",  accent: "text-violet-600", label: "Train" },
  Bus:      { icon: Bus,       bg: "bg-orange-50",  accent: "text-orange-600", label: "Bus" },
  Cab:      { icon: Car,       bg: "bg-amber-50",   accent: "text-amber-600",  label: "Cab" },
  Homestay: { icon: Home,      bg: "bg-pink-50",    accent: "text-pink-600",   label: "Homestay" },
};

const getConfig = (type: string) =>
  TYPE_CONFIG[type] || { icon: CreditCard, bg: "bg-gray-50", accent: "text-gray-600", label: type };

// Refund timeline stepper
const RefundTimeline = ({ status }: { status: string }) => {
  if (!status || status === "NO_REFUND") return null;
  const steps = [
    { key: "PENDING",   label: "Requested",  desc: "Refund initiated" },
    { key: "PROCESSED", label: "Processing", desc: "Verified by team" },
    { key: "COMPLETED", label: "Credited",   desc: "In your account" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Refund Status</p>
      <div className="flex items-start gap-0">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done    ? "bg-green-500 border-green-500 text-white" :
                  active  ? "bg-blue-500 border-blue-500 text-white animate-pulse" :
                            "bg-white border-gray-300 text-gray-400"
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <p className={`text-xs font-semibold mt-1.5 text-center ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400 text-center leading-tight">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mt-3.5 mx-1 rounded ${done ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<"all" | "active" | "cancelled">("all");

  const logout = () => { dispatch(clearUser()); router.push("/"); };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch { return dateString; }
  };

  const handleSave = async () => {
    try {
      const data = await editprofile(user?.id, userData.firstName, userData.lastName, userData.email, userData.phoneNumber);
      dispatch(setUser(data)); setIsEditing(false);
    } catch { setIsEditing(false); }
  };

  const openCancelDialog = (booking: any) => {
    setSelectedBooking(booking); setCancelReason(CANCELLATION_REASONS[0]);
    setCancelError(""); setCancelDialogOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !user?.id) return;
    setCancelLoading(true); setCancelError("");
    try {
      const updatedBooking = await cancelbooking(user.id, selectedBooking.bookingId, cancelReason);
      const updatedBookings = user.bookings.map((b: any) =>
        b.bookingId === selectedBooking.bookingId ? { ...b, ...updatedBooking } : b
      );
      dispatch(setUser({ ...user, bookings: updatedBookings }));
      setCancelDialogOpen(false);
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || "Cancellation failed. Please try again.");
    } finally { setCancelLoading(false); }
  };

  const hoursSinceBooking = (dateStr: string) => {
    try { return Math.abs(new Date().getTime() - new Date(dateStr).getTime()) / 36e5; }
    catch { return 999; }
  };

  const allBookings = user?.bookings || [];
  const filteredBookings =
    activeTab === "active"    ? allBookings.filter((b: any) => !b.cancelled) :
    activeTab === "cancelled" ? allBookings.filter((b: any) => b.cancelled) :
    allBookings;

  const activeCount    = allBookings.filter((b: any) => !b.cancelled).length;
  const cancelledCount = allBookings.filter((b: any) =>  b.cancelled).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-8 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left sidebar */}
          <div className="md:col-span-1 space-y-5">

            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center relative">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
                  {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                </div>
                <h2 className="text-white font-bold text-lg">{user?.firstName} {user?.lastName}</h2>
                <p className="text-blue-200 text-sm mt-0.5">{user?.email}</p>
              </div>

              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-3">
                    {[
                      { key: "firstName", label: "First Name" },
                      { key: "lastName",  label: "Last Name" },
                      { key: "email",     label: "Email", type: "email" },
                      { key: "phoneNumber", label: "Phone", type: "tel" },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
                        <input
                          type={type || "text"}
                          value={(userData as any)[key]}
                          onChange={(e) => setUserData((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 flex items-center justify-center gap-1">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user?.phoneNumber || "Not set"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <button onClick={() => setIsEditing(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                      <button onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
                <p className="text-xs text-gray-500 mt-0.5">Active</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-red-500">{cancelledCount}</p>
                <p className="text-xs text-gray-500 mt-0.5">Cancelled</p>
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Cancellation Policy
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">50% refund</span> if cancelled within 24 hrs of booking</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">No refund</span> after 24 hrs of booking</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3 h-3 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-600">Refunds processed within <span className="font-semibold text-gray-800">7 working days</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Bookings */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 pt-6 pb-0">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Bookings</h2>
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                  {([["all", "All"], ["active", "Active"], ["cancelled", "Cancelled"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No bookings here</p>
                    <p className="text-gray-400 text-sm mt-1">Your {activeTab} bookings will appear here</p>
                  </div>
                ) : (
                  filteredBookings.map((booking: any, index: number) => {
                    const cfg = getConfig(booking.type);
                    const Icon = cfg.icon;
                    const within24 = hoursSinceBooking(booking.date) <= 24;

                    return (
                      <div key={index}
                        className={`rounded-xl border transition-all ${
                          booking.cancelled
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-200 hover:border-blue-200 hover:shadow-md bg-white"
                        }`}>
                        <div className="p-5">
                          {/* Header row */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${cfg.accent}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-gray-800">{booking.type}</h3>
                                  {booking.cancelled ? (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600">Cancelled</span>
                                  ) : (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-600">Active</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{booking.bookingId}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-0.5 justify-end text-gray-800 font-bold">
                                <IndianRupee className="w-4 h-4" />
                                <span>{booking.totalPrice?.toLocaleString("en-IN")}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">Total paid</p>
                            </div>
                          </div>

                          {/* Meta row */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5" />
                              <span>Qty: {booking.quantity}</span>
                            </div>
                          </div>

                          {/* Cancelled state */}
                          {booking.cancelled && (
                            <div className="rounded-xl bg-white border border-gray-200 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Reason:</span>
                                  <span className="text-xs font-semibold text-gray-700">{booking.cancellationReason}</span>
                                </div>
                                {booking.refundAmount > 0 ? (
                                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    <span>{booking.refundAmount?.toLocaleString("en-IN")}</span>
                                    <span className="text-xs font-normal text-gray-400 ml-1">refund</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">No refund</span>
                                )}
                              </div>

                              {booking.cancelledAt && (
                                <p className="text-xs text-gray-400 mb-1">Cancelled: {booking.cancelledAt}</p>
                              )}
                              {booking.expectedRefundDate && booking.refundStatus !== "COMPLETED" && (
                                <p className="text-xs text-gray-400">Expected by: <span className="font-semibold text-gray-600">{formatDate(booking.expectedRefundDate)}</span></p>
                              )}
                              {booking.refundStatus === "COMPLETED" && (
                                <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold mt-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Refund credited to your account
                                </div>
                              )}

                              {/* Track Refund button */}
                              {booking.refundStatus && booking.refundStatus !== "NO_REFUND" && (
                                <Link href={`/refund/${booking.bookingId}`}
                                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                  Track Refund →
                                </Link>
                              )}
                            </div>
                          )}

                          {/* Cancel action */}
                          {!booking.cancelled && (
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div>
                                {within24 ? (
                                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible for 50% refund
                                  </p>
                                ) : (
                                  <p className="text-xs text-orange-500 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> Past refund window
                                  </p>
                                )}
                              </div>
                              <button onClick={() => openCancelDialog(booking)}
                                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-semibold transition-colors">
                                <XCircle className="w-4 h-4" /> Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[460px] bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              Cancel Booking
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 mt-1">
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-semibold text-gray-800">{selectedBooking.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-gray-800 flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />{selectedBooking.totalPrice?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Refund preview */}
              {hoursSinceBooking(selectedBooking.date) <= 24 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-700 text-sm">50% Refund Applicable</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-600">You will receive</p>
                    <div className="flex items-center gap-0.5 text-green-700 font-bold">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {(selectedBooking.totalPrice * 0.5).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <ArrowRight className="w-3 h-3" />
                    within 7 working days
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-orange-700 text-sm">No Refund Applicable</span>
                  </div>
                  <p className="text-xs text-orange-600">The 24-hour cancellation window has passed.</p>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reason for Cancellation
                </Label>
                <select id="reason" value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none bg-white">
                  {CANCELLATION_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {cancelError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{cancelError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button onClick={handleCancelBooking} disabled={cancelLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold">
                  {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
                <Button onClick={() => setCancelDialogOpen(false)} variant="outline"
                  className="flex-1 rounded-xl font-semibold border-gray-200">
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
