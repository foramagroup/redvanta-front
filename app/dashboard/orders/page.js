"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Eye, Truck, Clock, CheckCircle2, XCircle, ShoppingBag, Filter, Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
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
const mockOrders = [
  {
    id: "ORD-M8K2X1",
    items: [
      { name: "NFC Smart Card", model: "Premium", quantity: 2, unitPrice: 49, type: "product" },
      { name: "QR Sticker Pack", model: "Classic", quantity: 1, unitPrice: 19, type: "product" },
    ],
    subtotal: 117,
    shipping: 9.99,
    total: 126.99,
    status: "delivered",
    trackingNumber: "TRK-2024-XYZ789",
    createdAt: "2024-12-15T10:30:00Z",
    shippingMethod: "standard",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "ORD-P3N7Y4",
    items: [
      { name: "NFC Smart Card", model: "Metal", quantity: 1, unitPrice: 79, type: "product" },
      { name: "Premium Table Stand", model: "Black", quantity: 1, unitPrice: 39, type: "product" },
      { name: "API Access", model: "Monthly", quantity: 1, unitPrice: 79, type: "addon" },
    ],
    subtotal: 197,
    shipping: 19.99,
    total: 216.99,
    status: "shipped",
    trackingNumber: "TRK-2025-ABC123",
    createdAt: "2025-02-20T14:15:00Z",
    shippingMethod: "express",
    paymentMethod: "Mastercard •••• 5555",
  },
  {
    id: "ORD-R9W5T3",
    items: [
      { name: "NFC Smart Card", model: "Transparent", quantity: 3, unitPrice: 59, type: "product" },
    ],
    subtotal: 177,
    shipping: 34.99,
    total: 211.99,
    status: "production",
    trackingNumber: null,
    createdAt: "2025-03-01T09:00:00Z",
    shippingMethod: "international",
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-K1L4M8",
    items: [
      { name: "Duplicate Card", model: "Classic", quantity: 5, unitPrice: 15, type: "product" },
      { name: "Advanced Automation", model: "Monthly", quantity: 1, unitPrice: 49, type: "addon" },
      { name: "Extra Locations", model: "x3", quantity: 3, unitPrice: 29, type: "addon" },
    ],
    subtotal: 211,
    shipping: 9.99,
    total: 220.99,
    status: "paid",
    trackingNumber: null,
    createdAt: "2025-03-05T16:45:00Z",
    shippingMethod: "standard",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "ORD-Q6J2H9",
    items: [
      { name: "NFC + QR Bundle", model: "Premium", quantity: 1, unitPrice: 89, type: "product" },
    ],
    subtotal: 89,
    shipping: 0,
    total: 89,
    status: "cancelled",
    trackingNumber: null,
    createdAt: "2025-01-10T11:20:00Z",
    shippingMethod: "standard",
    paymentMethod: "Visa •••• 4242",
  },
];

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

const MyOrders = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const filtered = mockOrders.filter((order) => {
    if (search && !order.id.toLowerCase().includes(search.toLowerCase()) && !order.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (typeFilter === "products" && !order.items.some(i => i.type === "product")) return false;
    if (typeFilter === "addons" && !order.items.some(i => i.type === "addon")) return false;
    return true;
  });

  const stats = {
    total: mockOrders.length,
    active: mockOrders.filter(o => ["paid", "production", "printed", "shipped"].includes(o.status)).length,
    delivered: mockOrders.filter(o => o.status === "delivered").length,
    totalSpent: mockOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
  };

  return (
    <DashboardLayout title="My Orders" subtitle="View and manage all your orders">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        {/* Stats */}
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Filters */}
        <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by order ID or product..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-card border-border/50">
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
            <SelectTrigger className="w-full sm:w-[160px] bg-card border-border/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="products">Products Only</SelectItem>
              <SelectItem value="addons">Add-Ons Only</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Orders Table */}
        <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Items</TableHead>
                <TableHead className="text-muted-foreground">Total</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No orders found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => {
                  const sc = statusConfig[order.status];
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <TableRow key={order.id} className="border-border/50 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                      <TableCell className="font-mono font-medium text-foreground">{order.id}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                          {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
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
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)} className="text-muted-foreground hover:text-foreground">
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

          {/* Expanded row details */}
          {filtered.map((order) => expandedOrder === order.id && (
            <div key={`exp-${order.id}`} className="border-t border-border/50 bg-secondary/20 px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${item.type === "addon" ? "bg-purple-500/10" : "bg-primary/10"}`}>
                      {item.type === "addon" ? <Package size={14} className="text-purple-400" /> : <ShoppingBag size={14} className="text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.model} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display">Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Placed on</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <Badge className={`${statusConfig[selectedOrder.status].color}`}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${item.type === "addon" ? "bg-purple-500/10" : "bg-primary/10"}`}>
                        {item.type === "addon" ? <Package size={14} className="text-purple-400" /> : <ShoppingBag size={14} className="text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.model} — Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
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
                <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border/50">
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
                    <p className="font-medium font-mono">{selectedOrder.trackingNumber}</p>
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
