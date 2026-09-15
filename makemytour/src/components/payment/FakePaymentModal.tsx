import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building,
  Wallet,
  QrCode,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", icon: "🟢", handle: "@okaxis" },
  { id: "phonepe", name: "PhonePe", icon: "🟣", handle: "@ybl" },
  { id: "paytm", name: "Paytm UPI", icon: "🔵", handle: "@paytm" },
  { id: "bhim", name: "BHIM UPI", icon: "🟠", handle: "@upi" },
];

const POPULAR_BANKS = [
  { id: "hdfc", name: "HDFC Bank", code: "HDFC" },
  { id: "sbi", name: "State Bank of India", code: "SBI" },
  { id: "icici", name: "ICICI Bank", code: "ICICI" },
  { id: "axis", name: "Axis Bank", code: "AXIS" },
  { id: "kotak", name: "Kotak Mahindra", code: "KOTAK" },
  { id: "pnb", name: "Punjab National Bank", code: "PNB" },
];

const WALLETS = [
  { id: "paytm_w", name: "Paytm Wallet", icon: "🔵", balance: "₹ 1,250" },
  { id: "amazon_w", name: "Amazon Pay", icon: "🟠", balance: "₹ 820" },
  { id: "mobikwik_w", name: "MobiKwik", icon: "🔴", balance: "₹ 500" },
  { id: "simpl", name: "Simpl Pay in 3", icon: "⚡", balance: "Approved limit: ₹ 25,000" },
];

