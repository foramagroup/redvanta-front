"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DesignDetailModal from "@/components/designs/DesignDetailModal";
import {
  Search, Grid3X3, List, MoreVertical, Pencil, Copy, Trash2, Eye,
  Palette, Clock, CheckCircle2, FileText, Archive, Plus, ExternalLink,
  Smartphone, Monitor, Star, Type, Loader2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// ─── Config statut ────────────────────────────────────────────
const STATUS_CONFIG = {
  active:   { label: "Active",   className: "bg-green-500/15 text-green-400 border-green-500/30" },
  draft:    { label: "Draft",    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  archived: { label: "Archived", className: "bg-muted/50 text-muted-foreground border-border/50" },
};

// ─── API helper ───────────────────────────────────────────────
// Authentification via cookie HttpOnly (sa_token / admin_token).
// credentials: "include" => le navigateur envoie automatiquement les cookies.
// Aucune lecture de localStorage — le token reste inaccessible au JS.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
  return data;
}

// ─────────────────────────────────────────────────────────────
const MyDesigns = () => {
  const { t } = useLanguage();
  const router = useRouter();

  // ── État local ──────────────────────────────────────────────
  const [designs, setDesigns]         = useState([]);
  const [stats, setStats]             = useState({ total: 0, active: 0, draft: 0, archived: 0 });
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setAction]    = useState(null);

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("all");
  const [viewMode, setViewMode]       = useState("grid");

  const [previewDesign, setPreview]   = useState(null);
  const [deleteTarget, setDelete]     = useState(null);
  const [renamingId, setRenamingId]   = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // ── Chargement ──────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const { data } = await apiFetch("/admin/my-design/stats");
      setStats(data);
    } catch (e) {
      console.error("[designs] stats:", e.message);
    }
  }, []);

  const loadDesigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, limit: "50" });
      if (search.trim()) params.set("search", search.trim());
      const { data } = await apiFetch(`/admin/my-design?${params}`);
      setDesigns(data ?? []);
    } catch (e) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => loadDesigns(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [loadDesigns, search, statusFilter]);

  // ── Rename ──────────────────────────────────────────────────
  const startRename = (design) => {
    setRenamingId(design.id);
    setRenameValue(design.name);
  };

  const commitRename = async () => {
    const id    = renamingId;
    const value = renameValue.trim();
    setRenamingId(null);
    if (!id || !value) return;

    setAction(`rename-${id}`);
    try {
      const { data } = await apiFetch(`/admin/my-design/${id}/rename`, {
        method: "PATCH",
        body: JSON.stringify({ name: value }),
      });
      setDesigns((prev) => prev.map((d) => (d.id === id ? data : d)));
      toast({ title: "Design renommé", description: `Renommé en "${value}"` });
    } catch (e) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setAction(null);
    }
  };

  // ── Dupliquer ────────────────────────────────────────────────
  const handleDuplicate = async (design) => {
    setAction(`dup-${design.id}`);
    try {
      const { data } = await apiFetch(`/admin/my-design/${design.id}/duplicate`, {
        method: "POST",
      });
      setDesigns((prev) => [data, ...prev]);
      setStats((s) => ({ ...s, total: s.total + 1, draft: s.draft + 1 }));
      toast({ title: "Design dupliqué", description: `"${data.name}" créé comme brouillon.` });
    } catch (e) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setAction(null);
    }
  };

  // ── Supprimer ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDelete(null);
    setAction(`del-${id}`);
    try {
      await apiFetch(`/admin/my-design/${id}`, { method: "DELETE" });
      const removed = designs.find((d) => d.id === id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      if (removed) {
        const key = removed.status === "active" ? "active" : removed.status;
        setStats((s) => ({
          ...s,
          total: s.total - 1,
          [key]: Math.max(0, s[key] - 1),
        }));
      }
      toast({ title: "Design supprimé", description: `"${deleteTarget.name}" supprimé.` });
    } catch (e) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setAction(null);
    }
  };

  // ── Archiver ────────────────────────────────────────────────
  const handleArchive = async (design) => {
    setAction(`arch-${design.id}`);
    try {
      const { data } = await apiFetch(`/admin/my-design/${design.id}/archive`, {
        method: "PATCH",
      });
      setDesigns((prev) => prev.map((d) => (d.id === design.id ? data : d)));
      const key = design.status === "active" ? "active" : "draft";
      setStats((s) => ({
        ...s,
        archived: s.archived + 1,
        [key]: Math.max(0, s[key] - 1),
      }));
      toast({ title: "Design archivé" });
    } catch (e) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setAction(null);
    }
  };

  // ── Restaurer ────────────────────────────────────────────────
  const handleRestore = async (design) => {
    setAction(`restore-${design.id}`);
    try {
      const { data } = await apiFetch(`/admin/my-design/${design.id}/restore`, {
        method: "PATCH",
      });
      setDesigns((prev) => prev.map((d) => (d.id === design.id ? data : d)));
      setStats((s) => ({ ...s, archived: Math.max(0, s.archived - 1), draft: s.draft + 1 }));
      toast({ title: "Design restauré comme brouillon" });
    } catch (e) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setAction(null);
    }
  };

  // ─── DesignCard ──────────────────────────────────────────────
  const DesignCard = ({ design }) => {
    const statusCfg = STATUS_CONFIG[design.status] ?? STATUS_CONFIG.draft;
    const busy = actionLoading?.startsWith(`${design.id}`) || actionLoading === `rename-${design.id}`;

    return (
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden group hover:border-primary/30 transition-all"
      >
        <div
          className="relative h-36 flex items-center justify-center cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${design.templateColor1}, ${design.templateColor2})` }}
          onClick={() => setPreview(design)}
        >
          <div className="text-center px-4">
            <div className="flex justify-center mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} fill="#FBBF24" stroke="none" />
              ))}
            </div>
            <p
              className="text-[10px] font-semibold truncate"
              style={{ color: design.templateColor1 === "#FFFFFF" ? "#0D0D0D" : "#FFFFFF" }}
            >
              {design.businessName}
            </p>
          </div>

          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-sm border-border/50">
              {design.orientation === "landscape"
                ? <Monitor size={10} className="mr-1" />
                : <Smartphone size={10} className="mr-1" />}
              {design.orientation}
            </Badge>
          </div>

          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            {busy
              ? <Loader2 size={20} className="animate-spin text-foreground" />
              : <Eye size={24} className="text-foreground" />}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {renamingId === design.id ? (
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")  commitRename();
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="h-6 text-sm px-1 py-0"
                  autoFocus
                />
              ) : (
                <h4
                  className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                  onDoubleClick={() => startRename(design)}
                >
                  {design.name}
                </h4>
              )}
              <p className="text-xs text-muted-foreground truncate">{design.template} · {design.model}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0">
                  <MoreVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setPreview(design)}>
                  <Eye size={14} className="mr-2" />Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/customize/edit-${design.id}`)}>
                  <Pencil size={14} className="mr-2" />Edit Design
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => startRename(design)}>
                  <Type size={14} className="mr-2" />Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(design)}>
                  <Copy size={14} className="mr-2" />Duplicate
                </DropdownMenuItem>
                {design.status !== "archived" && (
                  <DropdownMenuItem onClick={() => handleArchive(design)}>
                    <Archive size={14} className="mr-2" />Archive
                  </DropdownMenuItem>
                )}
                {design.status === "archived" && (
                  <DropdownMenuItem onClick={() => handleRestore(design)}>
                    <FileText size={14} className="mr-2" />Restore as Draft
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive" onClick={() => setDelete(design)}>
                  <Trash2 size={14} className="mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className={statusCfg.className}>{statusCfg.label}</Badge>
            {design.linkedCard && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ExternalLink size={10} />
                {design.linkedCard}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock size={10} /> Updated {design.updatedAt}
          </div>
        </div>
      </motion.div>
    );
  };

  // ─── DesignRow ───────────────────────────────────────────────
  const DesignRow = ({ design }) => {
    const statusCfg = STATUS_CONFIG[design.status] ?? STATUS_CONFIG.draft;

    return (
      <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-gradient-card p-3 hover:border-primary/30 transition-all">
        <div
          className="w-16 h-10 rounded-lg shrink-0 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${design.templateColor1}, ${design.templateColor2})` }}
          onClick={() => setPreview(design)}
        />
        <div className="min-w-0 flex-1">
          {renamingId === design.id ? (
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter")  commitRename();
                if (e.key === "Escape") setRenamingId(null);
              }}
              className="h-6 text-sm px-1 py-0 max-w-[200px]"
              autoFocus
            />
          ) : (
            <p
              className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors"
              onDoubleClick={() => startRename(design)}
            >
              {design.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{design.businessName} · {design.template}</p>
        </div>

        <Badge variant="outline" className={`${statusCfg.className} shrink-0 hidden sm:flex`}>
          {statusCfg.label}
        </Badge>
        <span className="text-xs text-muted-foreground hidden md:block shrink-0">{design.model}</span>
        <span className="text-xs text-muted-foreground hidden md:block shrink-0 capitalize">{design.orientation}</span>
        <span className="text-xs text-muted-foreground hidden lg:block shrink-0">{design.updatedAt}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0">
              <MoreVertical size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setPreview(design)}>
              <Eye size={14} className="mr-2" />Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/customize/edit-${design.id}`)}>
              <Pencil size={14} className="mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startRename(design)}>
              <Type size={14} className="mr-2" />Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(design)}>
              <Copy size={14} className="mr-2" />Duplicate
            </DropdownMenuItem>
            {design.status !== "archived" && (
              <DropdownMenuItem onClick={() => handleArchive(design)}>
                <Archive size={14} className="mr-2" />Archive
              </DropdownMenuItem>
            )}
            {design.status === "archived" && (
              <DropdownMenuItem onClick={() => handleRestore(design)}>
                <FileText size={14} className="mr-2" />Restore
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={() => setDelete(design)}>
              <Trash2 size={14} className="mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // ─── Rendu ───────────────────────────────────────────────────
  return (
    <DashboardLayout title={t("designs.my_title")} subtitle={t("designs.my_subtitle")}>
      <motion.div initial="hidden" animate="visible" className="space-y-6">

        {/* Stats */}
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",    value: stats.total,    icon: Palette,      color: "text-primary" },
            { label: "Active",   value: stats.active,   icon: CheckCircle2, color: "text-green-400" },
            { label: "Drafts",   value: stats.draft,    icon: FileText,     color: "text-yellow-400" },
            { label: "Archived", value: stats.archived, icon: Archive,      color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-gradient-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Filtres */}
        <motion.div variants={fadeUp} custom={1} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search designs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            {["all", "active", "draft", "archived"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s].label}
              </button>
            ))}
            <div className="h-6 w-px bg-border/50 mx-1" />
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </motion.div>

        {/* Liste */}
        <motion.div variants={fadeUp} custom={2}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-border/50 bg-gradient-card">
              <Palette size={40} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-lg font-semibold mb-1">No designs found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || statusFilter !== "all"
                  ? "Try a different search or filter."
                  : "Create your first card design from the product page."}
              </p>
              {!search && statusFilter === "all" && (
                <Button onClick={() => router.push("/products")} className="gap-2">
                  <Plus size={14} /> Browse Products
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {designs.map((d) => <DesignCard key={d.id} design={d} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {designs.map((d) => <DesignRow key={d.id} design={d} />)}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal preview */}
      <DesignDetailModal
        design={previewDesign}
        onClose={() => setPreview(null)}
        onEdit={(design) => {
          setPreview(null);
          router.push(`/customize/edit-${design?.id}`);
        }}
      />

      {/* Dialog suppression */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Design</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyDesigns;