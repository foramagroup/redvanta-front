"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Eye,
  Package,
  CheckCircle2,
  ShoppingBag,
  Users,
  DollarSign,
  Loader2,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { fadeUp } from "@/lib/animations";
import api from "@/lib/api";

const statusConfig = {
  pending: { color: "bg-slate-500/20 text-slate-300 border-slate-500/30", label: "Pending" },
  paid: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Paid" },
  production: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "In Production" },
  printed: { color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", label: "Printed" },
  shipped: { color: "bg-primary/20 text-primary border-primary/30", label: "Shipped" },
  delivered: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Delivered" },
  cancelled: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Cancelled" },
  refunded: { color: "bg-rose-500/20 text-rose-400 border-rose-500/30", label: "Refunded" },
};

const statusOptions = ["all", ...Object.keys(statusConfig)];

const SuperAdminOrders = () => {
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0, active: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  const selectedOrderOpen = Boolean(selectedOrderId);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/superadmin/orders", {
        search: search || undefined,
        status: statusFilter,
        limit: 100,
      });

      setOrders(response?.data ?? []);
      setStats(response?.stats ?? { total: 0, revenue: 0, active: 0, customers: 0 });
    } catch (requestError) {
      setOrders([]);
      setStats({ total: 0, revenue: 0, active: 0, customers: 0 });
      setError(requestError?.error || requestError?.message || "Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, [search, statusFilter]);

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      setStatusDraft("");
      return;
    }

    const fetchOrderDetail = async () => {
      setDetailLoading(true);

      try {
        const response = await api.get(`/api/superadmin/orders/${selectedOrderId}`);
        const order = response?.data ?? null;
        setSelectedOrder(order);
        setStatusDraft(order?.status ?? "");
      } catch (requestError) {
        setSelectedOrder(null);
        setError(requestError?.error || requestError?.message || "Impossible de charger le detail de la commande.");
      } finally {
        setDetailLoading(false);
      }
    };

    void fetchOrderDetail();
  }, [selectedOrderId]);

  const summaryStats = useMemo(
    () => [
      { label: "Total Orders", value: stats.total, icon: ShoppingBag },
      { label: "Revenue", value: formatPrice(stats.revenue || 0), icon: DollarSign },
      { label: "Active Orders", value: stats.active, icon: Package },
      { label: "Customers", value: stats.customers, icon: Users },
    ],
    [formatPrice, stats]
  );

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !statusDraft || statusDraft === selectedOrder.status) {
      return;
    }

    setStatusSaving(true);
    setError(null);

    try {
      await api.patch(`/api/superadmin/orders/${selectedOrder.id}/status`, {
        status: statusDraft,
      });

      await fetchOrders();

      const detailResponse = await api.get(`/api/superadmin/orders/${selectedOrder.id}`);
      const updatedOrder = detailResponse?.data ?? null;
      setSelectedOrder(updatedOrder);
      setStatusDraft(updatedOrder?.status ?? statusDraft);
    } catch (requestError) {
      setError(requestError?.error || requestError?.message || "Impossible de mettre a jour le statut.");
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <SuperAdminLayout title="Orders Management" subtitle="View and manage all customer orders">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryStats.map((stat) => (
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
              placeholder="Search by order ID, customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border/50 bg-card pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full border-border/50 bg-card sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "all" ? "All Statuses" : statusConfig[status]?.label || status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {error && (
          <motion.div variants={fadeUp} custom={2} className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        <motion.div variants={fadeUp} custom={3} className="overflow-hidden rounded-xl border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Items</TableHead>
                <TableHead className="text-muted-foreground">Total</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading orders...
                    </span>
                  </TableCell>
                </TableRow>
              ) : !orders.length ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="border-border/50">
                    <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{order.customer?.name || "-"}</p>
                        <p className="text-xs text-muted-foreground">{order.customer?.email || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.items?.length || 0} item{(order.items?.length || 0) > 1 ? "s" : ""}</TableCell>
                    <TableCell className="font-medium">{formatPrice(order.displayTotal ?? order.total ?? 0)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig[order.status]?.color || "bg-muted"} text-xs`}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(order.id)}>
                        <Eye size={14} className="mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      </motion.div>

      <Dialog open={selectedOrderOpen} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="border-border/50 bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              Order {selectedOrder?.orderNumber || (detailLoading ? "..." : "")}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Loading order detail...
              </span>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.customer?.email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedOrder.company?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shipping</p>
                  <p className="font-medium">{selectedOrder.shippingMethod || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tracking</p>
                  <p className="font-medium">{selectedOrder.trackingNumber || "-"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</h4>
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between rounded-lg border border-border/50 bg-secondary/20 p-3">
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.totalCards || 0}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.totalPrice || 0)}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={`mt-2 ${statusConfig[selectedOrder.status]?.color || "bg-muted"} text-xs`}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                </div>
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                  <p className="text-muted-foreground">Total</p>
                  <p className="mt-2 font-display text-lg font-bold">
                    {formatPrice(selectedOrder.displayTotal ?? selectedOrder.total ?? 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-secondary/20 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <CreditCard size={14} className="text-primary" />
                  Update status
                </p>
                <div className="flex gap-3">
                  <Select value={statusDraft} onValueChange={setStatusDraft}>
                    <SelectTrigger className="flex-1 border-border/50 bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleUpdateStatus} disabled={statusSaving || !statusDraft || statusDraft === selectedOrder.status}>
                    {statusSaving ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Update Status"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Order detail unavailable.</div>
          )}
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default SuperAdminOrders;
