"use client";

import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Download,
  Search,
  Trash2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const ITEMS_PER_PAGE = 5;

const statusColor = {
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  refunded: "bg-muted text-muted-foreground border-border",
  overdue: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-muted text-muted-foreground border-border",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
};

const planCatalog = {
  "Starter Plan": 49,
  "Growth Plan": 149,
  "Pro Plan": 499,
  "Agency Plan": 999,
};

const addonCatalog = {
  "Premium Table Stand": 39,
  "QR Sticker Pack (10x)": 19,
  "Premium Card Upgrade": 20,
  "Duplicate Card": 24,
  "NFC + QR Bundle": 69,
  "API Access": 99,
  "Advanced Automation": 149,
  "Extra Location": 29,
  "White-Label Dashboard": 199,
  "Priority Support": 79,
};

const plans = Object.keys(planCatalog);
const addons = Object.keys(addonCatalog);

const defaultInvoiceLine = () => ({
  service: "",
  description: "",
  qty: 1,
  unit: "month",
  price: 0,
  discount: 0,
  taxRate: 19,
  taxAmount: 0,
  subtotal: 0,
  total: 0,
});

const createEmptyInvoiceForm = () => ({
  companyId: "",
  userId: "",
  status: "draft",
  currency: "EUR",
  invoiceDate: today(),
  dueDate: "",
  reference: "",
  billingName: "",
  billingEmail: "",
  billingPhone: "",
  billingVat: "",
  billingAddress: "",
  notes: "",
  terms: "",
  recurringInterval: "monthly",
  nextBillingDate: "",
});

const createEmptyEditForm = () => ({
  status: "draft",
  dueDate: "",
  notes: "",
  terms: "",
  billingVat: "",
  reference: "",
});

const createEmptyPaymentForm = () => ({
  invoiceId: "",
  amount: "",
  method: "wire",
  transactionId: "",
  paymentDate: today(),
  notes: "",
});

const createEmptyRefundForm = () => ({
  amount: "",
  reason: "",
});

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "-";
  }
}

