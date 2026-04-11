"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
  Smartphone, Monitor, Star, Type
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useDesigns } from "@/contexts/DesignsContext";
import { get, patch, post, remove } from "@/lib/api";

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-green-500/15 text-green-400 border-green-500/30" },
  draft: { label: "Draft", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  archived: { label: "Archived", className: "bg-muted/50 text-muted-foreground border-border/50" },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const MyDesigns = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { designs, setDesigns, addDesign, updateDesign } = useDesigns();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [previewDesign, setPreviewDesign] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [cardActionLoading, setCardActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDesigns = async () => {
      try {
        setLoading(true);

        const [statsResponse, designsResponse] = await Promise.all([
          get("/api/admin/my-design/stats"),
          get("/api/admin/my-design", {
            status: statusFilter,
            search,
            page: 1,
            limit: 100,
          }),
        ]);

        if (cancelled) return;

        setStats(statsResponse?.data || { total: 0, active: 0, draft: 0, archived: 0 });
        setDesigns(Array.isArray(designsResponse?.data) ? designsResponse.data : []);
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Designs",
            description: error?.message || error?.error || "Unable to load designs.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDesigns();

    return () => { cancelled = true; };
  }, [search, setDesigns, statusFilter]);

  const refreshStats = async () => {
    const response = await get("/api/admin/my-design/stats");
    setStats(response?.data || { total: 0, active: 0, draft: 0, archived: 0 });
  };

  const openPreview = async (design) => {
    setPreviewDesign(design);
    try {
      const response = await get(`/api/admin/my-design/${design.id}`);
      if (response?.data) {
        setPreviewDesign(response.data);
        updateDesign(design.id, response.data);
      }
    } catch (error) {
      toast({
        title: "Designs",
        description: error?.message || error?.error || "Unable to load design details.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCardExport = async (design, format = "pdf") => {
    if (!design?.primaryCardUid) {
      toast({ title: "Designs", description: "No linked card available for export.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/nfc/cards/${design.primaryCardUid}/export?format=${format}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        let payload = {};
        try { payload = await response.json(); } catch {}
        throw new Error(payload?.error || "Unable to export card.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${design.name || "design-card"}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Designs",
        description: error?.message || "Unable to export card.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateCard = async (design) => {
    if (!design?.primaryCardUid) {
      toast({ title: "Designs", description: "No linked card available to regenerate.", variant: "destructive" });
      return;
    }

    try {
      setCardActionLoading(true);
      await post(`/api/admin/nfc/cards/${design.primaryCardUid}/regenerate`);
      const refreshed = await get(`/api/admin/my-design/${design.id}`);
      if (refreshed?.data) {
        setPreviewDesign(refreshed.data);
        updateDesign(design.id, refreshed.data);
      }
      toast({ title: "Designs", description: "Card exports regenerated." });
    } catch (error) {
      toast({
        title: "Designs",
        description: error?.error || "Unable to regenerate card exports.",
        variant: "destructive",
      });
    } finally {
      setCardActionLoading(false);
    }
  };

  const startRename = (design) => {
    setRenamingId(design.id);
    setRenameValue(design.name);
  };

  const commitRename = async () => {
    if (renamingId && renameValue.trim()) {
      try {
        const response = await patch(`/api/admin/my-design/${renamingId}/rename`, {
          name: renameValue.trim(),
        });
        if (response?.data) {
          updateDesign(renamingId, response.data);
        }
        toast({ title: "Design renamed", description: `Renamed to "${renameValue.trim()}"` });
      } catch (error) {
        toast({
          title: "Designs",
          description: error?.message || error?.error || "Unable to rename design.",
          variant: "destructive",
        });
      }
    }
    setRenamingId(null);
  };

  const handleDuplicate = async (design) => {
    try {
      const response = await post(`/api/admin/my-design/${design.id}/duplicate`);
      if (response?.data) {
        addDesign(response.data);
      }
      await refreshStats();
      toast({
        title: "Design duplicated",
        description: `"${response?.data?.name || `${design.name} (Copy)`}" created as draft.`,
      });
    } catch (error) {
      toast({
        title: "Designs",
        description: error?.message || error?.error || "Unable to duplicate design.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(`/api/admin/my-design/${deleteTarget.id}`);
      setDesigns(designs.filter((d) => d.id !== deleteTarget.id));
      await refreshStats();
      toast({ title: "Design deleted", description: `"${deleteTarget.name}" has been removed.` });
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: "Designs",
        description: error?.message || error?.error || "Unable to delete design.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (design) => {
    try {
      const response = await patch(`/api/admin/my-design/${design.id}/archive`);
      if (response?.data) {
        updateDesign(design.id, response.data);
      }
      await refreshStats();
      toast({ title: "Design archived" });
    } catch (error) {
      toast({
        title: "Designs",
        description: error?.message || error?.error || "Unable to archive design.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (design) => {
    try {
      const response = await patch(`/api/admin/my-design/${design.id}/restore`);
      if (response?.data) {
        updateDesign(design.id, response.data);
      }
      await refreshStats();
      toast({ title: "Design restored as draft" });
    } catch (error) {
      toast({
        title: "Designs",
        description: error?.message || error?.error || "Unable to restore design.",
        variant: "destructive",
      });
    }
  };

  const DesignCard = ({ design }) => {
    const statusCfg = STATUS_CONFIG[design.status];

    return (
      <motion.div variants={fadeUp} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden group hover:border-primary/30 transition-all">
        <div
          className="relative h-36 flex items-center justify-center cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${design.templateColor1}, ${design.templateColor2})` }}
          onClick={() => openPreview(design)}
        >
          <div className="text-center px-4">
            <div className="flex justify-center mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="#FBBF24" stroke="none" />)}
            </div>
            <p className="text-[10px] font-semibold truncate" style={{ color: design.templateColor1 === "#FFFFFF" ? "#0D0D0D" : "#FFFFFF" }}>
              {design.businessName}
            </p>
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-sm border-border/50">
              {design.orientation === "landscape" ? <Monitor size={10} className="mr-1" /> : <Smartphone size={10} className="mr-1" />}
              {design.orientation}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Eye size={24} className="text-foreground" />
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
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="h-6 text-sm px-1 py-0"
                  autoFocus
                />
              ) : (
                <h4 className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors" onDoubleClick={() => startRename(design)}>
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
                <DropdownMenuItem onClick={() => openPreview(design)}><Eye size={14} className="mr-2" />Preview</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/customize/edit-${design.id}`)}><Pencil size={14} className="mr-2" />Edit Design</DropdownMenuItem>
                <DropdownMenuItem onClick={() => startRename(design)}><Type size={14} className="mr-2" />Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(design)}><Copy size={14} className="mr-2" />Duplicate</DropdownMenuItem>
                {design.status !== "archived" && (
                  <DropdownMenuItem onClick={() => handleArchive(design)}><Archive size={14} className="mr-2" />Archive</DropdownMenuItem>
                )}
                {design.status === "archived" && (
                  <DropdownMenuItem onClick={() => handleRestore(design)}><FileText size={14} className="mr-2" />Restore as Draft</DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(design)}><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
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

  const DesignRow = ({ design }) => {
    const statusCfg = STATUS_CONFIG[design.status];

    return (
      <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-gradient-card p-3 hover:border-primary/30 transition-all">
        <div
          className="w-16 h-10 rounded-lg shrink-0 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${design.templateColor1}, ${design.templateColor2})` }}
          onClick={() => openPreview(design)}
        />
        <div className="min-w-0 flex-1">
          {renamingId === design.id ? (
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setRenamingId(null);
              }}
              className="h-6 text-sm px-1 py-0 max-w-[200px]"
              autoFocus
            />
          ) : (
            <p className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors" onDoubleClick={() => startRename(design)}>
              {design.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{design.businessName} · {design.template}</p>
        </div>
        <Badge variant="outline" className={`${statusCfg.className} shrink-0 hidden sm:flex`}>{statusCfg.label}</Badge>
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
            <DropdownMenuItem onClick={() => openPreview(design)}><Eye size={14} className="mr-2" />Preview</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/customize/edit-${design.id}`)}><Pencil size={14} className="mr-2" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => startRename(design)}><Type size={14} className="mr-2" />Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(design)}><Copy size={14} className="mr-2" />Duplicate</DropdownMenuItem>
            {design.status !== "archived" && (
              <DropdownMenuItem onClick={() => handleArchive(design)}><Archive size={14} className="mr-2" />Archive</DropdownMenuItem>
            )}
            {design.status === "archived" && (
              <DropdownMenuItem onClick={() => handleRestore(design)}><FileText size={14} className="mr-2" />Restore</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(design)}><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <DashboardLayout title={t("designs.my_title")} subtitle={t("designs.my_subtitle")}>
      <motion.div initial="hidden" animate="visible" className="space-y-6">

        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: Palette, color: "text-primary" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-400" },
            { label: "Drafts", value: stats.draft, icon: FileText, color: "text-yellow-400" },
            { label: "Archived", value: stats.archived, icon: Archive, color: "text-muted-foreground" },
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
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s].label}
              </button>
            ))}
            <div className="h-6 w-px bg-border/50 mx-1" />
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
              <List size={16} />
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={2}>
          {loading ? (
            <div className="text-center py-16 rounded-xl border border-border/50 bg-gradient-card">
              <Palette size={40} className="mx-auto text-muted-foreground/30 mb-4 animate-pulse" />
              <h3 className="font-display text-lg font-semibold mb-1">Loading designs...</h3>
              <p className="text-sm text-muted-foreground">Fetching your latest design data.</p>
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-border/50 bg-gradient-card">
              <Palette size={40} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-lg font-semibold mb-1">No designs found</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first card design from the product page.</p>
              <Button onClick={() => router.push("/products")} className="gap-2">
                <Plus size={14} /> Browse Products
              </Button>
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

      <DesignDetailModal
        design={previewDesign}
        onClose={() => setPreviewDesign(null)}
        onEdit={(design) => {
          setPreviewDesign(null);
          router.push(`/customize/edit-${design?.id}`);
        }}
        onDownloadCardExport={handleDownloadCardExport}
        onRegenerateCard={handleRegenerateCard}
        cardActionLoading={cardActionLoading}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Design</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{deleteTarget?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyDesigns;


