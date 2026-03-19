"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, Circle, Package, Truck, Printer, CreditCard, FileCheck, Send, MapPin, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { fadeUp } from "@/lib/animations";

const statusOrder = ["draft", "validated", "paid", "production", "printed", "shipped", "delivered"];

const TIMELINE = [
  { status: "draft", label: "Design Created", icon: FileCheck, desc: "Your card design has been saved" },
  { status: "validated", label: "Design Validated", icon: CheckCircle2, desc: "Design approved and ready for production" },
  { status: "paid", label: "Payment Received", icon: CreditCard, desc: "Your payment has been confirmed" },
  { status: "production", label: "In Production", icon: Printer, desc: "Your cards are being manufactured" },
  { status: "printed", label: "Printed", icon: Package, desc: "Cards have been printed and quality checked" },
  { status: "shipped", label: "Shipped", icon: Send, desc: "Your order is on its way" },
  { status: "delivered", label: "Delivered", icon: MapPin, desc: "Order has been delivered" },
];

const mockTracked = [
  { id: "ORD-P3N7Y4", status: "shipped", trackingNumber: "TRK-2025-ABC123", items: 3, total: 216.99, createdAt: "2025-02-20", shippingMethod: "Express", estimatedDelivery: "2025-03-10" },
  { id: "ORD-R9W5T3", status: "production", trackingNumber: null, items: 3, total: 211.99, createdAt: "2025-03-01", shippingMethod: "International", estimatedDelivery: "2025-03-25" },
  { id: "ORD-K1L4M8", status: "paid", trackingNumber: null, items: 3, total: 220.99, createdAt: "2025-03-05", shippingMethod: "Standard", estimatedDelivery: "2025-03-20" },
];

const TrackOrders = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [searchId, setSearchId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(mockTracked[0]);

  const filteredOrders = searchId
    ? mockTracked.filter(o => o.id.toLowerCase().includes(searchId.toLowerCase()) || o.trackingNumber?.toLowerCase().includes(searchId.toLowerCase()))
    : mockTracked;

  const currentIdx = selectedOrder ? statusOrder.indexOf(selectedOrder.status) : -1;

  return (
    <DashboardLayout title="Track Orders" subtitle="Monitor your order progress in real-time">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        {/* Search */}
        <motion.div variants={fadeUp} custom={0} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by order ID or tracking number..." value={searchId} onChange={(e) => setSearchId(e.target.value)} className="pl-9 bg-card border-border/50" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order list */}
          <motion.div variants={fadeUp} custom={1} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Active Orders</h3>
            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">No orders found</div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      isSelected ? "border-primary bg-primary/5" : "border-border/50 bg-card hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-sm">{order.id}</span>
                      <Badge className={`text-xs ${
                        order.status === "shipped" ? "bg-primary/20 text-primary border-primary/30" :
                        order.status === "production" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                        "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{order.items} items • {formatPrice(order.total)}</span>
                      <span>{order.shippingMethod}</span>
                    </div>
                    {order.trackingNumber && (
                      <p className="mt-1 text-xs font-mono text-muted-foreground">{order.trackingNumber}</p>
                    )}
                  </button>
                );
              })
            )}
          </motion.div>

          {/* Timeline */}
          <motion.div variants={fadeUp} custom={2} className="lg:col-span-2">
            {selectedOrder ? (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-lg font-bold">{selectedOrder.id}</h3>
                    <p className="text-sm text-muted-foreground">Placed {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-medium">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium text-primary">{Math.round(((currentIdx + 1) / statusOrder.length) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((currentIdx + 1) / statusOrder.length) * 100}%` }} />
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative ml-4">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border/50" />
                  {TIMELINE.map((step, i) => {
                    const isComplete = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    const StepIcon = step.icon;
                    return (
                      <div key={step.status} className="relative pb-8 pl-10 last:pb-0">
                        <div className={`absolute left-0 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                          isCurrent ? "border-primary bg-primary/20" : isComplete ? "border-green-500 bg-green-500/20" : "border-border/50 bg-secondary"
                        }`}>
                          {isComplete ? <CheckCircle2 size={16} className={isCurrent ? "text-primary" : "text-green-400"} /> : <Circle size={16} className="text-muted-foreground/30" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className={`font-display text-sm font-semibold ${isComplete ? "text-foreground" : "text-muted-foreground/50"}`}>{step.label}</h4>
                            {isCurrent && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Current</Badge>}
                          </div>
                          <p className={`mt-0.5 text-xs ${isComplete ? "text-muted-foreground" : "text-muted-foreground/30"}`}>{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking info */}
                {selectedOrder.trackingNumber && (
                  <div className="mt-6 rounded-lg border border-border/50 bg-secondary/20 p-4 flex items-center gap-3">
                    <Truck size={18} className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tracking Number</p>
                      <p className="font-mono font-medium text-sm">{selectedOrder.trackingNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 bg-card p-12 text-center text-muted-foreground">
                <Truck size={48} className="mx-auto mb-4 opacity-20" />
                <p>Select an order to view tracking details</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TrackOrders;
