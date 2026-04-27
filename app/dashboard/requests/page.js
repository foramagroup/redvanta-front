"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Plus, Mail, Phone, Send, Upload, X,
  RotateCcw, XCircle, TrendingUp, CheckCircle,
  Eye, Loader2, AlertTriangle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

// ─── Config API ───────────────────────────────────────────────
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ""}/admin/requests`;

// ─── Helpers ──────────────────────────────────────────────────
const COUNTRIES = [
  { name: "US", code: "+1",  flag: "🇺🇸" },
  { name: "UK", code: "+44", flag: "🇬🇧" },
  { name: "FR", code: "+33", flag: "🇫🇷" },
  { name: "DE", code: "+49", flag: "🇩🇪" },
];

const STATUS_COLORS = {
  sent:      "bg-blue-500/20 text-blue-400",
  delivered: "bg-amber-500/20 text-amber-400",
  opened:    "bg-purple-500/20 text-purple-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  failed:    "bg-destructive/20 text-destructive",
  cancelled: "bg-secondary text-muted-foreground",
};

const STATUS_KEYS = ["sent", "delivered", "opened", "completed", "failed"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Parse CSV côté client : retourne un tableau d'objets
function parseCsv(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    // Normaliser les champs attendus par l'API
    return {
      customerName: obj.name || obj.customername || obj.customer_name || "",
      method:       (obj.method || "email").toLowerCase(),
      email:        obj.email || "",
      phone:        obj.phone || obj.mobile || "",
      countryCode:  obj.countrycode || obj.country_code || "+1",
    };
  }).filter((c) => c.customerName);
}

// ─── Hook fetch générique avec credentials ─────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server error (${res.status})`);
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data;
}

