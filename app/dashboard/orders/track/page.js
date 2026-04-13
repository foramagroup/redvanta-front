"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Circle,
  Package,
  Truck,
  Printer,
  CreditCard,
  Send,
  MapPin,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { fadeUp } from "@/lib/animations";
import { get } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const STATUS_ICONS = {
  pending: CreditCard,
  paid: CreditCard,
  production: Printer,
  printed: Package,
  shipped: Send,
  delivered: MapPin,
};

const STATUS_BADGES = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  paid: "bg-primary/20 text-primary border-primary/30",
  production: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  printed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

const TrackOrders = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const [searchId, setSearchId] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const requestedOrderRef = searchParams.get("orderNumber") || searchParams.get("id") || "";

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        setLoadingList(true);
        const response = await get("/admin/order-tracking", searchId ? { search: searchId } : {});
        if (cancelled) return;
        const nextOrders = Array.isArray(response?.data) ? response.data : [];
        setOrders(nextOrders);

        if (!nextOrders.length) {
          setSelectedOrder(null);
          return;
        }

        const requested = nextOrders.find(
          (order) =>
            String(order.orderNumber) === String(requestedOrderRef) ||
            String(order.id) === String(requestedOrderRef)
        );
        setSelectedOrder((prev) => requested || prev || nextOrders[0]);
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Track Orders",
            description: error?.message || error?.error || "Unable to load orders.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [requestedOrderRef, searchId]);

  useEffect(() => {
    let cancelled = false;

    const loadDetail = async () => {
      if (!selectedOrder?.orderNumber) return;

      try {
        setLoadingDetail(true);
        const response = await get(`/admin/order-tracking/${selectedOrder.orderNumber}`);
        if (cancelled) return;
        if (response?.data) {
          setSelectedOrder(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Track Orders",
            description: error?.message || error?.error || "Unable to load order details.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedOrder?.orderNumber]);

  const progressPercent = useMemo(() => {
    return selectedOrder?.progressPercent ?? 0;
  }, [selectedOrder?.progressPercent]);

  return (
    <DashboardLayout title="Track Orders" subtitle="Monitor your order progress in real-time">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or tracking number..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="border-border/50 bg-card pl-9"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={fadeUp} custom={1} className="space-y-3">
            <h3 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Active Orders
            </h3>

            {loadingList ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
                <Loader2 size={20} className="mx-auto mb-3 animate-spin" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
                No orders found
              </div>
            ) : (
              orders.map((order) => {
                const isSelected = selectedOrder?.orderNumber === order.orderNumber;
                return (
                  <button
                    key={order.orderNumber}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      isSelected ? "border-primary bg-primary/5" : "border-border/50 bg-card hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                      <Badge className={`text-xs ${STATUS_BADGES[order.status] || STATUS_BADGES.pending}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{order.items?.length || 0} items • {formatPrice(order.displayTotal ?? order.total)}</span>
                      <span>{order.shippingMethod || "—"}</span>
                    </div>
                    {order.trackingNumber && (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{order.trackingNumber}</p>
                    )}
                  </button>
                );
              })
            )}
          </motion.div>

          <motion.div variants={fadeUp} custom={2} className="lg:col-span-2">
            {selectedOrder ? (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold">{selectedOrder.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      Placed {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium text-primary">{progressPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="relative ml-4">
                  <div className="absolute bottom-0 left-0 top-0 w-px bg-border/50" />
                  {(selectedOrder.timeline || []).map((step) => {
                    const StepIcon = STATUS_ICONS[step.status] || Truck;
                    return (
                      <div key={step.status} className="relative pb-8 pl-10 last:pb-0">
                        <div
                          className={`absolute left-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all ${
                            step.isCurrent
                              ? "border-primary bg-primary/20"
                              : step.isComplete
                                ? "border-green-500 bg-green-500/20"
                                : "border-border/50 bg-secondary"
                          }`}
                        >
                          {step.isComplete ? (
                            <CheckCircle2 size={16} className={step.isCurrent ? "text-primary" : "text-green-400"} />
                          ) : (
                            <Circle size={16} className="text-muted-foreground/30" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <StepIcon size={14} className={step.isComplete ? "text-primary" : "text-muted-foreground/50"} />
                              <h4 className={`font-display text-sm font-semibold ${step.isComplete ? "text-foreground" : "text-muted-foreground/50"}`}>
                                {step.label}
                              </h4>
                            </div>
                            {step.isCurrent && (
                              <Badge className="border-primary/30 bg-primary/20 text-xs text-primary">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className={`mt-0.5 text-xs ${step.isComplete ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                            {step.desc}
                          </p>
                          {step.completedAt && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatDate(step.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border/50 bg-secondary/20 p-4">
                    <p className="text-xs text-muted-foreground">Shipping</p>
                    <p className="mt-1 font-medium">
                      {selectedOrder.shippingFullName || "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[selectedOrder.shippingAddress, selectedOrder.shippingCity, selectedOrder.shippingCountry]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-secondary/20 p-4">
                    <p className="text-xs text-muted-foreground">Tracking Number</p>
                    <p className="mt-1 font-mono font-medium text-sm">
                      {selectedOrder.trackingNumber || "—"}
                    </p>
                    {selectedOrder.trackingUrl && (
                      <a
                        href={selectedOrder.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs text-primary hover:underline"
                      >
                        Open tracking link
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-border/50 bg-secondary/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Items</p>
                    {loadingDetail && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
                  </div>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.totalCards} cards
                            {item.hasNfc ? " • NFC" : ""}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>
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
