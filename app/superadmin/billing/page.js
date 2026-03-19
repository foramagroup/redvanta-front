"use client";

import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, AlertTriangle, RefreshCw, Plus, Eye, Pencil, Download, Search, Trash2, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const invoicesData = [
  { id: "INV-2026-0284", account: "Urban Bites NYC", amount: "$499.00", status: "Paid", date: "2026-02-01", dueDate: "2026-02-15", method: "Visa •••• 4242", email: "admin@urbanbites.com", phone: "+1-212-555-0101", currency: "USD", paidAmount: "$499.00", balance: "$0.00", recurring: true, interval: "Monthly", items: [{ service: "Pro Plan", qty: 1, unit: "month", price: 499, tax: 19, total: 593.81 }] },
  { id: "INV-2026-0285", account: "Glow Beauty Co", amount: "$249.00", status: "Paid", date: "2026-02-01", dueDate: "2026-02-15", method: "Mastercard •••• 5555", email: "hello@glowbeauty.com", phone: "+33-1-55-02-02", currency: "EUR", paidAmount: "$249.00", balance: "$0.00", recurring: true, interval: "Monthly", items: [{ service: "Growth Plan", qty: 1, unit: "month", price: 249, tax: 20, total: 298.80 }] },
  { id: "INV-2026-0286", account: "FreshFit Gym", amount: "$129.00", status: "Failed", date: "2026-02-01", dueDate: "2026-02-15", method: "Visa •••• 1234", email: "ops@freshfit.com", phone: "+1-415-555-0303", currency: "USD", paidAmount: "$0.00", balance: "$129.00", recurring: false, interval: "", items: [{ service: "Starter Plan", qty: 1, unit: "month", price: 129, tax: 19, total: 153.51 }] },
  { id: "INV-2026-0287", account: "CloudDine Group", amount: "$999.00", status: "Paid", date: "2026-02-01", dueDate: "2026-02-15", method: "Wire Transfer", email: "tech@clouddine.com", phone: "+44-20-7946-0404", currency: "GBP", paidAmount: "$999.00", balance: "$0.00", recurring: true, interval: "Yearly", items: [{ service: "Agency Plan", qty: 1, unit: "year", price: 999, tax: 20, total: 1198.80 }] },
  { id: "INV-2026-0288", account: "PetPals Clinic", amount: "$249.00", status: "Pending", date: "2026-02-15", dueDate: "2026-03-01", method: "Visa •••• 9876", email: "info@petpals.com", phone: "+34-91-555-0505", currency: "EUR", paidAmount: "$0.00", balance: "$249.00", recurring: true, interval: "Monthly", items: [{ service: "Growth Plan", qty: 1, unit: "month", price: 249, tax: 21, total: 301.29 }] },
  { id: "INV-2026-0289", account: "Metro Auto Care", amount: "$499.00", status: "Overdue", date: "2026-01-15", dueDate: "2026-02-01", method: "Visa •••• 3333", email: "admin@metroauto.com", phone: "+49-30-555-0606", currency: "EUR", paidAmount: "$0.00", balance: "$499.00", recurring: false, interval: "", items: [{ service: "Pro Plan", qty: 1, unit: "month", price: 499, tax: 19, total: 593.81 }] },
  { id: "INV-2026-0290", account: "Urban Bites NYC", amount: "$39.00", status: "Paid", date: "2026-02-05", dueDate: "2026-02-20", method: "Visa •••• 4242", email: "admin@urbanbites.com", phone: "+1-212-555-0101", currency: "USD", paidAmount: "$39.00", balance: "$0.00", recurring: false, interval: "", items: [{ service: "Table Stand", qty: 1, unit: "pcs", price: 39, tax: 19, total: 46.41 }] },
];