// ─────────────────────────────────────────────────────────────
const Requests = () => {
  const { t } = useLanguage();

  // ── Data ───────────────────────────────────────────────────
  const [requests,  setRequests]  = useState([]);
  const [stats,     setStats]     = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // ── Filtres ────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);

  // ── Modals ─────────────────────────────────────────────────
  const [showModal,  setShowModal]  = useState(false);
  const [showImport, setShowImport] = useState(false);

  // ── Formulaire de création ─────────────────────────────────
  const [form, setForm] = useState({
    customerName: "",
    method:       "email",
    email:        "",
    phone:        "",
    countryCode:  "+1",
    locationId:   "",
    customMessage: "",
  });
  const [contactTab,    setContactTab]    = useState("email");
  const [phoneCountry,  setPhoneCountry]  = useState(COUNTRIES[0]);
  const [submitting,    setSubmitting]    = useState(false);

  // ── Import CSV ─────────────────────────────────────────────
  const [csvContacts,   setCsvContacts]   = useState([]);
  const [csvLocationId, setCsvLocationId] = useState("");
  const [csvMessage,    setCsvMessage]    = useState("");
  const [importing,     setImporting]     = useState(false);
  const fileRef = useRef(null);

  // ── Actions en cours (resend/cancel) ──────────────────────
  const [actionId, setActionId] = useState(null);

  // ─────────────────────────────────────────────────────────
  // Fetch liste + stats
  // ─────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);

      const data = await apiFetch(`${API_BASE}?${params}`);
      setRequests(data.data.requests);
      setPagination(data.data.pagination);
      setStats(data.data.stats);
    } catch (err) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // Fetch locations pour les selects (endpoint dédié sur requests)
  const fetchLocations = useCallback(async () => {
    try {
      const data = await apiFetch(`${API_BASE}/locations`);
      setLocations(data.data || []);
    } catch {
      // non bloquant
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  // Reset page quand le filtre change
  useEffect(() => { setPage(1); }, [statusFilter]);

  // ─────────────────────────────────────────────────────────
  // Créer une demande
  // ─────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (form.method === "email" && !form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (form.method === "sms" && !form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(API_BASE, {
        method: "POST",
        body: JSON.stringify({
          customerName:  form.customerName.trim(),
          method:        form.method,
          email:         form.method === "email"   ? form.email.trim()  : undefined,
          phone:         form.method === "sms"     ? form.phone.trim()  : undefined,
          countryCode:   form.method === "sms"     ? phoneCountry.code  : undefined,
          locationId:    form.locationId           ? parseInt(form.locationId) : undefined,
          customMessage: form.customMessage.trim() || undefined,
        }),
      });

      toast.success("Request sent successfully!");
      setShowModal(false);
      resetForm();
      fetchRequests();
    } catch (err) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ customerName: "", method: "email", email: "", phone: "", countryCode: "+1", locationId: "", customMessage: "" });
    setContactTab("email");
    setPhoneCountry(COUNTRIES[0]);
  };

  // ─────────────────────────────────────────────────────────
  // Import CSV
  // ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const contacts = parseCsv(evt.target.result);
      setCsvContacts(contacts);
      if (contacts.length === 0) {
        toast.error("No valid contacts found in CSV");
      } else {
        toast.success(`${contacts.length} contact(s) ready to import`);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (csvContacts.length === 0) {
      toast.error("Please choose a valid CSV file first");
      return;
    }
    setImporting(true);
    try {
      const data = await apiFetch(`${API_BASE}/bulk`, {
        method: "POST",
        body: JSON.stringify({
          contacts:     csvContacts,
          locationId:   csvLocationId ? parseInt(csvLocationId) : undefined,
          customMessage: csvMessage.trim() || undefined,
        }),
      });
      toast.success(data.message || "Import successful");
      setShowImport(false);
      setCsvContacts([]);
      setCsvLocationId("");
      setCsvMessage("");
      if (fileRef.current) fileRef.current.value = "";
      fetchRequests();
    } catch (err) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Resend
  // ─────────────────────────────────────────────────────────
  const handleResend = async (id) => {
    setActionId(id);
    try {
      await apiFetch(`${API_BASE}/${id}/resend`, { method: "POST" });
      toast.success("Request resent!");
      fetchRequests();
    } catch (err) {
      toast.error(err.message || "Failed to resend");
    } finally {
      setActionId(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Cancel
  // ─────────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    setActionId(id);
    try {
      await apiFetch(`${API_BASE}/${id}/cancel`, { method: "PUT" });
      toast.success("Request cancelled");
      fetchRequests();
    } catch (err) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setActionId(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Stats cards (dynamiques depuis l'API, fallback si null)
  // ─────────────────────────────────────────────────────────
  const statCards = [
    {
      labelKey: "req.total_sent",
      value:    stats?.totalSent        ?? "—",
      change:   "",
      icon:     Send,
    },
    {
      labelKey: "req.delivered",
      value:    stats?.deliveredRate    ?? "—",
      change:   "",
      icon:     CheckCircle,
    },
    {
      labelKey: "req.opened",
      value:    stats?.openedRate       ?? "—",
      change:   "",
      icon:     Eye,
    },
    {
      labelKey: "req.converted",
      value:    stats?.conversionRate   ?? "—",
      change:   "",
      icon:     TrendingUp,
    },
  ];

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title={t("req.title")}
      subtitle={t("req.subtitle")}
      headerAction={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/50"
            onClick={() => setShowImport(true)}
          >
            <Upload size={16} /> {t("req.bulk_import")}
          </Button>
          <Button
            size="sm"
            className="gap-2 glow-red-hover"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> {t("req.create_request")}
          </Button>
        </div>
      }
    >
      {/* ── Stats ───────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        custom={0}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6"
      >
        {statCards.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-gradient-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t(stat.labelKey)}</span>
              <stat.icon size={18} className="text-primary" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-2xl font-bold">{stat.value}</span>
              {stat.change && (
                <span className="mb-0.5 text-xs text-primary font-medium">{stat.change}</span>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Filtres status ───────────────────────────────────── */}
      <motion.div variants={fadeUp} custom={1} className="flex gap-2 mb-6 flex-wrap">
        {STATUS_KEYS.map((sk) => (
          <button
            key={sk}
            onClick={() => setStatusFilter(statusFilter === sk ? null : sk)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
              statusFilter === sk
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`req.${sk}`)}
          </button>
        ))}
      </motion.div>

      {/* ── Table ───────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        custom={2}
        className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span className="text-sm">Loading requests…</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Send size={32} className="opacity-20" />
            <p className="text-sm">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("req.customer")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("req.method")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("req.status")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t("req.date")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("req.conversion")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("req.location")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("req.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const isActing = actionId === req.id;
                  const canResend = ["failed", "sent", "delivered"].includes(req.status);
                  const canCancel = !["completed", "cancelled"].includes(req.status);

                  return (
                    <tr
                      key={req.id}
                      className="border-b border-border/30 hover:bg-secondary/50 transition-colors"
                    >
                      {/* Nom + contact */}
                      <td className="p-4">
                        <p className="text-sm font-medium">{req.customerName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {req.contact}
                        </p>
                      </td>

                      {/* Méthode */}
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {req.method === "sms" ? <Phone size={14} /> : <Mail size={14} />}
                          {req.method.toUpperCase()}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[req.status] || "bg-secondary text-muted-foreground"}`}>
                          {t(`req.${req.status}`) || req.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                        {formatDate(req.createdAt)}
                      </td>

                      {/* Conversion */}
                      <td className="p-4 hidden lg:table-cell">
                        {req.conversion
                          ? <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">{t("req.converted_label")}</span>
                          : <span className="text-xs text-muted-foreground">—</span>
                        }
                      </td>

                      {/* Location */}
                      <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                        {req.location?.name ?? "—"}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex gap-1">
                          {/* Resend */}
                          <button
                            onClick={() => handleResend(req.id)}
                            disabled={isActing || !canResend}
                            title="Resend"
                            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {isActing
                              ? <Loader2 size={14} className="animate-spin" />
                              : <RotateCcw size={14} />
                            }
                          </button>

                          {/* Cancel */}
                          <button
                            onClick={() => handleCancel(req.id)}
                            disabled={isActing || !canCancel}
                            title="Cancel"
                            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {pagination.total} request{pagination.total !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-secondary disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-muted-foreground">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-1.5 rounded hover:bg-secondary disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Modal création ───────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => { setShowModal(false); resetForm(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">{t("req.create_title")}</h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("req.customer_name")}</label>
                <Input
                  className="bg-secondary/50 border-border/50"
                  placeholder="John Doe"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                />
              </div>

              {/* Méthode de contact */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("req.contact_method")}</label>
                <Tabs
                  value={contactTab}
                  onValueChange={(v) => { setContactTab(v); setForm((f) => ({ ...f, method: v })); }}
                  className="w-full"
                >
                  <TabsList className="w-full bg-secondary/50">
                    <TabsTrigger value="email" className="flex-1 gap-2">
                      <Mail size={14} /> {t("req.email")}
                    </TabsTrigger>
                    <TabsTrigger value="sms" className="flex-1 gap-2">
                      <Phone size={14} /> {t("req.phone")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="mt-3">
                    <Input
                      className="bg-secondary/50 border-border/50"
                      type="email"
                      placeholder="john@email.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </TabsContent>

                  <TabsContent value="sms" className="mt-3">
                    <div className="flex gap-2">
                      <select
                        value={phoneCountry.name}
                        onChange={(e) => {
                          const c = COUNTRIES.find((x) => x.name === e.target.value);
                          if (c) { setPhoneCountry(c); setForm((f) => ({ ...f, countryCode: c.code })); }
                        }}
                        className="w-24 rounded-md border border-border/50 bg-secondary/50 px-2 text-sm"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.name}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <Input
                        className="bg-secondary/50 border-border/50 flex-1"
                        placeholder="555 123-4567"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("req.loc_label")}</label>
                <select
                  value={form.locationId}
                  onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
                  className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">— No specific location —</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Message personnalisé */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("req.custom_message")}</label>
                <textarea
                  className="w-full rounded-lg border border-border/50 bg-secondary/50 p-3 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Hi {customer_name}, we'd love your feedback…"
                  value={form.customMessage}
                  onChange={(e) => setForm((f) => ({ ...f, customMessage: e.target.value }))}
                />
              </div>

              <Button
                className="w-full glow-red-hover gap-2"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Send size={16} />
                }
                {t("req.send_request")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modal import CSV ─────────────────────────────────── */}
      {showImport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowImport(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">{t("req.bulk_title")}</h3>
              <button onClick={() => setShowImport(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Zone drop CSV */}
            <div
              className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">{t("req.upload_csv")}</p>
              <p className="text-xs text-muted-foreground">{t("req.csv_columns")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Required columns: <code className="bg-secondary px-1 rounded">name, method, email, phone, country_code</code>
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="outline" size="sm" className="mt-4 border-border/50">
                {t("req.choose_file")}
              </Button>
            </div>

            {/* Aperçu contacts parsés */}
            {csvContacts.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-400">
                  {csvContacts.length} contact{csvContacts.length > 1 ? "s" : ""} ready to import
                </p>
              </div>
            )}

            {/* Location pour le bulk */}
            <div className="mt-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Location (optional)</label>
              <select
                value={csvLocationId}
                onChange={(e) => setCsvLocationId(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">— No specific location —</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Message pour le bulk */}
            <div className="mt-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Custom message (optional)</label>
              <textarea
                className="w-full rounded-lg border border-border/50 bg-secondary/50 p-3 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Hi {customer_name}, we'd love your feedback…"
                value={csvMessage}
                onChange={(e) => setCsvMessage(e.target.value)}
              />
            </div>

            <Button
              className="w-full mt-4 glow-red-hover gap-2"
              onClick={handleBulkImport}
              disabled={importing || csvContacts.length === 0}
            >
              {importing
                ? <Loader2 size={16} className="animate-spin" />
                : <Upload size={16} />
              }
              {t("req.import_send")} {csvContacts.length > 0 ? `(${csvContacts.length})` : ""}
            </Button>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Requests;