function formatMoney(amount, currency = "EUR") {
  const numericAmount = Number(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount.toFixed(2)}`;
  }
}

function capitalize(value) {
  if (!value) return "";
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function getStatusLabel(t, status) {
  const normalized = String(status || "").toLowerCase();
  const keyMap = {
    paid: "sa.bill_paid",
    failed: "sa.bill_failed",
    pending: "sa.bill_pending",
    sent: "sa.bill_sent",
    refunded: "sa.bill_refunded",
    overdue: "sa.bill_overdue",
    draft: "sa.bill_draft",
    cancelled: "sa.bill_cancelled",
    completed: "sa.bill_completed",
  };
  return t(keyMap[normalized] || "sa.bill_draft");
}

function getErrorMessage(payload, fallback) {
  return payload?.error || payload?.message || fallback;
}

function normalizeCompany(company) {
  const owner = company?.members?.find((member) => member.isOwner)?.user;
  const admin = company?.admin || owner || company?.members?.[0]?.user || null;

  return {
    id: String(company.id),
    rawId: company.id,
    name: company.name || "-",
    adminId: admin?.id ? String(admin.id) : "",
    email: company.email || admin?.email || "",
    phone: company.phone || "",
    address: company.address || "",
    vatNumber: company.vatNumber || "",
  };
}

function normalizeInvoice(invoice, companyMap) {
  const companyName =
    invoice.company?.name ||
    companyMap.get(String(invoice.companyId))?.name ||
    "-";
  const currency = invoice.currency || "EUR";
  const amountValue = Number(invoice.displayTotal ?? invoice.total ?? 0);
  const paidAmountValue = Number(invoice.paidAmount ?? 0);
  const balanceValue = Number(
    invoice.balanceDue ?? Math.max(amountValue - paidAmountValue, 0)
  );
  const latestMethod =
    invoice.lastPaymentMethod || invoice.paymentMethod || "-";

  return {
    rawId: invoice.id,
    id: invoice.invoiceNumber || `INV-${invoice.id}`,
    account: companyName,
    amount: formatMoney(amountValue, currency),
    amountValue,
    status: String(invoice.status || "draft").toLowerCase(),
    date: formatDate(invoice.invoiceDate || invoice.createdAt),
    dueDate: formatDate(invoice.dueDate),
    method: latestMethod,
    email: invoice.billing?.email || "-",
    phone: invoice.billing?.phone || "-",
    currency,
    paidAmount: formatMoney(paidAmountValue, currency),
    paidAmountValue,
    balance: formatMoney(balanceValue, currency),
    balanceValue,
    recurring: Boolean(invoice.isRecurring),
    interval: invoice.recurringInterval
      ? capitalize(invoice.recurringInterval)
      : "",
    items: (invoice.items || []).map((item) => ({
      service: item.service,
      description: item.description || "",
      qty: Number(item.quantity ?? item.qty ?? 0),
      unit: item.unit || "pcs",
      price: Number(item.unitPrice ?? item.price ?? 0),
      taxRate: Number(item.taxRate ?? 0),
      total: Number(item.total ?? 0),
    })),
    notes: invoice.notes || "",
    terms: invoice.terms || "",
    reference: invoice.reference || "",
    billingVat: invoice.billing?.vat || "",
    billingAddress: invoice.billing?.address || "",
    billingName: invoice.billing?.name || companyName,
    paymentMethod: invoice.paymentMethod || "",
  };
}

function normalizePayment(payment) {
  return {
    rawId: payment.rawId ?? payment.id,
    id: payment.id,
    invoice: payment.invoiceNumber || "-",
    account: payment.account || "-",
    amount: payment.amount || formatMoney(payment.amountRaw, payment.currency),
    amountValue: Number(payment.amountRaw || 0),
    method: payment.method || "-",
    date: payment.date || "-",
    status: String(payment.status || "").toLowerCase(),
    txId: payment.txId || "-",
  };
}

const BillingRevenue = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);
  const [invoiceMeta, setInvoiceMeta] = useState({
    total: 0,
    page: 1,
    last_page: 1,
  });
  const [paymentMeta, setPaymentMeta] = useState({
    total: 0,
    page: 1,
    last_page: 1,
  });
  const [bootLoading, setBootLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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
  const [invoiceLines, setInvoiceLines] = useState([defaultInvoiceLine()]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [createForm, setCreateForm] = useState(createEmptyInvoiceForm());
  const [editForm, setEditForm] = useState(createEmptyEditForm());
  const [paymentForm, setPaymentForm] = useState(createEmptyPaymentForm());
  const [refundForm, setRefundForm] = useState(createEmptyRefundForm());

  const companyMap = useMemo(
    () => new Map(companies.map((company) => [String(company.rawId), company])),
    [companies]
  );

  const invoices = useMemo(
    () => invoiceRows.map((invoice) => normalizeInvoice(invoice, companyMap)),
    [invoiceRows, companyMap]
  );

  const payments = useMemo(
    () => paymentRows.map(normalizePayment),
    [paymentRows]
  );

  const availableInvoicesForPayment = useMemo(
    () =>
      invoices.filter(
        (invoice) => !["paid", "refunded"].includes(invoice.status)
      ),
    [invoices]
  );

  const metrics = [
    {
      labelKey: "sa.bill_total_mrr",
      value: stats?.mrr ?? "-",
      icon: DollarSign,
    },
    { labelKey: "sa.bill_arr", value: stats?.arr ?? "-", icon: TrendingUp },
    {
      labelKey: "sa.bill_expansion",
      value: stats?.expansion ?? "-",
      icon: TrendingUp,
    },
    {
      labelKey: "sa.bill_churn",
      value: stats?.churnRate ?? "-",
      icon: AlertTriangle,
    },
    {
      labelKey: "sa.bill_failed",
      value: stats?.failedCount ?? "-",
      icon: RefreshCw,
    },
  ];

  const grandSubtotal = invoiceLines.reduce(
    (sum, line) => sum + Number(line.subtotal || 0),
    0
  );
  const grandTax = invoiceLines.reduce(
    (sum, line) => sum + Number(line.taxAmount || 0),
    0
  );
  const grandTotal = invoiceLines.reduce(
    (sum, line) => sum + Number(line.total || 0),
    0
  );

  const loadBootstrap = async () => {
    setBootLoading(true);
    setError("");

    try {
      const [statsRes, companiesRes] = await Promise.all([
        fetch(`${apiBase}/superadmin/billing/stats`, {
          credentials: "include",
        }),
        fetch(`${apiBase}/superadmin/companies?limit=100`, {
          credentials: "include",
        }),
      ]);

      const statsPayload = await statsRes.json().catch(() => ({}));
      const companiesPayload = await companiesRes.json().catch(() => ({}));

      if (!statsRes.ok) {
        throw new Error(
          getErrorMessage(statsPayload, "Failed to load billing stats")
        );
      }

      if (!companiesRes.ok) {
        throw new Error(
          getErrorMessage(companiesPayload, "Failed to load companies")
        );
      }

      setStats(statsPayload.data || null);
      setCompanies((companiesPayload.data || []).map(normalizeCompany));
    } catch (err) {
      setError(err.message || "Failed to load billing data");
      setStats(null);
      setCompanies([]);
    } finally {
      setBootLoading(false);
    }
  };

  const loadInvoices = async () => {
    setInvoiceLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      });

      if (searchFilter.trim()) params.set("search", searchFilter.trim());
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(
        `${apiBase}/superadmin/billing/invoices?${params.toString()}`,
        {
          credentials: "include",
        }
      );
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Failed to load invoices"));
      }

      setError("");
      setInvoiceRows(payload.data || []);
      setInvoiceMeta(payload.meta || { total: 0, page: 1, last_page: 1 });

      const lastPage = Math.max(payload.meta?.last_page || 1, 1);
      if (currentPage > lastPage) {
        setCurrentPage(lastPage);
      }
    } catch (err) {
      setError(err.message || "Failed to load invoices");
      setInvoiceRows([]);
      setInvoiceMeta({ total: 0, page: 1, last_page: 1 });
    } finally {
      setInvoiceLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(paymentPage),
        limit: String(ITEMS_PER_PAGE),
      });

      if (searchFilter.trim()) params.set("search", searchFilter.trim());

      const res = await fetch(
        `${apiBase}/superadmin/billing/payments?${params.toString()}`,
        {
          credentials: "include",
        }
      );
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Failed to load payments"));
      }

      setError("");
      setPaymentRows(payload.data || []);
      setPaymentMeta(payload.meta || { total: 0, page: 1, last_page: 1 });

      const lastPage = Math.max(payload.meta?.last_page || 1, 1);
      if (paymentPage > lastPage) {
        setPaymentPage(lastPage);
      }
    } catch (err) {
      setError(err.message || "Failed to load payments");
      setPaymentRows([]);
      setPaymentMeta({ total: 0, page: 1, last_page: 1 });
    } finally {
      setPaymentLoading(false);
    }
  };

  const refreshSummary = async () => {
    try {
      const res = await fetch(`${apiBase}/superadmin/billing/stats`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) setStats(payload.data || null);
    } catch {}
  };

  const refreshBillingData = async () => {
    await Promise.all([loadInvoices(), loadPayments(), refreshSummary()]);
  };

  useEffect(() => {
    loadBootstrap();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [currentPage, searchFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadPayments();
  }, [paymentPage, searchFilter]);

  const resetCreateDialog = () => {
    setCreateForm(createEmptyInvoiceForm());
    setInvoiceLines([defaultInvoiceLine()]);
    setIsRecurring(false);
  };

  const addInvoiceLine = () =>
    setInvoiceLines((current) => [...current, defaultInvoiceLine()]);

  const removeInvoiceLine = (index) => {
    setInvoiceLines((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const updateLine = (index, field, value) => {
    setInvoiceLines((current) =>
      current.map((line, currentIndex) => {
        if (currentIndex !== index) return line;

        const nextLine = { ...line, [field]: value };
        const qty = Number(nextLine.qty || 0);
        const price = Number(nextLine.price || 0);
        const discount = Number(nextLine.discount || 0);
        const taxRate = Number(nextLine.taxRate || 0);

        nextLine.subtotal = qty * price - discount;
        nextLine.taxAmount = nextLine.subtotal * (taxRate / 100);
        nextLine.total = nextLine.subtotal + nextLine.taxAmount;

        return nextLine;
      })
    );
  };

  const appendCatalogLine = (service, price, unit, description) => {
    setInvoiceLines((current) => [
      ...current,
      {
        service,
        description,
        qty: 1,
        unit,
        price,
        discount: 0,
        taxRate: 19,
        taxAmount: price * 0.19,
        subtotal: price,
        total: price * 1.19,
      },
    ]);
  };

  const applyCompanyToInvoiceForm = (companyId) => {
    const company = companies.find((item) => item.id === companyId);

    setCreateForm((current) => ({
      ...current,
      companyId,
      userId: company?.adminId || "",
      billingName: company?.name || "",
      billingEmail: company?.email || "",
      billingPhone: company?.phone || "",
      billingVat: company?.vatNumber || "",
      billingAddress: company?.address || "",
    }));
  };

  const openCreateDialog = () => {
    resetCreateDialog();
    setShowCreateInvoice(true);
  };

  const openEditDialog = (invoice) => {
    setEditInvoice(invoice);
    setEditForm({
      status: invoice.status,
      dueDate: invoice.dueDate !== "-" ? invoice.dueDate : "",
      notes: invoice.notes || "",
      terms: invoice.terms || "",
      billingVat: invoice.billingVat || "",
      reference: invoice.reference || "",
    });
  };

  const openAddPaymentDialog = (invoice = null) => {
    setPaymentForm({
      invoiceId: invoice ? String(invoice.rawId) : "",
      amount: invoice
        ? String(invoice.balanceValue || invoice.amountValue)
        : "",
      method: "wire",
      transactionId: "",
      paymentDate: today(),
      notes: "",
    });
    setShowAddPayment(true);
  };

  const openRefundDialog = (invoice) => {
    setRefundInvoice(invoice);
    setRefundForm({
      amount: String(invoice.paidAmountValue || invoice.amountValue || 0),
      reason: "",
    });
  };

  const selectedPaymentInvoice =
    invoices.find(
      (invoice) => String(invoice.rawId) === paymentForm.invoiceId
    ) || null;

  const submitCreateInvoice = async (statusOverride) => {
    if (!createForm.companyId || !createForm.userId) {
      toast({
        title: t("sa.bill_create_invoice"),
        description:
          "Select an account with a linked admin before creating an invoice.",
      });
      return;
    }

    const items = invoiceLines.filter((line) => line.service.trim());
    if (items.length === 0) {
      toast({
        title: t("sa.bill_create_invoice"),
        description: "Add at least one invoice line.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        companyId: Number(createForm.companyId),
        userId: Number(createForm.userId),
        status: statusOverride,
        currency: createForm.currency,
        invoiceDate: createForm.invoiceDate || undefined,
        dueDate: createForm.dueDate || undefined,
        reference: createForm.reference || undefined,
        billingName: createForm.billingName || undefined,
        billingEmail: createForm.billingEmail || undefined,
        billingPhone: createForm.billingPhone || undefined,
        billingVat: createForm.billingVat || undefined,
        billingAddress: createForm.billingAddress || undefined,
        notes: createForm.notes || undefined,
        terms: createForm.terms || undefined,
        isRecurring,
        recurringInterval: isRecurring
          ? createForm.recurringInterval
          : undefined,
        nextBillingDate: isRecurring
          ? createForm.nextBillingDate || undefined
          : undefined,
        items: items.map((line) => ({
          service: line.service,
          description: line.description || undefined,
          qty: Number(line.qty || 0),
          unit: line.unit,
          price: Number(line.price || 0),
          discount: Number(line.discount || 0),
          taxRate: Number(line.taxRate || 0),
        })),
      };

      const res = await fetch(`${apiBase}/superadmin/billing/invoices`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          getErrorMessage(responsePayload, "Failed to create invoice")
        );
      }

      setShowCreateInvoice(false);
      resetCreateDialog();
      await refreshBillingData();
      toast({
        title: t("sa.bill_create_invoice"),
        description: t("sa.bill_invoice_created"),
      });
    } catch (err) {
      toast({
        title: t("sa.bill_create_invoice"),
        description: err.message || "Failed to create invoice.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitInvoiceUpdate = async () => {
    if (!editInvoice) return;

    setSubmitting(true);

    try {
      const res = await fetch(
        `${apiBase}/superadmin/billing/invoices/${editInvoice.rawId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: editForm.status,
            dueDate: editForm.dueDate || undefined,
            notes: editForm.notes,
            terms: editForm.terms,
            billingVat: editForm.billingVat,
            reference: editForm.reference,
          }),
        }
      );
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Failed to update invoice"));
      }

      setEditInvoice(null);
      await refreshBillingData();
      toast({
        title: t("sa.acc_save"),
        description: t("sa.bill_invoice_updated"),
      });
    } catch (err) {
      toast({
        title: t("sa.acc_save"),
        description: err.message || "Failed to update invoice.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitManualPayment = async () => {
    if (!paymentForm.invoiceId || !paymentForm.amount) {
      toast({
        title: t("sa.bill_record"),
        description: "Select an invoice and enter an amount.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${apiBase}/superadmin/billing/payments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: Number(paymentForm.invoiceId),
          amount: Number(paymentForm.amount),
          method: paymentForm.method,
          transactionId: paymentForm.transactionId || undefined,
          paymentDate: paymentForm.paymentDate || undefined,
          notes: paymentForm.notes || undefined,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Failed to record payment"));
      }

      setShowAddPayment(false);
      setPaymentForm(createEmptyPaymentForm());
      await refreshBillingData();
      toast({
        title: t("sa.bill_record"),
        description: t("sa.bill_payment_added"),
      });
    } catch (err) {
      toast({
        title: t("sa.bill_record"),
        description: err.message || "Failed to record payment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitRefund = async () => {
    if (!refundInvoice) return;

    setSubmitting(true);

    try {
      const res = await fetch(
        `${apiBase}/superadmin/billing/invoices/${refundInvoice.rawId}/refund`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: refundForm.amount ? Number(refundForm.amount) : undefined,
            reason: refundForm.reason || undefined,
          }),
        }
      );
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Failed to refund invoice"));
      }

      setRefundInvoice(null);
      setRefundForm(createEmptyRefundForm());
      await refreshBillingData();
      toast({
        title: t("sa.bill_refund"),
        description: payload.message || "Refund completed.",
      });
    } catch (err) {
      toast({
        title: t("sa.bill_refund"),
        description: err.message || "Failed to refund invoice.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitRetry = async () => {
    if (!retryInvoice) return;

    setSubmitting(true);

    try {
      const res = await fetch(
        `${apiBase}/superadmin/billing/invoices/retry`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: retryInvoice.rawId }),
        }
      );
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Failed to retry payment"));
      }

      setRetryInvoice(null);
      await refreshBillingData();
      toast({
        title: t("sa.bill_retry_payment"),
        description: payload.message || "Payment retried.",
      });
    } catch (err) {
      toast({
        title: t("sa.bill_retry_payment"),
        description: err.message || "Failed to retry payment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (searchFilter.trim()) params.set("search", searchFilter.trim());
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(
        `${apiBase}/superadmin/billing/invoices?${params.toString()}`,
        {
          credentials: "include",
        }
      );
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Failed to export invoices"));
      }

      const exportRows = (payload.data || []).map((invoice) =>
        normalizeInvoice(invoice, companyMap)
      );
      const headers = ["Invoice,Account,Amount,Status,Date,Due Date,Method"];
      const rows = exportRows.map((invoice) =>
        [
          invoice.id,
          invoice.account,
          invoice.amount,
          invoice.status,
          invoice.date,
          invoice.dueDate,
          invoice.method,
        ].join(",")
      );
      const csv = [...headers, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "billing-export.csv";
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: t("sa.bill_export"),
        description: t("sa.bill_csv_success"),
      });
    } catch (err) {
      toast({
        title: t("sa.bill_export"),
        description: err.message || "Failed to export invoices.",
      });
    }
  };

  const renderPagination = (page, lastPage, onChange) => (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={14} />
      </Button>
      {Array.from({ length: Math.max(lastPage, 1) }, (_, index) => (
        <Button
          key={index}
          size="sm"
          variant={page === index + 1 ? "default" : "outline"}
          onClick={() => onChange(index + 1)}
          className="w-8"
        >
          {index + 1}
        </Button>
      ))}
      <Button
        size="sm"
        variant="outline"
        disabled={page >= Math.max(lastPage, 1)}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={14} />
      </Button>
    </div>
  );

  return (
    <SuperAdminLayout
      title={t("sa.bill_title")}
      subtitle={t("sa.bill_subtitle")}
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.labelKey} className="bg-card border-border/50">
            <CardContent className="p-4">
              <metric.icon size={16} className="text-primary mb-2" />
              <p className="text-xs text-muted-foreground">
                {t(metric.labelKey)}
              </p>
              <p className="text-xl font-bold font-display mt-1">
                {bootLoading ? "..." : metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={t("sa.bill_search")}
            className="pl-9 bg-secondary border-border/50"
            value={searchFilter}
            onChange={(event) => {
              setSearchFilter(event.target.value);
              setCurrentPage(1);
              setPaymentPage(1);
            }}
          />
        </div>
        <Input
          type="date"
          className="w-40 bg-secondary border-border/50"
          value={dateFrom}
          onChange={(event) => {
            setDateFrom(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t("sa.bill_from")}
        />
        <Input
          type="date"
          className="w-40 bg-secondary border-border/50"
          value={dateTo}
          onChange={(event) => {
            setDateTo(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t("sa.bill_to")}
        />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList className="bg-secondary border border-border/50 mb-6">
          <TabsTrigger value="invoices">{t("sa.bill_invoices")}</TabsTrigger>
          <TabsTrigger value="payments">
            {t("sa.bill_all_payments")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {t("sa.bill_invoices")}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={openCreateDialog}>
                  <Plus size={14} className="mr-2" />
                  {t("sa.bill_create_invoice")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => openAddPaymentDialog()}
                  variant="outline"
                  className="border-border/50"
                >
                  <CreditCard size={14} className="mr-2" />
                  {t("sa.bill_add_payment")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border/50"
                  onClick={handleExport}
                >
                  <Download size={14} className="mr-2" />
                  {t("sa.bill_export")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>{t("sa.bill_invoice")}</TableHead>
                    <TableHead>{t("sa.bill_account")}</TableHead>
                    <TableHead>{t("sa.bill_amount")}</TableHead>
                    <TableHead>{t("sa.bill_status")}</TableHead>
                    <TableHead>{t("sa.bill_date")}</TableHead>
                    <TableHead>{t("sa.bill_due")}</TableHead>
                    <TableHead>{t("sa.bill_actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceLoading ? (
                    <TableRow className="border-border/50">
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow className="border-border/50">
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow
                        key={invoice.rawId}
                        className="border-border/50"
                      >
                        <TableCell className="font-mono text-sm">
                          {invoice.id}
                        </TableCell>
                        <TableCell>{invoice.account}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              statusColor[invoice.status] || statusColor.draft
                            }
                          >
                            {getStatusLabel(t, invoice.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewInvoice(invoice)}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(invoice)}
                            >
                              <Pencil size={14} />
                            </Button>
                            {invoice.status === "failed" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary/30 text-primary hover:bg-primary/10"
                                onClick={() => setRetryInvoice(invoice)}
                              >
                                {t("sa.bill_retry")}
                              </Button>
                            ) : null}
                            {invoice.status === "paid" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openRefundDialog(invoice)}
                              >
                                {t("sa.bill_refund")}
                              </Button>
                            ) : null}
                            {["sent", "overdue", "failed", "draft"].includes(
                              invoice.status
                            ) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border/50"
                                onClick={() => openAddPaymentDialog(invoice)}
                              >
                                {t("sa.bill_add_payment")}
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  {t("sa.bill_showing")}{" "}
                  {invoiceMeta.total === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                  -{Math.min(currentPage * ITEMS_PER_PAGE, invoiceMeta.total)}{" "}
                  {t("sa.bill_of")} {invoiceMeta.total}
                </span>
                {renderPagination(
                  currentPage,
                  invoiceMeta.last_page || 1,
                  setCurrentPage
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">
                {t("sa.bill_all_payments")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>{t("sa.bill_payment_id")}</TableHead>
                    <TableHead>{t("sa.bill_invoice")}</TableHead>
                    <TableHead>{t("sa.bill_account")}</TableHead>
                    <TableHead>{t("sa.bill_amount")}</TableHead>
                    <TableHead>{t("sa.bill_method")}</TableHead>
                    <TableHead>{t("sa.bill_date")}</TableHead>
                    <TableHead>{t("sa.bill_status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentLoading ? (
                    <TableRow className="border-border/50">
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Loading payments...
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow className="border-border/50">
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow
                        key={payment.rawId}
                        className="border-border/50"
                      >
                        <TableCell className="font-mono text-sm">
                          {payment.id}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.invoice}
                        </TableCell>
                        <TableCell>{payment.account}</TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              statusColor[payment.status] ||
                              statusColor.completed
                            }
                          >
                            {getStatusLabel(t, payment.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  {t("sa.bill_showing")}{" "}
                  {paymentMeta.total === 0
                    ? 0
                    : (paymentPage - 1) * ITEMS_PER_PAGE + 1}
                  -{Math.min(paymentPage * ITEMS_PER_PAGE, paymentMeta.total)}{" "}
                  {t("sa.bill_of")} {paymentMeta.total}
                </span>
                {renderPagination(
                  paymentPage,
                  paymentMeta.last_page || 1,
                  setPaymentPage
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={showCreateInvoice}
        onOpenChange={(open) => {
          setShowCreateInvoice(open);
          if (!open) resetCreateDialog();
        }}
      >
        <DialogContent className="bg-card border-border/50 sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("sa.bill_create_invoice")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">
                {t("sa.bill_invoice_info")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">
                    {t("sa.bill_invoice_number")}
                  </Label>
                  <Input
                    value="Auto-generated"
                    readOnly
                    className="mt-1 bg-secondary border-border/50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_invoice_date")}</Label>
                  <Input
                    type="date"
                    value={createForm.invoiceDate}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        invoiceDate: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_due_date")}</Label>
                  <Input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_status")}</Label>
                  <Select
                    value={createForm.status}
                    onValueChange={(value) =>
                      setCreateForm((current) => ({
                        ...current,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        {t("sa.bill_draft")}
                      </SelectItem>
                      <SelectItem value="sent">{t("sa.bill_sent")}</SelectItem>
                      <SelectItem value="paid">{t("sa.bill_paid")}</SelectItem>
                      <SelectItem value="overdue">
                        {t("sa.bill_overdue")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("sa.bill_cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label className="text-xs">{t("sa.bill_currency")}</Label>
                  <Select
                    value={createForm.currency}
                    onValueChange={(value) =>
                      setCreateForm((current) => ({
                        ...current,
                        currency: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_reference")}</Label>
                  <Input
                    value={createForm.reference}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        reference: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                    placeholder={t("sa.bill_ref_placeholder")}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">
                {t("sa.bill_customer_info")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("sa.bill_account")}</Label>
                  <Select
                    value={createForm.companyId || undefined}
                    onValueChange={applyCompanyToInvoiceForm}
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm">
                      <SelectValue placeholder={t("sa.bill_select_account")} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">
                    {t("sa.bill_customer_name")}
                  </Label>
                  <Input
                    value={createForm.billingName}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        billingName: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                    placeholder={t("sa.bill_company_placeholder")}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_email")}</Label>
                  <Input
                    type="email"
                    value={createForm.billingEmail}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        billingEmail: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                    placeholder={t("sa.bill_email_placeholder")}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_phone")}</Label>
                  <Input
                    value={createForm.billingPhone}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        billingPhone: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                    placeholder="+1-555-000-0000"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_vat")}</Label>
                  <Input
                    value={createForm.billingVat}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        billingVat: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                    placeholder={t("sa.acc_vat_placeholder")}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label className="text-xs">
                  {t("sa.bill_billing_address")}
                </Label>
                <Textarea
                  className="mt-1 bg-secondary border-border/50 text-sm"
                  rows={2}
                  value={createForm.billingAddress}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      billingAddress: event.target.value,
                    }))
                  }
                  placeholder={t("sa.bill_address_placeholder")}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">
                {t("sa.bill_quick_add")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("sa.bill_add_plan")}</Label>
                  <Select
                    onValueChange={(value) =>
                      appendCatalogLine(
                        value,
                        planCatalog[value] || 0,
                        "month",
                        `${value} - Monthly`
                      )
                    }
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm">
                      <SelectValue
                        placeholder={t("sa.bill_plan_placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_add_addon")}</Label>
                  <Select
                    onValueChange={(value) =>
                      appendCatalogLine(
                        value,
                        addonCatalog[value] || 0,
                        "pcs",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm">
                      <SelectValue
                        placeholder={t("sa.bill_addon_placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {addons.map((addon) => (
                        <SelectItem key={addon} value={addon}>
                          {addon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">
                  {t("sa.bill_line_items")}
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addInvoiceLine}
                  className="border-border/50"
                >
                  <Plus size={12} className="mr-1" />
                  {t("sa.bill_add_line")}
                </Button>
              </div>
              <div className="space-y-3">
                {invoiceLines.map((line, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/50 rounded-lg border border-border/30"
                  >
                    <div className="col-span-3">
                      <Label className="text-xs">{t("sa.bill_service")}</Label>
                      <Input
                        value={line.service}
                        onChange={(event) =>
                          updateLine(index, "service", event.target.value)
                        }
                        className="mt-1 bg-secondary border-border/50 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">
                        {t("sa.bill_description")}
                      </Label>
                      <Input
                        value={line.description}
                        onChange={(event) =>
                          updateLine(index, "description", event.target.value)
                        }
                        className="mt-1 bg-secondary border-border/50 text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs">{t("sa.bill_qty")}</Label>
                      <Input
                        type="number"
                        value={line.qty}
                        onChange={(event) =>
                          updateLine(index, "qty", Number(event.target.value))
                        }
                        className="mt-1 bg-secondary border-border/50 text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs">{t("sa.bill_unit")}</Label>
                      <Select
                        value={line.unit}
                        onValueChange={(value) =>
                          updateLine(index, "unit", value)
                        }
                      >
                        <SelectTrigger className="mt-1 bg-secondary border-border/50 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">
                            {t("sa.bill_month")}
                          </SelectItem>
                          <SelectItem value="year">
                            {t("sa.bill_year")}
                          </SelectItem>
                          <SelectItem value="pcs">
                            {t("sa.bill_pcs")}
                          </SelectItem>
                          <SelectItem value="hour">
                            {t("sa.bill_hour")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs">{t("sa.bill_price")}</Label>
                      <Input
                        type="number"
                        value={line.price}
                        onChange={(event) =>
                          updateLine(index, "price", Number(event.target.value))
                        }
                        className="mt-1 bg-secondary border-border/50 text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs">{t("sa.bill_tax")}</Label>
                      <Input
                        type="number"
                        value={line.taxRate}
                        onChange={(event) =>
                          updateLine(
                            index,
                            "taxRate",
                            Number(event.target.value)
                          )
                        }
                        className="mt-1 bg-secondary border-border/50 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">{t("sa.bill_total")}</Label>
                      <Input
                        value={formatMoney(line.total, createForm.currency)}
                        readOnly
                        className="mt-1 bg-secondary border-border/50 text-xs font-semibold"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {invoiceLines.length > 1 ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-8 w-8 p-0"
                          onClick={() => removeInvoiceLine(index)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 ml-auto max-w-xs space-y-2 p-4 bg-secondary/50 rounded-lg border border-border/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("sa.bill_subtotal")}
                  </span>
                  <span>{formatMoney(grandSubtotal, createForm.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("sa.bill_tax")}
                  </span>
                  <span>{formatMoney(grandTax, createForm.currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-border/50 pt-2">
                  <span>{t("sa.bill_grand_total")}</span>
                  <span>{formatMoney(grandTotal, createForm.currency)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">
                {t("sa.bill_subscription")}
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <Switch
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label>{t("sa.bill_recurring")}</Label>
              </div>
              {isRecurring ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">{t("sa.bill_interval")}</Label>
                    <Select
                      value={createForm.recurringInterval}
                      onValueChange={(value) =>
                        setCreateForm((current) => ({
                          ...current,
                          recurringInterval: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t("sa.bill_monthly")}
                        </SelectItem>
                        <SelectItem value="yearly">
                          {t("sa.bill_yearly")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("sa.bill_sub_id")}</Label>
                    <Input
                      value="Auto"
                      readOnly
                      className="mt-1 bg-secondary border-border/50 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      {t("sa.bill_next_billing")}
                    </Label>
                    <Input
                      type="date"
                      value={createForm.nextBillingDate}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          nextBillingDate: event.target.value,
                        }))
                      }
                      className="mt-1 bg-secondary border-border/50 text-sm"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">{t("sa.bill_notes")}</Label>
                <Textarea
                  className="mt-1 bg-secondary border-border/50 text-sm"
                  rows={3}
                  value={createForm.notes}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder={t("sa.bill_notes_placeholder")}
                />
              </div>
              <div>
                <Label className="text-xs">{t("sa.bill_terms")}</Label>
                <Textarea
                  className="mt-1 bg-secondary border-border/50 text-sm"
                  rows={3}
                  value={createForm.terms}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      terms: event.target.value,
                    }))
                  }
                  placeholder={t("sa.bill_terms_placeholder")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateInvoice(false)}
            >
              {t("sa.acc_cancel")}
            </Button>
            <Button
              variant="outline"
              onClick={() => submitCreateInvoice("draft")}
              disabled={submitting}
            >
              {t("sa.bill_save_draft")}
            </Button>
            <Button
              onClick={() =>
                submitCreateInvoice(
                  createForm.status === "draft" ? "sent" : createForm.status
                )
              }
              disabled={submitting}
            >
              {t("sa.bill_create_send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editInvoice} onOpenChange={() => setEditInvoice(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("sa.bill_edit_invoice")}</DialogTitle>
          </DialogHeader>
          {editInvoice ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">
                    {t("sa.bill_invoice_number")}
                  </Label>
                  <Input
                    value={editInvoice.id}
                    className="mt-1 bg-secondary border-border/50 text-sm"
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_status")}</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm((current) => ({ ...current, status: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border/50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        {t("sa.bill_draft")}
                      </SelectItem>
                      <SelectItem value="sent">{t("sa.bill_sent")}</SelectItem>
                      <SelectItem value="paid">{t("sa.bill_paid")}</SelectItem>
                      <SelectItem value="overdue">
                        {t("sa.bill_overdue")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("sa.bill_cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("sa.bill_account")}</Label>
                <Input
                  value={editInvoice.account}
                  className="mt-1 bg-secondary border-border/50 text-sm"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("sa.bill_amount")}</Label>
                  <Input
                    value={editInvoice.amount}
                    className="mt-1 bg-secondary border-border/50 text-sm"
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_due_date")}</Label>
                  <Input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("sa.bill_reference")}</Label>
                  <Input
                    value={editForm.reference}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        reference: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("sa.bill_vat")}</Label>
                  <Input
                    value={editForm.billingVat}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        billingVat: event.target.value,
                      }))
                    }
                    className="mt-1 bg-secondary border-border/50 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("sa.bill_notes")}</Label>
                <Textarea
                  className="mt-1 bg-secondary border-border/50 text-sm"
                  rows={3}
                  value={editForm.notes}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditInvoice(null)}>
              {t("sa.acc_cancel")}
            </Button>
            <Button onClick={submitInvoiceUpdate} disabled={submitting}>
              {t("sa.acc_save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddPayment}
        onOpenChange={(open) => {
          setShowAddPayment(open);
          if (!open) setPaymentForm(createEmptyPaymentForm());
        }}
      >
        <DialogContent className="bg-card border-border/50 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("sa.bill_add_manual")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("sa.bill_select_invoice")}</Label>
              <Select
                value={paymentForm.invoiceId || undefined}
                onValueChange={(value) => {
                  const invoice = invoices.find(
                    (item) => String(item.rawId) === value
                  );
                  setPaymentForm((current) => ({
                    ...current,
                    invoiceId: value,
                    amount: invoice
                      ? String(invoice.balanceValue || invoice.amountValue)
                      : "",
                  }));
                }}
              >
                <SelectTrigger className="mt-1 bg-secondary border-border/50">
                  <SelectValue placeholder={t("sa.bill_select_invoice")} />
                </SelectTrigger>
                <SelectContent>
                  {availableInvoicesForPayment.map((invoice) => (
                    <SelectItem
                      key={invoice.rawId}
                      value={String(invoice.rawId)}
                    >
                      {invoice.id} - {invoice.account} ({invoice.amount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("sa.bill_account")}</Label>
              <Input
                value={selectedPaymentInvoice?.account || ""}
                readOnly
                className="mt-1 bg-secondary border-border/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  {t("sa.bill_amount")} (
                  {selectedPaymentInvoice?.currency || "EUR"})
                </Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(event) =>
                    setPaymentForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="mt-1 bg-secondary border-border/50"
                />
              </div>
              <div>
                <Label>{t("sa.bill_payment_method")}</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value) =>
                    setPaymentForm((current) => ({ ...current, method: value }))
                  }
                >
                  <SelectTrigger className="mt-1 bg-secondary border-border/50">
                    <SelectValue placeholder={t("sa.bill_method")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">
                      {t("sa.bill_credit_card")}
                    </SelectItem>
                    <SelectItem value="wire">
                      {t("sa.bill_wire_transfer")}
                    </SelectItem>
                    <SelectItem value="check">{t("sa.bill_check")}</SelectItem>
                    <SelectItem value="other">{t("sa.bill_other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("sa.bill_transaction_id")}</Label>
              <Input
                value={paymentForm.transactionId}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    transactionId: event.target.value,
                  }))
                }
                className="mt-1 bg-secondary border-border/50"
                placeholder={t("sa.bill_txn_placeholder")}
              />
            </div>
            <div>
              <Label>{t("sa.bill_payment_date")}</Label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    paymentDate: event.target.value,
                  }))
                }
                className="mt-1 bg-secondary border-border/50"
              />
            </div>
            <div>
              <Label>{t("sa.bill_ref_notes")}</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder={t("sa.bill_payment_ref_placeholder")}
                className="mt-1 bg-secondary border-border/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPayment(false)}>
              {t("sa.acc_cancel")}
            </Button>
            <Button onClick={submitManualPayment} disabled={submitting}>
              {t("sa.bill_record")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!refundInvoice}
        onOpenChange={() => setRefundInvoice(null)}
      >
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("sa.bill_issue_refund")}</DialogTitle>
          </DialogHeader>
          {refundInvoice ? (
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("sa.bill_invoice")}
                  </span>
                  <span className="font-mono">{refundInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("sa.bill_account")}
                  </span>
                  <span>{refundInvoice.account}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("sa.bill_amount")}
                  </span>
                  <span className="font-medium">{refundInvoice.amount}</span>
                </div>
              </div>
              <div>
                <Label>{t("sa.bill_refund_amount")}</Label>
                <Input
                  value={refundForm.amount}
                  onChange={(event) =>
                    setRefundForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  className="mt-1 bg-secondary border-border/50"
                />
              </div>
              <div>
                <Label>{t("sa.bill_reason")}</Label>
                <Textarea
                  value={refundForm.reason}
                  onChange={(event) =>
                    setRefundForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder={t("sa.bill_refund_reason_placeholder")}
                  className="mt-1 bg-secondary border-border/50"
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundInvoice(null)}>
              {t("sa.acc_cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={submitRefund}
              disabled={submitting}
            >
              {t("sa.bill_confirm_refund")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!retryInvoice} onOpenChange={() => setRetryInvoice(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("sa.bill_retry_payment")}</DialogTitle>
          </DialogHeader>
          {retryInvoice ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("sa.bill_retry_desc")}
              </p>
              <div className="bg-secondary rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("sa.bill_invoice")}
                  </span>
                  <span className="font-mono">{retryInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("sa.bill_account")}
                  </span>
                  <span>{retryInvoice.account}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("sa.bill_amount")}
                  </span>
                  <span className="font-medium">{retryInvoice.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("sa.bill_method")}
                  </span>
                  <span>{retryInvoice.method}</span>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetryInvoice(null)}>
              {t("sa.acc_cancel")}
            </Button>
            <Button onClick={submitRetry} disabled={submitting}>
              {t("sa.bill_retry_payment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <SheetContent className="bg-card border-border/50 sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("sa.bill_invoice_details")}</SheetTitle>
          </SheetHeader>
          {viewInvoice ? (
            <div className="space-y-4 mt-6">
              {[
                { labelKey: "sa.bill_invoice_id", value: viewInvoice.id },
                { labelKey: "sa.bill_account", value: viewInvoice.account },
                { labelKey: "sa.bill_email", value: viewInvoice.email },
                { labelKey: "sa.bill_amount", value: viewInvoice.amount },
                {
                  labelKey: "sa.bill_paid_amount",
                  value: viewInvoice.paidAmount,
                },
                { labelKey: "sa.bill_balance_due", value: viewInvoice.balance },
                { labelKey: "sa.bill_currency", value: viewInvoice.currency },
                { labelKey: "sa.bill_date", value: viewInvoice.date },
                { labelKey: "sa.bill_due_date", value: viewInvoice.dueDate },
                { labelKey: "sa.bill_method", value: viewInvoice.method },
                {
                  labelKey: "sa.bill_recurring",
                  value: viewInvoice.recurring
                    ? `${t("sa.bill_yes")} (${viewInvoice.interval})`
                    : t("sa.bill_no"),
                },
              ].map((item) => (
                <div
                  key={item.labelKey}
                  className="flex justify-between border-b border-border/50 pb-2 gap-4"
                >
                  <span className="text-sm text-muted-foreground">
                    {t(item.labelKey)}
                  </span>
                  <span className="text-sm font-medium text-right">
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t("sa.bill_status")}
                </span>
                <Badge
                  className={
                    statusColor[viewInvoice.status] || statusColor.draft
                  }
                >
                  {getStatusLabel(t, viewInvoice.status)}
                </Badge>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">
                  {t("sa.bill_line_items")}
                </h4>
                {viewInvoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm py-2 border-b border-border/30 gap-4"
                  >
                    <span>
                      {item.service} x {item.qty}
                    </span>
                    <span className="font-medium">
                      {formatMoney(item.total, viewInvoice.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </SuperAdminLayout>
  );
};

export default BillingRevenue;