const paymentsData = [
  { id: "PAY-001", invoice: "INV-2026-0284", account: "Urban Bites NYC", amount: "$499.00", method: "Visa •••• 4242", date: "2026-02-01", status: "Completed", txId: "txn_abc123" },
  { id: "PAY-002", invoice: "INV-2026-0285", account: "Glow Beauty Co", amount: "$249.00", method: "Mastercard •••• 5555", date: "2026-02-01", status: "Completed", txId: "txn_def456" },
  { id: "PAY-003", invoice: "INV-2026-0287", account: "CloudDine Group", amount: "$999.00", method: "Wire Transfer", date: "2026-02-02", status: "Completed", txId: "txn_ghi789" },
  { id: "PAY-004", invoice: "INV-2026-0290", account: "Urban Bites NYC", amount: "$39.00", method: "Visa •••• 4242", date: "2026-02-05", status: "Completed", txId: "txn_jkl012" },
  { id: "PAY-005", invoice: "INV-2026-0286", account: "FreshFit Gym", amount: "$129.00", method: "Visa •••• 1234", date: "2026-02-01", status: "Failed", txId: "txn_mno345" },
];

const statusColor = {
  Paid: "bg-green-500/10 text-green-500 border-green-500/20",
  Failed: "bg-primary/10 text-primary border-primary/20",
  Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Refunded: "bg-muted text-muted-foreground border-border",
  Overdue: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Draft: "bg-muted text-muted-foreground border-border",
  Sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
  Completed: "bg-green-500/10 text-green-500 border-green-500/20",
};

const plans = ["Starter Plan", "Growth Plan", "Pro Plan", "Agency Plan"];
const addons = ["Premium Table Stand", "QR Sticker Pack (10x)", "Premium Card Upgrade", "Duplicate Card", "NFC + QR Bundle", "API Access", "Advanced Automation", "Extra Location", "White-Label Dashboard", "Priority Support"];

const ITEMS_PER_PAGE = 5;