export default function FakePaymentModal({ isOpen, onClose, onSuccess, amount }: Props) {
  const [method, setMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // UPI state
  const [upiMode, setUpiMode] = useState<"app" | "id" | "qr">("app");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");

  // Card state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  // Net banking state
  const [selectedBank, setSelectedBank] = useState("hdfc");

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState("paytm_w");

  const handlePay = () => {
    setError("");

    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 15) {
        setError("Please enter a valid 16-digit card number");
        return;
      }
      if (expiry.length < 5) {
        setError("Please enter a valid expiry date (MM/YY)");
        return;
      }
      if (cvv.length < 3) {
        setError("Please enter a valid CVV (3-4 digits)");
        return;
      }
      if (name.trim().length === 0) {
        setError("Cardholder name is required");
        return;
      }
    } else if (method === "upi") {
      if (upiMode === "id" && (!upiId.includes("@") || upiId.length < 4)) {
        setError("Please enter a valid UPI ID (e.g., name@okaxis)");
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        // Reset inputs
        setCardNumber("");
        setExpiry("");
        setCvv("");
        setName("");
        setUpiId("");
        onSuccess();
        onClose();
      }, 1500);
    }, 1800);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) {
      setExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
    } else {
      setExpiry(val);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isProcessing && !isSuccess) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white text-left">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck size={22} className="text-green-300" /> Payment Options
              </DialogTitle>
              <p className="text-blue-100 text-xs mt-1">Choose your preferred payment method</p>
            </div>
            <div className="text-right bg-white/10 px-4 py-2 rounded-2xl backdrop-blur">
              <span className="text-xs text-blue-200 block">Total Payable</span>
              <span className="text-xl font-extrabold text-white">₹ {amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              ₹ {amount.toLocaleString("en-IN")} has been received. Your booking is confirmed.
            </p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contacting Bank Gateway...</h3>
            <p className="text-gray-500 text-sm">Please do not refresh or press back.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Payment Method Selector Grid */}
            <div className="grid grid-cols-4 gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
              {[
                { id: "upi", label: "UPI / QR", icon: Smartphone },
                { id: "card", label: "Cards", icon: CreditCard },
                { id: "netbanking", label: "NetBanking", icon: Building },
                { id: "wallet", label: "Wallets", icon: Wallet },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = method === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMethod(tab.id as any);
                      setError("");
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    }`}
                  >
                    <Icon size={18} className="mb-1" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: UPI */}
            {method === "upi" && (
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setUpiMode("app")}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                      upiMode === "app" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                    }`}
                  >
                    UPI Apps
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode("id")}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                      upiMode === "id" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                    }`}
                  >
                    Enter UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode("qr")}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                      upiMode === "qr" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                    }`}
                  >
                    Scan QR
                  </button>
                </div>

                {upiMode === "app" && (
                  <div className="grid grid-cols-2 gap-3">
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          selectedUpiApp === app.id
                            ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <span className="text-2xl">{app.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{app.name}</p>
                          <p className="text-xs text-gray-400">Instant approval</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {upiMode === "id" && (
                  <div className="space-y-2">
                    <Label htmlFor="upiIdInput" className="text-xs font-semibold text-gray-700">
                      Enter UPI ID / VPA
                    </Label>
                    <Input
                      id="upiIdInput"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="rounded-xl border-gray-200 py-5"
                    />
                    <div className="flex gap-2 pt-1">
                      {["@okaxis", "@okhdfcbank", "@ybl", "@paytm"].map((suffix) => (
                        <button
                          key={suffix}
                          type="button"
                          onClick={() => {
                            const base = upiId.split("@")[0] || "myuser";
                            setUpiId(base + suffix);
                          }}
                          className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition"
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {upiMode === "qr" && (
                  <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-inner flex items-center justify-center border border-gray-200 mb-2">
                      <QrCode size={110} className="text-gray-800" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">Scan using any UPI App</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CREDIT / DEBIT CARD */}
            {method === "card" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">Card Number</Label>
                  <div className="relative">
                    <Input
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="rounded-xl border-gray-200 py-5 font-mono"
                      maxLength={19}
                    />
                    <div className="absolute right-3 top-3 flex gap-1">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">VISA</span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">MC</span>
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">RuPay</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Expiry Date</Label>
                    <Input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className="rounded-xl border-gray-200 py-5 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">CVV / CVC</Label>
                    <Input
                      type="password"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      className="rounded-xl border-gray-200 py-5 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">Name on Card</Label>
                  <Input
                    placeholder="Enter cardholder name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-gray-200 py-5"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {method === "netbanking" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-medium">Select your bank to proceed with net banking:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {POPULAR_BANKS.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedBank === bank.id
                          ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <Building size={18} className="text-blue-600 shrink-0" />
                      <span className="font-semibold text-xs text-gray-800 truncate">{bank.name}</span>
                    </button>
                  ))}
                </div>
                <div className="pt-1">
                  <Label className="text-xs font-semibold text-gray-700 mb-1 block">Or choose other bank</Label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-gray-700 bg-white outline-none focus:ring-1 focus:ring-blue-600"
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="">-- All Other Indian Banks --</option>
                    <option value="bob">Bank of Baroda</option>
                    <option value="canara">Canara Bank</option>
                    <option value="union">Union Bank of India</option>
                    <option value="indusind">IndusInd Bank</option>
                    <option value="idfc">IDFC First Bank</option>
                    <option value="yes">YES Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 4: WALLETS & PAY LATER */}
            {method === "wallet" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-medium">Pay instantly with digital wallets or Pay Later:</p>
                <div className="space-y-2">
                  {WALLETS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWallet(w.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                        selectedWallet === w.id
                          ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{w.icon}</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{w.name}</p>
                          <p className="text-xs text-gray-400">{w.balance}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        Linked
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Validation error */}
            {error && (
              <div className="flex items-center gap-2 mt-4 text-red-600 bg-red-50 p-3 rounded-xl text-xs font-medium border border-red-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 rounded-2xl text-base font-bold shadow-md hover:shadow-lg transition-all"
              onClick={handlePay}
            >
              Pay ₹ {amount.toLocaleString("en-IN")}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-gray-400">
              <ShieldCheck size={14} className="text-green-600" />
              <span>100% Secure 256-Bit Encrypted Payment</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
