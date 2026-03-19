import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Lock, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const PaymentFormUI = ({ total, planName, open, onOpenChange }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 2000);
  };

  const reset = () => {
    setSuccess(false);
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="font-display text-xl font-bold">Payment Successful</h3>
            <p className="text-sm text-muted-foreground">
              Your <span className="text-foreground font-medium">{planName}</span> subscription is now active.
            </p>
            <p className="text-xs text-muted-foreground">Next invoice: March 15, 2026</p>
            <Button onClick={reset} className="mt-4 glow-red-hover">Done</Button>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display">
                <CreditCard size={18} className="text-primary" />
                Payment Details
              </DialogTitle>
              <DialogDescription className="text-xs">
                Secure checkout powered by Stripe
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border/30 mb-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Due</p>
                <p className="text-xl font-bold font-display text-primary">${total}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0">{planName}</Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Cardholder Name</Label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Card Number</Label>
                <div className="relative">
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCard(e.target.value))}
                    className="pl-9 bg-secondary border-border/50 font-mono tracking-wider"
                    maxLength={19}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Expiry</Label>
                  <Input
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="bg-secondary border-border/50 font-mono"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">CVC</Label>
                  <Input
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="bg-secondary border-border/50 font-mono"
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full glow-red-hover" disabled={processing}>
                {processing ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                    Processing...
                  </span>
                ) : (
                  `Pay $${total}/month`
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 pt-1">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Lock size={10} /> SSL Encrypted
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Shield size={10} /> PCI Compliant
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                This is a UI preview. Stripe integration will be connected with backend setup.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFormUI;
