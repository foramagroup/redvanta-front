"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Lock, CreditCard, Truck, CheckCircle2, AlertTriangle,
  ShieldCheck, Apple, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeUp } from "@/lib/animations";
import { MODEL_LABELS } from "@/types/shop";

const Checkout = () => {
  const router = useRouter();
  const { items, subtotal, placeOrder, user } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [shipping, setShipping] = useState("standard");
  const [address, setAddress] = useState({
    fullName: user?.companyName || "", address: user?.address || "",
    city: "", state: "", zip: "", country: "United States",
  });
  const [processing, setProcessing] = useState(false);

  const shippingOptions = [
    { method: "standard", labelKey: "checkout.standard", price: 9.99, timeKey: "checkout.standard_time" },
    { method: "express", labelKey: "checkout.express", price: 19.99, timeKey: "checkout.express_time" },
    { method: "international", labelKey: "checkout.international", price: 34.99, timeKey: "checkout.international_time" },
  ];

  const allValid = items.every((i) => !i.design || i.design.status === "validated" || i.design.status === "locked");
  const shippingCost = shippingOptions.find((s) => s.method === shipping)?.price || 9.99;
  const total = subtotal + shippingCost;

  const handlePay = () => {
    if (!allValid) return;
    setProcessing(true);
    setTimeout(() => {
      placeOrder(shipping, address);
      router.push("/confirmation");
    }, 2000);
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible">
          <motion.h1 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
            <span className="text-gradient-red">{t("checkout.title")}</span>
          </motion.h1>
        </motion.div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <motion.div initial="hidden" animate="visible" className="lg:col-span-2 space-y-8">
            {/* Order Summary */}
            <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h3 className="font-display text-lg font-semibold">{t("checkout.order_summary")}</h3>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.productName}</span>
                      <span className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{MODEL_LABELS[item.model]}</Badge>
                      {item.design && (
                        <Badge className={item.design.status === "validated" ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"}>
                          {item.design.status === "validated" ? "✓" : "Draft"}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{t("checkout.qty")}: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6 space-y-4">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Truck size={18} className="text-primary" /> {t("checkout.shipping_address")}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground">{t("checkout.full_name")}</label>
                  <Input value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className="mt-1 bg-background border-border/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground">{t("checkout.address")}</label>
                  <Input value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className="mt-1 bg-background border-border/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.city")}</label>
                  <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="mt-1 bg-background border-border/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.state")}</label>
                  <Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="mt-1 bg-background border-border/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.zip")}</label>
                  <Input value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} className="mt-1 bg-background border-border/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.country")}</label>
                  <Input value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="mt-1 bg-background border-border/50" />
                </div>
              </div>
            </motion.div>

            {/* Shipping Method */}
            <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">{t("checkout.shipping_method")}</h3>
              <div className="space-y-3">
                {shippingOptions.map((s) => (
                  <button
                    key={s.method}
                    onClick={() => setShipping(s.method)}
                    className={`w-full flex items-center justify-between rounded-lg border p-4 transition-all ${shipping === s.method ? "border-primary/50 bg-primary/10" : "border-border/50 hover:border-border"}`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold">{t(s.labelKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(s.timeKey)}</p>
                    </div>
                    <span className="font-semibold">{formatPrice(s.price)}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div variants={fadeUp} custom={4} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <CreditCard size={18} className="text-primary" /> {t("checkout.payment")}
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.card_number")}</label>
                  <Input className="mt-1 bg-background border-border/50" placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">{t("checkout.expiry")}</label>
                    <Input className="mt-1 bg-background border-border/50" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">{t("checkout.cvc")}</label>
                    <Input className="mt-1 bg-background border-border/50" placeholder="123" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="flex items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-sm hover:border-border transition-colors">
                  <Apple size={16} /> Apple Pay
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-sm hover:border-border transition-colors">
                  <Smartphone size={16} /> Google Pay
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck size={14} className="text-green-400" />
                {t("checkout.secured_stripe")}
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <div className="sticky top-28 rounded-xl border border-border/50 bg-gradient-card p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold">{t("checkout.total")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("checkout.subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("checkout.shipping")}</span><span>{formatPrice(shippingCost)}</span></div>
                <div className="border-t border-border/50 pt-2 flex justify-between">
                  <span className="font-semibold">{t("checkout.total")}</span>
                  <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
                </div>
              </div>

              {!allValid && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-400">{t("checkout.designs_warning")}</p>
                </div>
              )}

              <Button
                className="w-full glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!allValid || processing}
                onClick={handlePay}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    {t("checkout.processing")}
                  </span>
                ) : (
                  <><Lock size={16} className="mr-2" /> {t("checkout.pay")} {formatPrice(total)}</>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Lock size={12} /> SSL</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12} /> PCI</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
