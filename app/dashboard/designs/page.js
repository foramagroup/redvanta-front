"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useRouter } from "next/navigation";
import { useDesigns } from "@/contexts/DesignsContext";

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-green-500/15 text-green-400 border-green-500/30" },
  draft: { label: "Draft", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  archived: { label: "Archived", className: "bg-muted/50 text-muted-foreground border-border/50" },
};

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

  const filtered = designs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.businessName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const startRename = (design) => {
    setRenamingId(design.id);
    setRenameValue(design.name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      updateDesign(renamingId, { name: renameValue.trim(), updatedAt: new Date().toISOString().split("T")[0] });
      toast({ title: "Design renamed", description: `Renamed to "${renameValue.trim()}"` });
    }
    setRenamingId(null);
  };

  const stats = {
    total: designs.length,
    active: designs.filter(d => d.status === "active").length,
    draft: designs.filter(d => d.status === "draft").length,
    archived: designs.filter(d => d.status === "archived").length,
  };

  const handleDuplicate = (design) => {
    const copy = {
      ...design,
      id: `d-${Date.now()}`,
      name: `${design.name} (Copy)`,
      status: "draft",
      linkedCard: null,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    addDesign(copy);
    toast({ title: "Design duplicated", description: `"${copy.name}" created as draft.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDesigns(designs.filter(d => d.id !== deleteTarget.id));
    toast({ title: "Design deleted", description: `"${deleteTarget.name}" has been removed.` });
    setDeleteTarget(null);
  };

  const handleArchive = (design) => {
    setDesigns(designs.map(d => d.id === design.id ? { ...d, status: "archived", updatedAt: new Date().toISOString().split("T")[0] } : d));
    toast({ title: "Design archived" });
  };

  const handleRestore = (design) => {
    setDesigns(designs.map(d => d.id === design.id ? { ...d, status: "draft", updatedAt: new Date().toISOString().split("T")[0] } : d));
    toast({ title: "Design restored as draft" });
  };

  const DesignCard = ({ design }) => {
    const statusCfg = STATUS_CONFIG[design.status];
    return (
      <motion.div variants={fadeUp} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden group hover:border-primary/30 transition-all">
        {/* Visual preview */}
        <div
          className="relative h-36 flex items-center justify-center cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${design.templateColor1}, ${design.templateColor2})` }}
          onClick={() => setPreviewDesign(design)}
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

        {/* Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {renamingId === design.id ? (
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                  className="h-6 text-sm px-1 py-0"
                  autoFocus
                />
              ) : (
                <h4 className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors" onDoubleClick={() => startRename(design)}>{design.name}</h4>
              )}
              <p className="text-xs text-muted-foreground truncate">{design.template} · {design.model}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0"><MoreVertical size={14} /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setPreviewDesign(design)}><Eye size={14} className="mr-2" />Preview</DropdownMenuItem>
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
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><ExternalLink size={10} />{design.linkedCard}</span>
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
          onClick={() => setPreviewDesign(design)}
        />
        <div className="min-w-0 flex-1">
          {renamingId === design.id ? (
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
              className="h-6 text-sm px-1 py-0 max-w-[200px]"
              autoFocus
            />
          ) : (
            <p className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors" onDoubleClick={() => startRename(design)}>{design.name}</p>
          )}
          <p className="text-xs text-muted-foreground">{design.businessName} · {design.template}</p>
        </div>
        <Badge variant="outline" className={`${statusCfg.className} shrink-0 hidden sm:flex`}>{statusCfg.label}</Badge>
        <span className="text-xs text-muted-foreground hidden md:block shrink-0">{design.model}</span>
        <span className="text-xs text-muted-foreground hidden md:block shrink-0 capitalize">{design.orientation}</span>
        <span className="text-xs text-muted-foreground hidden lg:block shrink-0">{design.updatedAt}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0"><MoreVertical size={14} /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setPreviewDesign(design)}><Eye size={14} className="mr-2" />Preview</DropdownMenuItem>
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

        {/* Stats */}
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: Palette, color: "text-primary" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-400" },
            { label: "Drafts", value: stats.draft, icon: FileText, color: "text-yellow-400" },
            { label: "Archived", value: stats.archived, icon: Archive, color: "text-muted-foreground" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border/50 bg-gradient-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="font-display text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Toolbar */}
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
            {["all", "active", "draft", "archived"].map(s => (
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

        {/* Design list */}
        <motion.div variants={fadeUp} custom={2}>
          {filtered.length === 0 ? (
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
              {filtered.map(d => <DesignCard key={d.id} design={d} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(d => <DesignRow key={d.id} design={d} />)}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDesign} onOpenChange={() => setPreviewDesign(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewDesign?.name}</DialogTitle>
            <DialogDescription>{previewDesign?.businessName} · {previewDesign?.template}</DialogDescription>
          </DialogHeader>
          {previewDesign && (
            <div className="space-y-4">
              <div
                className="w-full rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${previewDesign.templateColor1}, ${previewDesign.templateColor2})`,
                  aspectRatio: previewDesign.orientation === "landscape" ? "16/10" : "10/16",
                  maxHeight: "320px",
                }}
              >
                <div className="text-center px-6">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#FBBF24" stroke="none" />)}
                  </div>
                  <p className="text-sm font-bold" style={{ color: previewDesign.templateColor1 === "#FFFFFF" ? "#0D0D0D" : "#FFFFFF" }}>
                    {previewDesign.businessName}
                  </p>
                  <p className="text-[10px] mt-1 opacity-70" style={{ color: previewDesign.templateColor1 === "#FFFFFF" ? "#0D0D0D" : "#FFFFFF" }}>
                    {previewDesign.frontInstructions}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground text-xs">Model</span><p className="font-medium">{previewDesign.model}</p></div>
                <div><span className="text-muted-foreground text-xs">Orientation</span><p className="font-medium capitalize">{previewDesign.orientation}</p></div>
                <div><span className="text-muted-foreground text-xs">Status</span><Badge variant="outline" className={STATUS_CONFIG[previewDesign.status].className}>{STATUS_CONFIG[previewDesign.status].label}</Badge></div>
                <div><span className="text-muted-foreground text-xs">Linked Card</span><p className="font-medium">{previewDesign.linkedCard || "—"}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground text-xs">Front Instructions</span><p className="text-xs">{previewDesign.frontInstructions}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground text-xs">Back Instructions</span><p className="text-xs">{previewDesign.backInstructions}</p></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewDesign(null)}>Close</Button>
              <Button onClick={() => { setPreviewDesign(null); router.push(`/customize/edit-${previewDesign?.id}`); }} className="gap-2">
                <Pencil size={14} /> Edit Design
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
