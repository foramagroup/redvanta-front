"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Palette, CheckCircle2, Users, Flag,
  MoreVertical, Eye, Cpu, Download, RefreshCw,
  FileImage, FileType2, FileText, QrCode,
  ChevronLeft, ChevronRight, Wifi, WifiOff,
  Activity, MapPin,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";

// ─── Config ───────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const ITEMS_PER_PAGE = 20;

// ─── Status NFC Card ──────────────────────────────────────────
const STATUS_CONFIG = {
  NOT_PROGRAMMED: { label: "Not Programmed", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  PRINTED:        { label: "Printed",        className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  SHIPPED:        { label: "Shipped",        className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  DELIVERED:      { label: "Delivered",      className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  ACTIVE:         { label: "Active",         className: "bg-green-500/15 text-green-400 border-green-500/30" },
  DISABLED:       { label: "Disabled",       className: "bg-muted/50 text-muted-foreground border-border/50" },
};

// Statuts de commande disponibles pour le superadmin
const STATUS_TRANSITIONS = [
  { value: "not_programmed", label: "Not Programmed" },
  { value: "printed",        label: "Printed" },
  { value: "shipped",        label: "Shipped" },
  { value: "delivered",      label: "Delivered (Activates card)" },
];

function getStatusCfg(status) {
  return STATUS_CONFIG[status] ?? { label: status, className: "bg-muted/50 text-muted-foreground border-border/50" };
}

// ─── Helpers ──────────────────────────────────────────────────
function fmt(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API}${url}`;
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.message || `Error ${res.status}`);
  return json;
}

async function downloadFile(url, filename) {
  const res = await fetch(fmt(url), { credentials: "include" });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

// ─── Composant principal ──────────────────────────────────────
const AllDesigns = () => {
  const { t } = useLanguage();

  // Data
  const [cards, setCards]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Filtres
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]               = useState(1);

  // Stats locales calculées
  const [stats, setStats] = useState({ total: 0, active: 0, companies: 0, flagged: 0 });

  // Modals
  const [viewCard, setViewCard]       = useState(null);
  const [statusCard, setStatusCard]   = useState(null);
  const [newStatus, setNewStatus]     = useState("");
  const [regenCard, setRegenCard]     = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [downloading, setDownloading] = useState("");

  // ── Chargement des cartes ───────────────────────────────────
  const loadCards = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: String(ITEMS_PER_PAGE),
      });
      if (search.trim())           params.set("search", search.trim());
      if (statusFilter !== "all")  params.set("status", statusFilter);

      const json = await apiFetch(`/superadmin/nfc/cards?${params}`);
      const data = json.data || [];
      setCards(data);
      setTotal(json.meta?.total || data.length);

      // Stats depuis les données retournées
      setStats({
        total:     json.meta?.total || data.length,
        active:    data.filter(c => c.active).length,
        companies: new Set(data.map(c => c.companyId)).size,
        flagged:   data.filter(c => c.status === "DISABLED").length,
      });
    } catch (e) {
      setError(e.message);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { loadCards(); }, [loadCards]);

  // Reset page quand on change filtre ou recherche
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // ── Changer le statut d'une carte ──────────────────────────
  const handleStatusChange = async () => {
    if (!statusCard || !newStatus) return;
    setSubmitting(true);
    try {
      await apiFetch(`/superadmin/nfc/cards/${statusCard.uid}/status`, {
        method: "PATCH",
        body:   JSON.stringify({ status: newStatus }),
      });
      toast({
        title:       "Statut mis à jour",
        description: `Carte ${statusCard.uid.slice(0, 8)}... → ${newStatus}`,
      });
      setStatusCard(null);
      setNewStatus("");
      loadCards();
    } catch (e) {
      toast({ title: "Erreur", description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Regénérer le QR Code ────────────────────────────────────
  const handleRegenQr = async () => {
    if (!regenCard) return;
    setSubmitting(true);
    try {
      await apiFetch(`/superadmin/nfc/cards/${regenCard.uid}/regenerate-qr`, {
        method: "PATCH",
      });
      toast({
        title:       "QR Code regénéré",
        description: `uid: ${regenCard.uid.slice(0, 8)}...`,
      });
      setRegenCard(null);
      loadCards();
    } catch (e) {
      toast({ title: "Erreur", description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Téléchargements ─────────────────────────────────────────
  // Export fiche d'impression (recto + verso) : SVG / PNG / PDF
  const handleExportCard = async (card, format) => {
    const key = `${card.uid}-${format}`;
    setDownloading(key);
    try {
      // GET /superadmin/nfc/cards/:uid/export?format=svg|png|pdf
      const res = await fetch(
        `${API}/superadmin/nfc/cards/${card.uid}/export?format=${format}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Erreur téléchargement");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `card-${card.uid.slice(0, 8)}.${format}`;
      a.click();
      URL.revokeObjectURL(href);
      toast({ title: `Fiche ${format.toUpperCase()} téléchargée` });
    } catch (e) {
      toast({ title: "Erreur", description: e.message });
    } finally {
      setDownloading("");
    }
  };

  // Télécharger QR Code seul
  const handleDownloadQr = async (card, format) => {
    const key = `qr-${card.uid}-${format}`;
    setDownloading(key);
    try {
      // GET /superadmin/nfc/cards/:uid/qr?format=svg|png|pdf
      const res = await fetch(
        `${API}/superadmin/nfc/cards/${card.uid}/qr?format=${format}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        // Fallback : utiliser l'URL directe stockée en DB
        if (format === "svg" && card.qrCodeUrl) {
          await downloadFile(card.qrCodeUrl, `qr-${card.uid.slice(0, 8)}.svg`);
        } else if (format === "png" && card.qrCodePngUrl) {
          await downloadFile(card.qrCodePngUrl, `qr-${card.uid.slice(0, 8)}.png`);
        } else if (format === "pdf" && card.qrCodePdfUrl) {
          await downloadFile(card.qrCodePdfUrl, `qr-${card.uid.slice(0, 8)}.pdf`);
        } else {
          throw new Error("Fichier non disponible");
        }
      } else {
        const blob = await res.blob();
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `qr-${card.uid.slice(0, 8)}.${format}`;
        a.click();
        URL.revokeObjectURL(href);
      }
      toast({ title: `QR Code ${format.toUpperCase()} téléchargé` });
    } catch (e) {
      toast({ title: "Erreur", description: e.message });
    } finally {
      setDownloading("");
    }
  };

  // ── Pagination ──────────────────────────────────────────────
  const lastPage = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const renderPagination = () => (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
        <ChevronLeft size={14} />
      </Button>
      {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
        const n = lastPage <= 5 ? i + 1 : Math.max(1, page - 2) + i;
        if (n > lastPage) return null;
        return (
          <Button key={n} size="sm" variant={page === n ? "default" : "outline"}
            onClick={() => setPage(n)} className="w-8 text-xs">{n}</Button>
        );
      })}
      <Button size="sm" variant="outline" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>
        <ChevronRight size={14} />
      </Button>
    </div>
  );

  // ── Rendu ────────────────────────────────────────────────────
  return (
    <SuperAdminLayout title={t("designs.all_title")} subtitle={t("designs.all_subtitle")}>
      <motion.div initial="hidden" animate="visible" className="space-y-6">

        {/* ── Stats ── */}
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Cards",    value: loading ? "…" : total,          icon: Palette,     color: "text-primary" },
            { label: "Active",         value: loading ? "…" : stats.active,   icon: CheckCircle2,color: "text-green-400" },
            { label: "Companies",      value: loading ? "…" : stats.companies,icon: Users,       color: "text-blue-400" },
            { label: "Disabled",       value: loading ? "…" : stats.flagged,  icon: Flag,        color: "text-red-400" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-gradient-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Filtres ── */}
        <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by uid, location, company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "NOT_PROGRAMMED", "PRINTED", "SHIPPED", "ACTIVE", "DISABLED"].map(s => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {s === "all" ? "All" : getStatusCfg(s).label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={loadCards} className="shrink-0">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </motion.div>

        {/* ── Erreur ── */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* ── Table ── */}
        <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Card / Design</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Company</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Location</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Scans</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                      <RefreshCw size={20} className="mx-auto mb-2 animate-spin opacity-40" />
                      Loading cards...
                    </td>
                  </tr>
                ) : cards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <Palette size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No NFC cards found.</p>
                    </td>
                  </tr>
                ) : (
                  cards.map(card => {
                    const statusCfg = getStatusCfg(card.status);
                    const bgColor   = card.design?.bgColor     || "#0B0D0F";
                    const accent    = card.design?.accentColor  || "#E10600";

                    return (
                      <tr key={card.uid} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">

                        {/* Card / Design */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* Miniature colorée du design */}
                            <div
                              className="w-10 h-7 rounded-md shrink-0 cursor-pointer relative overflow-hidden"
                              style={{ background: `linear-gradient(135deg, ${bgColor}, ${accent}22)` }}
                              onClick={() => setViewCard(card)}
                            >
                              {card.qrCodeUrl && (
                                <img
                                  src={fmt(card.qrCodeUrl)}
                                  alt="QR"
                                  className="absolute inset-0 w-full h-full object-contain p-0.5 opacity-80"
                                />
                              )}
                              {!card.qrCodeUrl && (
                                <QrCode size={12} className="absolute inset-0 m-auto opacity-40 text-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate font-mono text-xs text-muted-foreground">
                                {card.uid?.slice(0, 8)}…
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {card.design?.businessName || card.locationName || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm truncate">{card.companyName || "—"}</p>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <MapPin size={10} className="text-muted-foreground shrink-0" />
                            <span className="text-xs truncate text-muted-foreground">
                              {card.locationName || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={statusCfg.className}>
                              {statusCfg.label}
                            </Badge>
                            {card.active
                              ? <span className="flex items-center gap-1 text-[10px] text-green-400"><Wifi size={8} />Active</span>
                              : <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><WifiOff size={8} />Inactive</span>
                            }
                          </div>
                        </td>

                        {/* Scans */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Activity size={12} className="text-muted-foreground" />
                            <span className="text-sm">{card.scanCount ?? 0}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                                <MoreVertical size={14} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">

                              {/* Vue détaillée */}
                              <DropdownMenuItem onClick={() => setViewCard(card)}>
                                <Eye size={14} className="mr-2" />View Details
                              </DropdownMenuItem>

                              {/* Changer statut */}
                              <DropdownMenuItem onClick={() => { setStatusCard(card); setNewStatus(""); }}>
                                <Cpu size={14} className="mr-2" />Change Status
                              </DropdownMenuItem>

                              {/* Regénérer QR */}
                              <DropdownMenuItem onClick={() => setRegenCard(card)}>
                                <RefreshCw size={14} className="mr-2" />Regenerate QR Code
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* ── Téléchargements fiche impression ── */}
                              <p className="text-[10px] text-muted-foreground px-2 py-1 font-medium">
                                Card Sheet (Recto + Verso)
                              </p>
                              <DropdownMenuItem
                                disabled={!!downloading}
                                onClick={() => handleExportCard(card, "svg")}
                              >
                                <FileType2 size={14} className="mr-2 text-blue-400" />
                                {downloading === `${card.uid}-svg` ? "Downloading…" : "SVG (vectoriel)"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!!downloading}
                                onClick={() => handleExportCard(card, "png")}
                              >
                                <FileImage size={14} className="mr-2 text-green-400" />
                                {downloading === `${card.uid}-png` ? "Downloading…" : "PNG (300 DPI)"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!!downloading}
                                onClick={() => handleExportCard(card, "pdf")}
                              >
                                <FileText size={14} className="mr-2 text-red-400" />
                                {downloading === `${card.uid}-pdf` ? "Downloading…" : "PDF (imprimeur)"}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* ── Téléchargements QR Code seul ── */}
                              <p className="text-[10px] text-muted-foreground px-2 py-1 font-medium">
                                QR Code only
                              </p>
                              <DropdownMenuItem
                                disabled={!!downloading || !card.qrCodeUrl}
                                onClick={() => handleDownloadQr(card, "svg")}
                              >
                                <Download size={14} className="mr-2 text-blue-400" />
                                {downloading === `qr-${card.uid}-svg` ? "Downloading…" : "QR SVG"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!!downloading || (!card.qrCodePngUrl && !card.qrCodeUrl)}
                                onClick={() => handleDownloadQr(card, "png")}
                              >
                                <Download size={14} className="mr-2 text-green-400" />
                                {downloading === `qr-${card.uid}-png` ? "Downloading…" : "QR PNG"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!!downloading}
                                onClick={() => handleDownloadQr(card, "pdf")}
                              >
                                <Download size={14} className="mr-2 text-red-400" />
                                {downloading === `qr-${card.uid}-pdf` ? "Downloading…" : "QR PDF"}
                              </DropdownMenuItem>

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {total === 0 ? "0" : `${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, total)}`} of {total} cards
            </span>
            {renderPagination()}
          </div>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL — Vue détaillée d'une carte                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Sheet open={!!viewCard} onOpenChange={() => setViewCard(null)}>
        <SheetContent className="bg-card border-border/50 sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Card Details</SheetTitle>
          </SheetHeader>
          {viewCard && (
            <div className="space-y-4 mt-6">

              {/* QR Code preview */}
              {viewCard.qrCodeUrl && (
                <div className="flex justify-center">
                  <div
                    className="w-32 h-32 rounded-xl p-2 flex items-center justify-center"
                    style={{ background: viewCard.design?.bgColor || "#0B0D0F" }}
                  >
                    <img src={fmt(viewCard.qrCodeUrl)} alt="QR Code" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              {/* Infos */}
              {[
                { label: "UID",             value: viewCard.uid },
                { label: "Status",          value: getStatusCfg(viewCard.status).label },
                { label: "Active",          value: viewCard.active ? "Yes" : "No" },
                { label: "Company",         value: viewCard.companyName || "—" },
                { label: "Location",        value: viewCard.locationName || "—" },
                { label: "Address",         value: viewCard.locationAddress || "—" },
                { label: "Business Name",   value: viewCard.design?.businessName || "—" },
                { label: "Card Model",      value: viewCard.design?.cardModel || "—" },
                { label: "Orientation",     value: viewCard.design?.orientation || "—" },
                { label: "Google Place ID", value: viewCard.googlePlaceId || "—" },
                { label: "Scan Count",      value: viewCard.scanCount ?? 0 },
                { label: "Google Redirects",value: viewCard.googleRedirectCount ?? 0 },
                { label: "Last Scanned",    value: viewCard.lastScannedAt ? new Date(viewCard.lastScannedAt).toLocaleString() : "Never" },
                { label: "Generated At",    value: viewCard.generatedAt ? new Date(viewCard.generatedAt).toLocaleDateString() : "—" },
                { label: "Activated At",    value: viewCard.activatedAt ? new Date(viewCard.activatedAt).toLocaleDateString() : "Not yet" },
                { label: "NFC Chip",        value: viewCard.tagSerial ? `${viewCard.chipType || ""} #${viewCard.tagSerial}` : "Not assigned" },
              ].map(item => (
                <div key={item.label} className="flex justify-between border-b border-border/50 pb-2 gap-4">
                  <span className="text-sm text-muted-foreground shrink-0">{item.label}</span>
                  <span className="text-sm font-medium text-right break-all">{item.value}</span>
                </div>
              ))}

              {/* Boutons téléchargement depuis la sheet */}
              <div className="pt-2 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Download Card Sheet (Recto + Verso)</p>
                <div className="flex gap-2">
                  {["svg", "png", "pdf"].map(fmt => (
                    <Button key={fmt} size="sm" variant="outline" className="flex-1"
                      disabled={!!downloading}
                      onClick={() => handleExportCard(viewCard, fmt)}
                    >
                      {fmt.toUpperCase()}
                    </Button>
                  ))}
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-2 mt-3">Download QR Code only</p>
                <div className="flex gap-2">
                  {["svg", "png", "pdf"].map(f => (
                    <Button key={f} size="sm" variant="outline" className="flex-1"
                      disabled={!!downloading}
                      onClick={() => handleDownloadQr(viewCard, f)}
                    >
                      QR {f.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL — Changer le statut                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Dialog open={!!statusCard} onOpenChange={() => { setStatusCard(null); setNewStatus(""); }}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Card Status</DialogTitle>
          </DialogHeader>
          {statusCard && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UID</span>
                  <span className="font-mono text-xs">{statusCard.uid?.slice(0, 12)}…</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current status</span>
                  <Badge variant="outline" className={getStatusCfg(statusCard.status).className}>
                    {getStatusCfg(statusCard.status).label}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Select new status :</p>
                <div className="space-y-2">
                  {STATUS_TRANSITIONS.map(s => (
                    <button key={s.value}
                      onClick={() => setNewStatus(s.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        newStatus === s.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 hover:bg-secondary"
                      }`}
                    >
                      {s.label}
                      {s.value === "delivered" && (
                        <span className="ml-2 text-xs text-green-400">→ active: true</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setStatusCard(null); setNewStatus(""); }}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={!newStatus || submitting}>
              {submitting ? "Updating…" : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL — Regénérer le QR Code                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Dialog open={!!regenCard} onOpenChange={() => setRegenCard(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerate QR Code</DialogTitle>
          </DialogHeader>
          {regenCard && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This will regenerate the SVG, PNG and PDF QR Code files for this card.
                The UID and the payload encoded in the physical NFC chip will NOT change.
              </p>
              <div className="bg-secondary rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UID</span>
                  <span className="font-mono text-xs">{regenCard.uid?.slice(0, 16)}…</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">QR Code URL</span>
                  <span className="text-xs text-muted-foreground">
                    {regenCard.qrCodeUrl ? "Exists" : "Missing"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegenCard(null)}>Cancel</Button>
            <Button onClick={handleRegenQr} disabled={submitting}>
              {submitting ? "Regenerating…" : "Regenerate QR Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </SuperAdminLayout>
  );
};

export default AllDesigns;

