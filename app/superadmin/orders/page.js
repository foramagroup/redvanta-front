"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Package, Truck, CheckCircle2, XCircle, Clock, ShoppingBag, Users, DollarSign, Filter } from "lucide-react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { fadeUp } from "@/lib/animations";

const mockOrders = [
  { id: "ORD-M8K2X1", customerName: "John Smith", customerEmail: "john@example.com", items: [{ name: "NFC Smart Card (Premium)", quantity: 2, unitPrice: 49 }, { name: "QR Sticker Pack", quantity: 1, unitPrice: 19 }], total: 126.99, status: "delivered", createdAt: "2024-12-15T10:30:00Z", paymentMethod: "Stripe" },
  { id: "ORD-P3N7Y4", customerName: "Sarah Johnson", customerEmail: "sarah@corp.com", items: [{ name: "NFC Smart Card (Metal)", quantity: 1, unitPrice: 79 }, { name: "API Access", quantity: 1, unitPrice: 79 }], total: 216.99, status: "shipped", createdAt: "2025-02-20T14:15:00Z", paymentMethod: "Stripe" },
  { id: "ORD-R9W5T3", customerName: "Mike Chen", customerEmail: "mike@business.io", items: [{ name: "NFC Smart Card (Transparent)", quantity: 3, unitPrice: 59 }], total: 211.99, status: "production", createdAt: "2025-03-01T09:00:00Z", paymentMethod: "PayPal" },
  { id: "ORD-K1L4M8", customerName: "Emily Davis", customerEmail: "emily@startup.co", items: [{ name: "Duplicate Card", quantity: 5, unitPrice: 15 }, { name: "Advanced Automation", quantity: 1, unitPrice: 49 }], total: 220.99, status: "paid", createdAt: "2025-03-05T16:45:00Z", paymentMethod: "Stripe" },
  { id: "ORD-Q6J2H9", customerName: "Alex Turner", customerEmail: "alex@shop.com", items: [{ name: "NFC + QR Bundle", quantity: 1, unitPrice: 89 }], total: 89, status: "cancelled", createdAt: "2025-01-10T11:20:00Z", paymentMethod: "Stripe" },
  { id: "ORD-W4V8N2", customerName: "Lisa Park", customerEmail: "lisa@agency.net", items: [{ name: "White-Label Dashboard", quantity: 1, unitPrice: 199 }, { name: "Priority Support", quantity: 1, unitPrice: 99 }], total: 298, status: "paid", createdAt: "2025-03-07T08:00:00Z", paymentMethod: "Wire Transfer" },
];

const statusConfig = {
  paid: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Paid" },
  production: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "In Production" },
  shipped: { color: "bg-primary/20 text-primary border-primary/30", label: "Shipped" },
  delivered: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Delivered" },
  cancelled: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Cancelled" },
};

const SuperAdminOrders = () => {
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = mockOrders.filter((o) => {
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase()) && !o.customerEmail.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: mockOrders.length,
    revenue: mockOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
    active: mockOrders.filter(o => ["paid", "production", "shipped"].includes(o.status)).length,
    customers: new Set(mockOrders.map(o => o.customerEmail)).size,
  };

  return (
    <SuperAdminLayout title="Orders Management" subtitle="View and manage all customer orders">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: stats.total, icon: ShoppingBag },
            { label: "Revenue", value: formatPrice(stats.revenue), icon: DollarSign },
            { label: "Active Orders", value: stats.active, icon: Package },
            { label: "Customers", value: stats.customers, icon: Users },
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

        <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by order ID, customer name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
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
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Items</TableHead>
                <TableHead className="text-muted-foreground">Total</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id} className="border-border/50">
                  <TableCell className="font-mono font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.items.length} item{order.items.length > 1 ? "s" : ""}</TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Badge className={`${statusConfig[order.status]?.color || "bg-muted"} text-xs`}>
                      {statusConfig[order.status]?.label || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </motion.div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display">Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selectedOrder.customerName}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedOrder.customerEmail}</p></div>
                <div><p className="text-muted-foreground">Payment</p><p className="font-medium">{selectedOrder.paymentMethod}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p></div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between rounded-lg border border-border/50 bg-secondary/20 p-3">
                    <div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div>
                    <p className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border/50">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
              <div className="flex gap-3">
                <Select defaultValue={selectedOrder.status}>
                  <SelectTrigger className="flex-1 bg-secondary/20 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button>Update Status</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default SuperAdminOrders;
