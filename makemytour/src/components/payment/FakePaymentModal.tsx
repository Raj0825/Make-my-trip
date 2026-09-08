import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

export default function FakePaymentModal({ isOpen, onClose, onSuccess, amount }: Props) {
  const [method, setMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  // UPI details
  const [upiId, setUpiId] = useState("");

  const handlePay = () => {
    setError("");

    // Simple validation
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 15) {
        setError("Please enter a valid card number");
        return;
      }
      if (expiry.length < 5) {
        setError("Please enter a valid expiry date (MM/YY)");
        return;
      }
      if (cvv.length < 3) {
        setError("Please enter a valid CVV");
        return;
      }
      if (name.trim().length === 0) {
        setError("Name on card is required");
        return;
      }
    } else {
      if (!upiId.includes("@")) {
        setError("Please enter a valid UPI ID");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate network delay and payment gateway processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        // Reset form
        setCardNumber(""); setExpiry(""); setCvv(""); setName(""); setUpiId("");
        onSuccess();
      }, 1500);
    }, 2000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format as 0000 0000 0000 0000
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format as MM/YY
    const val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) {
      setExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
    } else {
      setExpiry(val);
    }
  };

  // Do not close if processing
  const handleOpenChange = (open: boolean) => {
    if (!open && !isProcessing && !isSuccess) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Complete Payment</DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
            <p className="text-gray-500 text-center">
              ₹ {amount.toLocaleString()} has been paid. Securing your booking...
            </p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment...</h3>
            <p className="text-gray-500 text-center">
              Please do not close this window or press back.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 flex items-center justify-between">
              <span className="font-medium">Total Payable</span>
              <span className="text-xl font-bold flex items-center">
                ₹ {amount.toLocaleString()}
              </span>
            </div>

            <Tabs defaultValue="card" onValueChange={setMethod}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard size={16} /> Credit/Debit Card
                </TabsTrigger>
                <TabsTrigger value="upi" className="flex items-center gap-2">
                  <Smartphone size={16} /> UPI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input 
                    placeholder="0000 0000 0000 0000" 
                    value={cardNumber} 
                    onChange={handleCardNumberChange} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input 
                      placeholder="MM/YY" 
                      value={expiry} 
                      onChange={handleExpiryChange} 
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input 
                      type="password" 
                      placeholder="•••" 
                      value={cvv} 
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Name on Card</Label>
                  <Input 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="upi" className="space-y-4">
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input 
                    placeholder="username@bank" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  A payment request will be sent to your UPI app. Please approve it to complete the booking.
                </p>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="flex items-center gap-2 mt-4 text-red-600 bg-red-50 p-3 rounded-md text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <Button 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
              onClick={handlePay}
            >
              Pay ₹ {amount.toLocaleString()}
            </Button>
            
            <p className="text-xs text-center text-gray-400 mt-4 flex justify-center items-center gap-1">
              <CheckCircle2 size={12} /> Safe and secure payment
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