const BillingRevenue = () => {
  const { t } = useLanguage();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [refundInvoice, setRefundInvoice] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [retryInvoice, setRetryInvoice] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  const [invoiceLines, setInvoiceLines] = useState([{ service: "", description: "", qty: 1, unit: "month", price: 0, discount: 0, taxRate: 19, taxAmount: 0, subtotal: 0, total: 0 }]);
  const [isRecurring, setIsRecurring] = useState(false);

  const addInvoiceLine = () => setInvoiceLines([...invoiceLines, { service: "", description: "", qty: 1, unit: "month", price: 0, discount: 0, taxRate: 19, taxAmount: 0, subtotal: 0, total: 0 }]);
  const removeInvoiceLine = (i) => setInvoiceLines(invoiceLines.filter((_, idx) => idx !== i));
  const updateLine = (i, field, value) => {
    const lines = [...invoiceLines];
    lines[i][field] = value;
    const l = lines[i];
    l.subtotal = l.qty * l.price - l.discount;
    l.taxAmount = l.subtotal * (l.taxRate / 100);
    l.total = l.subtotal + l.taxAmount;
    setInvoiceLines(lines);
  };

  const grandSubtotal = invoiceLines.reduce((s, l) => s + l.subtotal, 0);
  const grandTax = invoiceLines.reduce((s, l) => s + l.taxAmount, 0);
  const grandTotal = invoiceLines.reduce((s, l) => s + l.total, 0);

  const metrics = [
    { labelKey: "sa.bill_total_mrr", value: "$85,420", icon: DollarSign },
    { labelKey: "sa.bill_arr", value: "$1,025,040", icon: TrendingUp },
    { labelKey: "sa.bill_expansion", value: "$12,840", icon: TrendingUp },
    { labelKey: "sa.bill_churn", value: "2.4%", icon: AlertTriangle },
    { labelKey: "sa.bill_failed", value: "7", icon: RefreshCw },
  ];

  const filteredInvoices = invoicesData.filter(inv => {
    const matchSearch = !searchFilter || inv.account.toLowerCase().includes(searchFilter.toLowerCase()) || inv.id.toLowerCase().includes(searchFilter.toLowerCase());
    const matchFrom = !dateFrom || inv.date >= dateFrom;
    const matchTo = !dateTo || inv.date <= dateTo;
    return matchSearch && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPaymentPages = Math.ceil(paymentsData.length / ITEMS_PER_PAGE);
  const paginatedPayments = paymentsData.slice((paymentPage - 1) * ITEMS_PER_PAGE, paymentPage * ITEMS_PER_PAGE);

  const handleExport = () => {
    const headers = ["Invoice,Account,Amount,Status,Date,Due Date,Method"];
    const rows = filteredInvoices.map(i => `${i.id},${i.account},${i.amount},${i.status},${i.date},${i.dueDate},${i.method}`);
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "billing-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t("sa.bill_export"), description: t("sa.bill_csv_success") });
  };

  return (
    <SuperAdminLayout title={t("sa.bill_title")} subtitle={t("sa.bill_subtitle")}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {metrics.map(m => (
          <Card key={m.labelKey} className="bg-card border-border/50">
            <CardContent className="p-4">
              <m.icon size={16} className="text-primary mb-2" />
              <p className="text-xs text-muted-foreground">{t(m.labelKey)}</p>
              <p className="text-xl font-bold font-display mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("sa.bill_search")} className="pl-9 bg-secondary border-border/50" value={searchFilter} onChange={e => { setSearchFilter(e.target.value); setCurrentPage(1); }} />
        </div>
        <Input type="date" className="w-40 bg-secondary border-border/50" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} placeholder={t("sa.bill_from")} />
        <Input type="date" className="w-40 bg-secondary border-border/50" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} placeholder={t("sa.bill_to")} />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList className="bg-secondary border border-border/50 mb-6">
          <TabsTrigger value="invoices">{t("sa.bill_invoices")}</TabsTrigger>
          <TabsTrigger value="payments">{t("sa.bill_all_payments")}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("sa.bill_invoices")}</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setShowCreateInvoice(true); setInvoiceLines([{ service: "", description: "", qty: 1, unit: "month", price: 0, discount: 0, taxRate: 19, taxAmount: 0, subtotal: 0, total: 0 }]); setIsRecurring(false); }}>
                  <Plus size={14} className="mr-2" />{t("sa.bill_create_invoice")}
                </Button>
                <Button size="sm" onClick={() => setShowAddPayment(true)} variant="outline" className="border-border/50">
                  <CreditCard size={14} className="mr-2" />{t("sa.bill_add_payment")}
                </Button>
                <Button size="sm" variant="outline" className="border-border/50" onClick={handleExport}>
                  <Download size={14} className="mr-2" />{t("sa.bill_export")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>{t("sa.bill_invoice")}</TableHead><TableHead>{t("sa.bill_account")}</TableHead><TableHead>{t("sa.bill_amount")}</TableHead>
                    <TableHead>{t("sa.bill_status")}</TableHead><TableHead>{t("sa.bill_date")}</TableHead><TableHead>{t("sa.bill_due")}</TableHead><TableHead>{t("sa.bill_actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map(inv => (
                    <TableRow key={inv.id} className="border-border/50">
                      <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                      <TableCell>{inv.account}</TableCell>
                      <TableCell>{inv.amount}</TableCell>
                      <TableCell><Badge className={statusColor[inv.status]}>{inv.status}</Badge></TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setViewInvoice(inv)}><Eye size={14} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditInvoice(inv)}><Pencil size={14} /></Button>
                          {inv.status === "Failed" && <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" onClick={() => setRetryInvoice(inv)}>{t("sa.bill_retry")}</Button>}
                          {inv.status === "Paid" && <Button size="sm" variant="ghost" onClick={() => setRefundInvoice(inv)}>{t("sa.bill_refund")}</Button>}
                          {(inv.status === "Pending" || inv.status === "Overdue") && <Button size="sm" variant="outline" className="border-border/50" onClick={() => setShowAddPayment(true)}>{t("sa.bill_add_payment")}</Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{t("sa.bill_showing")} {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} {t("sa.bill_of")} {filteredInvoices.length}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={14} /></Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button key={i} size="sm" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)} className="w-8">{i + 1}</Button>
                  ))}
                  <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={14} /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="bg-card border-border/50">
            <CardHeader><CardTitle className="text-base">{t("sa.bill_all_payments")}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>{t("sa.bill_payment_id")}</TableHead><TableHead>{t("sa.bill_invoice")}</TableHead><TableHead>{t("sa.bill_account")}</TableHead>
                    <TableHead>{t("sa.bill_amount")}</TableHead><TableHead>{t("sa.bill_method")}</TableHead><TableHead>{t("sa.bill_date")}</TableHead><TableHead>{t("sa.bill_status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map(p => (
                    <TableRow key={p.id} className="border-border/50">
                      <TableCell className="font-mono text-sm">{p.id}</TableCell>
                      <TableCell className="font-mono text-sm">{p.invoice}</TableCell>
                      <TableCell>{p.account}</TableCell>
                      <TableCell>{p.amount}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell>{p.date}</TableCell>
                      <TableCell><Badge className={statusColor[p.status]}>{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{t("sa.bill_showing")} {((paymentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(paymentPage * ITEMS_PER_PAGE, paymentsData.length)} {t("sa.bill_of")} {paymentsData.length}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={paymentPage === 1} onClick={() => setPaymentPage(p => p - 1)}><ChevronLeft size={14} /></Button>
                  {Array.from({ length: totalPaymentPages }, (_, i) => (
                    <Button key={i} size="sm" variant={paymentPage === i + 1 ? "default" : "outline"} onClick={() => setPaymentPage(i + 1)} className="w-8">{i + 1}</Button>
                  ))}
                  <Button size="sm" variant="outline" disabled={paymentPage === totalPaymentPages} onClick={() => setPaymentPage(p => p + 1)}><ChevronRight size={14} /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
        <DialogContent className="bg-card border-border/50 sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("sa.bill_create_invoice")}</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">{t("sa.bill_invoice_info")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><Label className="text-xs">{t("sa.bill_invoice_number")}</Label><Input defaultValue={`INV-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`} className="mt-1 bg-secondary border-border/50 text-sm" /></div>
                <div><Label className="text-xs">{t("sa.bill_invoice_date")}</Label><Input type="date" defaultValue="2026-03-05" className="mt-1 bg-secondary border-border/50 text-sm" /></div>
                <div><Label className="text-xs">{t("sa.bill_due_date")}</Label><Input type="date" defaultValue="2026-03-20" className="mt-1 bg-secondary border-border/50 text-sm" /></div>
                <div><Label className="text-xs">{t("sa.bill_status")}</Label>
                  <Select defaultValue="draft"><SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="draft">{t("sa.bill_draft")}</SelectItem><SelectItem value="sent">{t("sa.bill_sent")}</SelectItem><SelectItem value="paid">{t("sa.bill_paid")}</SelectItem><SelectItem value="overdue">{t("sa.bill_overdue")}</SelectItem><SelectItem value="cancelled">{t("sa.bill_cancelled")}</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><Label className="text-xs">{t("sa.bill_currency")}</Label>
                  <Select defaultValue="EUR"><SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="EUR">EUR €</SelectItem><SelectItem value="USD">USD $</SelectItem><SelectItem value="GBP">GBP £</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">{t("sa.bill_reference")}</Label><Input className="mt-1 bg-secondary border-border/50 text-sm" placeholder={t("sa.bill_ref_placeholder")} /></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">{t("sa.bill_customer_info")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">{t("sa.bill_customer_name")}</Label><Input className="mt-1 bg-secondary border-border/50 text-sm" placeholder={t("sa.bill_company_placeholder")} /></div>
                <div><Label className="text-xs">{t("sa.bill_email")}</Label><Input type="email" className="mt-1 bg-secondary border-border/50 text-sm" placeholder={t("sa.bill_email_placeholder")} /></div>
                <div><Label className="text-xs">{t("sa.bill_phone")}</Label><Input className="mt-1 bg-secondary border-border/50 text-sm" placeholder="+1-555-000-0000" /></div>
                <div><Label className="text-xs">{t("sa.bill_vat")}</Label><Input className="mt-1 bg-secondary border-border/50 text-sm" placeholder={t("sa.acc_vat_placeholder")} /></div>
              </div>
              <div className="mt-3"><Label className="text-xs">{t("sa.bill_billing_address")}</Label><Textarea className="mt-1 bg-secondary border-border/50 text-sm" rows={2} placeholder={t("sa.bill_address_placeholder")} /></div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">{t("sa.bill_quick_add")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">{t("sa.bill_add_plan")}</Label>
                  <Select onValueChange={(v) => { const prices = { "Starter Plan": 49, "Growth Plan": 149, "Pro Plan": 499, "Agency Plan": 999 }; setInvoiceLines([...invoiceLines, { service: v, description: `${v} - Monthly`, qty: 1, unit: "month", price: prices[v] || 0, discount: 0, taxRate: 19, taxAmount: (prices[v] || 0) * 0.19, subtotal: prices[v] || 0, total: (prices[v] || 0) * 1.19 }]); }}>
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm"><SelectValue placeholder={t("sa.bill_plan_placeholder")} /></SelectTrigger>
                    <SelectContent>{plans.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">{t("sa.bill_add_addon")}</Label>
                  <Select onValueChange={(v) => { const prices = { "Premium Table Stand": 39, "QR Sticker Pack (10x)": 19, "Premium Card Upgrade": 20, "Duplicate Card": 24, "NFC + QR Bundle": 69, "API Access": 99, "Advanced Automation": 149, "Extra Location": 29, "White-Label Dashboard": 199, "Priority Support": 79 }; setInvoiceLines([...invoiceLines, { service: v, description: v, qty: 1, unit: "pcs", price: prices[v] || 0, discount: 0, taxRate: 19, taxAmount: (prices[v] || 0) * 0.19, subtotal: prices[v] || 0, total: (prices[v] || 0) * 1.19 }]); }}>
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm"><SelectValue placeholder={t("sa.bill_addon_placeholder")} /></SelectTrigger>
                    <SelectContent>{addons.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{t("sa.bill_line_items")}</h3>
                <Button size="sm" variant="outline" onClick={addInvoiceLine} className="border-border/50"><Plus size={12} className="mr-1" />{t("sa.bill_add_line")}</Button>
              </div>
              <div className="space-y-3">
                {invoiceLines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/50 rounded-lg border border-border/30">
                    <div className="col-span-3"><Label className="text-xs">{t("sa.bill_service")}</Label><Input value={line.service} onChange={e => updateLine(i, 'service', e.target.value)} className="mt-1 bg-secondary border-border/50 text-xs" /></div>
                    <div className="col-span-2"><Label className="text-xs">{t("sa.bill_description")}</Label><Input value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} className="mt-1 bg-secondary border-border/50 text-xs" /></div>
                    <div className="col-span-1"><Label className="text-xs">{t("sa.bill_qty")}</Label><Input type="number" value={line.qty} onChange={e => updateLine(i, 'qty', +e.target.value)} className="mt-1 bg-secondary border-border/50 text-xs" /></div>
                    <div className="col-span-1"><Label className="text-xs">{t("sa.bill_unit")}</Label>
                      <Select value={line.unit} onValueChange={v => updateLine(i, 'unit', v)}>
                        <SelectTrigger className="mt-1 bg-secondary border-border/50 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="month">{t("sa.bill_month")}</SelectItem><SelectItem value="year">{t("sa.bill_year")}</SelectItem><SelectItem value="pcs">{t("sa.bill_pcs")}</SelectItem><SelectItem value="hour">{t("sa.bill_hour")}</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1"><Label className="text-xs">{t("sa.bill_price")}</Label><Input type="number" value={line.price} onChange={e => updateLine(i, 'price', +e.target.value)} className="mt-1 bg-secondary border-border/50 text-xs" /></div>
                    <div className="col-span-1"><Label className="text-xs">{t("sa.bill_tax")}</Label><Input type="number" value={line.taxRate} onChange={e => updateLine(i, 'taxRate', +e.target.value)} className="mt-1 bg-secondary border-border/50 text-xs" /></div>
                    <div className="col-span-2"><Label className="text-xs">{t("sa.bill_total")}</Label><Input value={`$${line.total.toFixed(2)}`} readOnly className="mt-1 bg-secondary border-border/50 text-xs font-semibold" /></div>
                    <div className="col-span-1 flex justify-end">
                      {invoiceLines.length > 1 && <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => removeInvoiceLine(i)}><Trash2 size={12} /></Button>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 ml-auto max-w-xs space-y-2 p-4 bg-secondary/50 rounded-lg border border-border/30">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("sa.bill_subtotal")}</span><span>${grandSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("sa.bill_tax")}</span><span>${grandTax.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-bold border-t border-border/50 pt-2"><span>{t("sa.bill_grand_total")}</span><span>${grandTotal.toFixed(2)}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">{t("sa.bill_subscription")}</h3>
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                <Label>{t("sa.bill_recurring")}</Label>
              </div>
              {isRecurring && (
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">{t("sa.bill_interval")}</Label>
                    <Select defaultValue="monthly"><SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="monthly">{t("sa.bill_monthly")}</SelectItem><SelectItem value="yearly">{t("sa.bill_yearly")}</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">{t("sa.bill_sub_id")}</Label><Input className="mt-1 bg-secondary border-border/50 text-sm" placeholder={t("sa.bill_sub_placeholder")} /></div>
                  <div><Label className="text-xs">{t("sa.bill_next_billing")}</Label><Input type="date" className="mt-1 bg-secondary border-border/50 text-sm" /></div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">{t("sa.bill_notes")}</Label><Textarea className="mt-1 bg-secondary border-border/50 text-sm" rows={3} placeholder={t("sa.bill_notes_placeholder")} /></div>
              <div><Label className="text-xs">{t("sa.bill_terms")}</Label><Textarea className="mt-1 bg-secondary border-border/50 text-sm" rows={3} placeholder={t("sa.bill_terms_placeholder")} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateInvoice(false)}>{t("sa.acc_cancel")}</Button>
            <Button variant="outline">{t("sa.bill_save_draft")}</Button>
            <Button onClick={() => { setShowCreateInvoice(false); toast({ title: t("sa.bill_create_invoice"), description: t("sa.bill_invoice_created") }); }}>{t("sa.bill_create_send")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editInvoice} onOpenChange={() => setEditInvoice(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("sa.bill_edit_invoice")}</DialogTitle></DialogHeader>
          {editInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">{t("sa.bill_invoice_number")}</Label><Input defaultValue={editInvoice.id} className="mt-1 bg-secondary border-border/50 text-sm" readOnly /></div>
                <div><Label className="text-xs">{t("sa.bill_status")}</Label>
                  <Select defaultValue={editInvoice.status.toLowerCase()}>
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="draft">{t("sa.bill_draft")}</SelectItem><SelectItem value="sent">{t("sa.bill_sent")}</SelectItem><SelectItem value="paid">{t("sa.bill_paid")}</SelectItem><SelectItem value="overdue">{t("sa.bill_overdue")}</SelectItem><SelectItem value="cancelled">{t("sa.bill_cancelled")}</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">{t("sa.bill_account")}</Label><Input defaultValue={editInvoice.account} className="mt-1 bg-secondary border-border/50 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">{t("sa.bill_amount")}</Label><Input defaultValue={editInvoice.amount.replace("$", "")} className="mt-1 bg-secondary border-border/50 text-sm" /></div>
                <div><Label className="text-xs">{t("sa.bill_due_date")}</Label><Input type="date" defaultValue={editInvoice.dueDate} className="mt-1 bg-secondary border-border/50 text-sm" /></div>
              </div>
              <div><Label className="text-xs">{t("sa.bill_notes")}</Label><Textarea className="mt-1 bg-secondary border-border/50 text-sm" rows={3} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditInvoice(null)}>{t("sa.acc_cancel")}</Button><Button onClick={() => { setEditInvoice(null); toast({ title: t("sa.acc_save"), description: t("sa.bill_invoice_updated") }); }}>{t("sa.acc_save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("sa.bill_add_manual")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("sa.bill_select_invoice")}</Label>
              <Select><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.bill_select_invoice")} /></SelectTrigger>
                <SelectContent>{invoicesData.filter(i => i.status !== "Paid").map(i => <SelectItem key={i.id} value={i.id}>{i.id} — {i.account} ({i.amount})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t("sa.bill_account")}</Label>
              <Select><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.bill_select_account")} /></SelectTrigger>
                <SelectContent>{[...new Set(invoicesData.map(i => i.account))].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("sa.bill_amount")} ($)</Label><Input type="number" placeholder="0.00" className="mt-1 bg-secondary border-border/50" /></div>
              <div><Label>{t("sa.bill_payment_method")}</Label>
                <Select><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.bill_method")} /></SelectTrigger>
                  <SelectContent><SelectItem value="card">{t("sa.bill_credit_card")}</SelectItem><SelectItem value="wire">{t("sa.bill_wire_transfer")}</SelectItem><SelectItem value="check">{t("sa.bill_check")}</SelectItem><SelectItem value="other">{t("sa.bill_other")}</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>{t("sa.bill_transaction_id")}</Label><Input className="mt-1 bg-secondary border-border/50" placeholder={t("sa.bill_txn_placeholder")} /></div>
            <div><Label>{t("sa.bill_payment_date")}</Label><Input type="date" className="mt-1 bg-secondary border-border/50" /></div>
            <div><Label>{t("sa.bill_ref_notes")}</Label><Textarea placeholder={t("sa.bill_payment_ref_placeholder")} className="mt-1 bg-secondary border-border/50" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddPayment(false)}>{t("sa.acc_cancel")}</Button><Button onClick={() => { setShowAddPayment(false); toast({ title: t("sa.bill_record"), description: t("sa.bill_payment_added") }); }}>{t("sa.bill_record")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={!!refundInvoice} onOpenChange={() => setRefundInvoice(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.bill_issue_refund")}</DialogTitle></DialogHeader>
          {refundInvoice && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("sa.bill_invoice")}</span><span className="font-mono">{refundInvoice.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("sa.bill_account")}</span><span>{refundInvoice.account}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("sa.bill_amount")}</span><span className="font-medium">{refundInvoice.amount}</span></div>
              </div>
              <div><Label>{t("sa.bill_refund_amount")}</Label><Input defaultValue={refundInvoice.amount.replace("$", "")} className="mt-1 bg-secondary border-border/50" /></div>
              <div><Label>{t("sa.bill_reason")}</Label><Textarea placeholder={t("sa.bill_refund_reason_placeholder")} className="mt-1 bg-secondary border-border/50" /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setRefundInvoice(null)}>{t("sa.acc_cancel")}</Button><Button variant="destructive">{t("sa.bill_confirm_refund")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retry Dialog */}
      <Dialog open={!!retryInvoice} onOpenChange={() => setRetryInvoice(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.bill_retry_payment")}</DialogTitle></DialogHeader>
          {retryInvoice && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("sa.bill_retry_desc")}</p>
              <div className="bg-secondary rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("sa.bill_invoice")}</span><span className="font-mono">{retryInvoice.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("sa.bill_account")}</span><span>{retryInvoice.account}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("sa.bill_amount")}</span><span className="font-medium">{retryInvoice.amount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("sa.bill_method")}</span><span>{retryInvoice.method}</span></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setRetryInvoice(null)}>{t("sa.acc_cancel")}</Button><Button>{t("sa.bill_retry_payment")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Sheet */}
      <Sheet open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <SheetContent className="bg-card border-border/50 sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{t("sa.bill_invoice_details")}</SheetTitle></SheetHeader>
          {viewInvoice && (
            <div className="space-y-4 mt-6">
              {[
                { labelKey: "sa.bill_invoice_id", value: viewInvoice.id },
                { labelKey: "sa.bill_account", value: viewInvoice.account },
                { labelKey: "sa.bill_email", value: viewInvoice.email },
                { labelKey: "sa.bill_amount", value: viewInvoice.amount },
                { labelKey: "sa.bill_paid_amount", value: viewInvoice.paidAmount },
                { labelKey: "sa.bill_balance_due", value: viewInvoice.balance },
                { labelKey: "sa.bill_currency", value: viewInvoice.currency },
                { labelKey: "sa.bill_date", value: viewInvoice.date },
                { labelKey: "sa.bill_due_date", value: viewInvoice.dueDate },
                { labelKey: "sa.bill_method", value: viewInvoice.method },
                { labelKey: "sa.bill_recurring", value: viewInvoice.recurring ? `${t("sa.bill_yes")} (${viewInvoice.interval})` : t("sa.bill_no") },
              ].map(item => (
                <div key={item.labelKey} className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-sm text-muted-foreground">{t(item.labelKey)}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("sa.bill_status")}</span>
                <Badge className={statusColor[viewInvoice.status]}>{viewInvoice.status}</Badge>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">{t("sa.bill_line_items")}</h4>
                {viewInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-border/30">
                    <span>{item.service} × {item.qty}</span>
                    <span className="font-medium">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </SuperAdminLayout>
  );
};

export default BillingRevenue;
