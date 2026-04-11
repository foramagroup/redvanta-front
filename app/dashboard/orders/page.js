"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Eye,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { fadeUp } from "@/lib/animations";
import { get } from "@/lib/api";

const statusConfig = {
  draft: { color: "bg-muted text-muted-foreground", icon: Clock, label: "Draft" },
  validated: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle2, label: "Validated" },
  paid: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: CheckCircle2, label: "Paid" },
  production: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Package, label: "In Production" },
  printed: { color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: Package, label: "Printed" },
  shipped: { color: "bg-primary/20 text-primary border-primary/30", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2, label: "Delivered" },
  cancelled: { color: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle, label: "Cancelled" },
  refunded: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: XCircle, label: "Refunded" },
};

const defaultMeta = { total: 0, page: 1, last_page: 1, limit: 20 };

const MyOrders = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(defaultMeta);
  const [apiStats, setApiStats] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await get("/api/admin/orders", {
          page,
          limit: 20,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search.trim() || undefined,
        });

        if (cancelled) return;

        setOrders(Array.isArray(response?.data) ? response.data : []);
        setMeta(response?.meta || defaultMeta);
        setApiStats(response?.stats || null);
      } catch (err) {
        if (cancelled) return;

        setOrders([]);
        setMeta(defaultMeta);
        setApiStats(null);
        setError(err?.error || err?.message || "Failed to load orders.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter]);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (typeFilter === "products" && !order.items.some((item) => item.type === "product")) return false;
      if (typeFilter === "addons" && !order.items.some((item) => item.type === "addon")) return false;
      return true;
    });
  }, [orders, typeFilter]);

  const stats = {
    total: apiStats?.totalOrders ?? meta.total ?? filtered.length,
    active:
      apiStats?.activeOrders ??
      orders.filter((order) => ["paid", "production", "printed", "shipped"].includes(order.status)).length,
    delivered: apiStats?.deliveredOrders ?? orders.filter((order) => order.status === "delivered").length,
    totalSpent:
      apiStats?.totalRevenue ??
      orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + Number(order.total || 0), 0),
  };

  const handleOpenOrder = async (order) => {
    setSelectedOrder(order);
    setIsLoadingDetails(true);
    setError("");

    try {
      const response = await get(`/api/admin/orders/${encodeURIComponent(order.id)}`);
      if (response?.data) {
        setSelectedOrder(response.data);
      }
    } catch (err) {
      setError(err?.error || err?.message || "Failed to load order details.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <DashboardLayout title="My Orders" subtitle="View and manage all your orders">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: stats.total, icon: ShoppingBag },
            { label: "Active Orders", value: stats.active, icon: Package },
            { label: "Delivered", value: stats.delivered, icon: CheckCircle2 },
            { label: "Total Spent", value: formatPrice(stats.totalSpent), icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card pl-9 border-border/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-card border-border/50 sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="production">In Production</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full bg-card border-border/50 sm:w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="products">Products Only</SelectItem>
              <SelectItem value="addons">Add-Ons Only</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="overflow-hidden rounded-xl border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Items</TableHead>
                <TableHead className="text-muted-foreground">Total</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading orders...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No orders found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => {
                  const sc = statusConfig[order.status] || statusConfig.draft;
                  const isExpanded = expandedOrder === order.id;

                  return (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer border-border/50"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <TableCell className="font-mono font-medium text-foreground">{order.id}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-muted-foreground" />
                          ) : (
                            <ChevronDown size={14} className="text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={`${sc.color} text-xs`}>
                          <sc.icon size={12} className="mr-1" />
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenOrder(order)} className="text-muted-foreground hover:text-foreground">
                            <Eye size={14} className="mr-1" /> View
                          </Button>
                          {order.trackingNumber && (
                            <Link href={`/dashboard/orders/track?id=${order.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                                <Truck size={14} className="mr-1" /> Track
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.last_page}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.last_page || isLoading}
                  onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {filtered.map(
            (order) =>
              expandedOrder === order.id && (
                <div key={`exp-${order.id}`} className="border-t border-border/50 bg-secondary/20 px-6 py-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${item.type === "addon" ? "bg-purple-500/10" : "bg-primary/10"}`}>
                          {item.type === "addon" ? <Package size={14} className="text-purple-400" /> : <ShoppingBag size={14} className="text-primary" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.model} x {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-foreground">{formatPrice(item.totalPrice ?? item.unitPrice * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </motion.div>
      </motion.div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="border-border/50 bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {isLoadingDetails && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Loading order details...</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Placed on</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Badge className={`${(statusConfig[selectedOrder.status] || statusConfig.draft).color}`}>
                  {(statusConfig[selectedOrder.status] || statusConfig.draft).label}
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${item.type === "addon" ? "bg-purple-500/10" : "bg-primary/10"}`}>
                        {item.type === "addon" ? <Package size={14} className="text-purple-400" /> : <ShoppingBag size={14} className="text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.model} - Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.totalPrice ?? item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border/50 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping ({selectedOrder.shippingMethod})</span>
                  <span>{formatPrice(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-2 font-display text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shipping</p>
                  <p className="font-medium capitalize">{selectedOrder.shippingMethod}</p>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Tracking Number</p>
                    <p className="font-mono font-medium">{selectedOrder.trackingNumber}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {selectedOrder.trackingNumber && (
                  <Link href={`/dashboard/orders/track?id=${selectedOrder.id}`} className="flex-1">
                    <Button className="w-full" variant="default">
                      <Truck size={14} className="mr-2" /> Track Order
                    </Button>
                  </Link>
                )}
                {["paid", "production"].includes(selectedOrder.status) && (
                  <Button variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10">
                    <XCircle size={14} className="mr-2" /> Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyOrders;
