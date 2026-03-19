"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Circle, Package, Truck, Printer, CreditCard, FileCheck, Send, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeUp } from "@/lib/animations";

const statusOrder = ["draft", "validated", "paid", "production", "printed", "shipped", "delivered"];

const OrderTracking = () => {
  const { currentOrder } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const TIMELINE = [
    { status: "draft", labelKey: "tracking.design_created", icon: FileCheck, descKey: "tracking.design_created_desc" },
    { status: "validated", labelKey: "tracking.design_validated", icon: CheckCircle2, descKey: "tracking.design_validated_desc" },
    { status: "paid", labelKey: "tracking.payment_received", icon: CreditCard, descKey: "tracking.payment_received_desc" },
    { status: "production", labelKey: "tracking.in_production", icon: Printer, descKey: "tracking.in_production_desc" },
    { status: "printed", labelKey: "tracking.printed", icon: Package, descKey: "tracking.printed_desc" },
    { status: "shipped", labelKey: "tracking.shipped", icon: Send, descKey: "tracking.shipped_desc" },
    { status: "delivered", labelKey: "tracking.delivered", icon: MapPin, descKey: "tracking.delivered_desc" },
  ];

  if (!currentOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark pt-20">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">{t("tracking.no_order")}</h1>
          <Link href="/product"><Button className="mt-4">{t("confirmation.browse_products")}</Button></Link>
        </div>
      </div>
    );
  }

  const currentIdx = statusOrder.indexOf(currentOrder.status);

  return (
    <div className="min-h-screen bg-gradient-dark pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible" className="mx-auto max-w-2xl">
          <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">{t("tracking.title_1")} <span className="text-gradient-red">{t("tracking.title_2")}</span></h1>
              <p className="mt-2 text-muted-foreground">{t("confirmation.order_number")} {currentOrder.id}</p>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">{currentOrder.status.toUpperCase()}</Badge>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={fadeUp} custom={1} className="mt-12">
            <div className="relative ml-6">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border/50" />
              {TIMELINE.map((step, i) => {
                const isComplete = i <= currentIdx;
                const isCurrent = i === currentIdx;
                const StepIcon = step.icon;
                return (
                  <div key={step.status} className="relative pb-10 pl-10 last:pb-0">
                    <div className={`absolute left-0 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                      isCurrent ? "border-primary bg-primary/20 glow-red-sm" : isComplete ? "border-green-500 bg-green-500/20" : "border-border/50 bg-secondary"
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 size={16} className={isCurrent ? "text-primary" : "text-green-400"} />
                      ) : (
                        <Circle size={16} className="text-muted-foreground/30" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-display text-base font-semibold ${isComplete ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {t(step.labelKey)}
                        </h3>
                        {isCurrent && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">{t("tracking.current")}</Badge>}
                      </div>
                      <p className={`mt-1 text-sm ${isComplete ? "text-muted-foreground" : "text-muted-foreground/30"}`}>{t(step.descKey)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Tracking Number */}
          {currentOrder.trackingNumber && (
            <motion.div variants={fadeUp} custom={2} className="mt-8 rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("tracking.tracking_number")}</p>
                  <p className="font-display font-semibold">{currentOrder.trackingNumber}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Summary */}
          <motion.div variants={fadeUp} custom={3} className="mt-8 rounded-xl border border-border/50 bg-gradient-card p-6">
            <h3 className="font-display text-lg font-semibold">{t("tracking.order_details")}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">{t("tracking.placed")}</p><p className="font-medium">{new Date(currentOrder.createdAt).toLocaleDateString()}</p></div>
              <div><p className="text-muted-foreground">{t("tracking.total")}</p><p className="font-medium">{formatPrice(currentOrder.total)}</p></div>
              <div><p className="text-muted-foreground">{t("tracking.shipping")}</p><p className="font-medium capitalize">{currentOrder.shippingMethod}</p></div>
              <div><p className="text-muted-foreground">{t("tracking.items")}</p><p className="font-medium">{currentOrder.items.length}</p></div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="mt-8 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("tracking.back_home")}</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;
