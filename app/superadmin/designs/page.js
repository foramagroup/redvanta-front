"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Palette, CheckCircle2, FileText, Archive, Users, Clock,
  MoreVertical, Eye, Flag, Trash2, Download, Filter
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

const MOCK_DESIGNS = [
  { id: "d-1", name: "Bella's Main Card", businessName: "Bella's Italian Kitchen", template: "Crimson Noir", templateColor1: "#B91C1C", templateColor2: "#0D0D0D", orientation: "landscape", model: "Premium", status: "active", userId: "u-1", userEmail: "bella@kitchen.com", userName: "Maria Rossi", createdAt: "2025-01-15", updatedAt: "2025-02-20" },
  { id: "d-2", name: "Summit Portrait", businessName: "Summit Dental Care", template: "Midnight Gold", templateColor1: "#1E1B4B", templateColor2: "#0F172A", orientation: "portrait", model: "Metal", status: "active", userId: "u-2", userEmail: "admin@summitdental.com", userName: "Dr. James Cole", createdAt: "2025-01-20", updatedAt: "2025-03-01" },
  { id: "d-3", name: "Auto Draft", businessName: "Elite Auto Service", template: "Arctic Fire", templateColor1: "#FFFFFF", templateColor2: "#F1F5F9", orientation: "landscape", model: "Classic", status: "draft", userId: "u-3", userEmail: "mike@eliteauto.com", userName: "Mike Torres", createdAt: "2025-02-10", updatedAt: "2025-02-10" },
  { id: "d-4", name: "Suspicious Design", businessName: "Quick Cash Store", template: "Neon Matrix", templateColor1: "#0A0A0A", templateColor2: "#000000", orientation: "landscape", model: "Classic", status: "flagged", userId: "u-4", userEmail: "test@spam.com", userName: "Unknown User", createdAt: "2025-03-01", updatedAt: "2025-03-02" },
  { id: "d-5", name: "Zen Spa Card", businessName: "Zen Spa & Wellness", template: "Lavender Dream", templateColor1: "#F5F3FF", templateColor2: "#EDE9FE", orientation: "landscape", model: "Premium", status: "active", userId: "u-5", userEmail: "hello@zenspa.com", userName: "Sarah Lin", createdAt: "2025-02-15", updatedAt: "2025-03-05" },
  { id: "d-6", name: "Coffee Corner", businessName: "Corner Coffee Co.", template: "Sunset Blaze", templateColor1: "#EA580C", templateColor2: "#7C2D12", orientation: "portrait", model: "Classic", status: "archived", userId: "u-6", userEmail: "joe@cornercoffee.com", userName: "Joe Bean", createdAt: "2024-12-01", updatedAt: "2025-01-15" },
];

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-green-500/15 text-green-400 border-green-500/30" },
  draft: { label: "Draft", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  archived: { label: "Archived", className: "bg-muted/50 text-muted-foreground border-border/50" },
  flagged: { label: "Flagged", className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const AllDesigns = () => {
  const { t } = useLanguage();
  const [designs, setDesigns] = useState(MOCK_DESIGNS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewDesign, setPreviewDesign] = useState(null);

  const filtered = designs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.businessName.toLowerCase().includes(search.toLowerCase()) ||
      d.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      d.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: designs.length,
    active: designs.filter(d => d.status === "active").length,
    users: new Set(designs.map(d => d.userId)).size,
    flagged: designs.filter(d => d.status === "flagged").length,
  };

  const handleFlag = (design) => {
    setDesigns(designs.map(d => d.id === design.id ? { ...d, status: "flagged" } : d));
    toast({ title: "Design flagged", description: `"${design.name}" has been flagged for review.` });
  };

  const handleArchive = (design) => {
    setDesigns(designs.map(d => d.id === design.id ? { ...d, status: "archived" } : d));
    toast({ title: "Design archived" });
  };

  const handleDelete = (design) => {
    setDesigns(designs.filter(d => d.id !== design.id));
    toast({ title: "Design deleted", description: `"${design.name}" removed from platform.` });
  };

  return (
    <SuperAdminLayout title={t("designs.all_title")} subtitle={t("designs.all_subtitle")}>
      <motion.div initial="hidden" animate="visible" className="space-y-6">

        {/* Stats */}
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Designs", value: stats.total, icon: Palette, color: "text-primary" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-400" },
            { label: "Unique Users", value: stats.users, icon: Users, color: "text-blue-400" },
            { label: "Flagged", value: stats.flagged, icon: Flag, color: "text-red-400" },
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
            <Input placeholder="Search by name, business, user..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
          </div>
          <div className="flex items-center gap-2">
            {["all", "active", "draft", "flagged", "archived"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
                {s === "all" ? "All" : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Design</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Model</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Updated</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-7 rounded-md shrink-0 cursor-pointer"
                          style={{ background: `linear-gradient(135deg, ${d.templateColor1}, ${d.templateColor2})` }}
                          onClick={() => setPreviewDesign(d)}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{d.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{d.businessName} · {d.template}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm truncate">{d.userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs">{d.model} · <span className="capitalize">{d.orientation}</span></span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_CONFIG[d.status].className}>{STATUS_CONFIG[d.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{d.updatedAt}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><MoreVertical size={14} /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setPreviewDesign(d)}><Eye size={14} className="mr-2" />Preview</DropdownMenuItem>
                          {d.status !== "flagged" && (
                            <DropdownMenuItem onClick={() => handleFlag(d)}><Flag size={14} className="mr-2" />Flag Design</DropdownMenuItem>
                          )}
                          {d.status !== "archived" && (
                            <DropdownMenuItem onClick={() => handleArchive(d)}><Archive size={14} className="mr-2" />Archive</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(d)}><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <Palette size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No designs found matching your criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDesign} onOpenChange={() => setPreviewDesign(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewDesign?.name}</DialogTitle>
            <DialogDescription>{previewDesign?.businessName} · by {previewDesign?.userName} ({previewDesign?.userEmail})</DialogDescription>
          </DialogHeader>
          {previewDesign && (
            <div className="space-y-4">
              <div
                className="w-full rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${previewDesign.templateColor1}, ${previewDesign.templateColor2})`,
                  aspectRatio: previewDesign.orientation === "landscape" ? "16/10" : "10/16",
                  maxHeight: "280px",
                }}
              >
                <div className="text-center px-6">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#FBBF24" stroke="none" />)}
                  </div>
                  <p className="text-sm font-bold" style={{ color: previewDesign.templateColor1 === "#FFFFFF" ? "#0D0D0D" : "#FFFFFF" }}>
                    {previewDesign.businessName}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground text-xs">Template</span><p className="font-medium">{previewDesign.template}</p></div>
                <div><span className="text-muted-foreground text-xs">Model</span><p className="font-medium">{previewDesign.model}</p></div>
                <div><span className="text-muted-foreground text-xs">Orientation</span><p className="font-medium capitalize">{previewDesign.orientation}</p></div>
                <div><span className="text-muted-foreground text-xs">Status</span><Badge variant="outline" className={STATUS_CONFIG[previewDesign.status].className}>{STATUS_CONFIG[previewDesign.status].label}</Badge></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDesign(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default AllDesigns;
