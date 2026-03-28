"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignDetailModal from "@/components/designs/DesignDetailModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Palette, CheckCircle2, Archive, Users,
  MoreVertical, Eye, Flag, Trash2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const MOCK_DESIGNS = [
  { id: "d-1", name: "Bella's Main Card", businessName: "Bella's Italian Kitchen", template: "Crimson Noir", templateColor1: "#B91C1C", templateColor2: "#0D0D0D", orientation: "landscape", model: "Premium", status: "active", userId: "u-1", userEmail: "bella@kitchen.com", userName: "Maria Rossi" },
  { id: "d-2", name: "Summit Portrait", businessName: "Summit Dental Care", template: "Midnight Gold", templateColor1: "#1E1B4B", templateColor2: "#0F172A", orientation: "portrait", model: "Metal", status: "active", userId: "u-2", userEmail: "admin@summitdental.com", userName: "Dr. James Cole" },
  { id: "d-3", name: "Auto Draft", businessName: "Elite Auto Service", template: "Arctic Fire", templateColor1: "#FFFFFF", templateColor2: "#F1F5F9", orientation: "landscape", model: "Classic", status: "draft", userId: "u-3", userEmail: "mike@eliteauto.com", userName: "Mike Torres" },
  { id: "d-4", name: "Suspicious Design", businessName: "Quick Cash Store", template: "Neon Matrix", templateColor1: "#0A0A0A", templateColor2: "#000000", orientation: "landscape", model: "Classic", status: "flagged", userId: "u-4", userEmail: "test@spam.com", userName: "Unknown User" },
  { id: "d-5", name: "Zen Spa Card", businessName: "Zen Spa & Wellness", template: "Lavender Dream", templateColor1: "#F5F3FF", templateColor2: "#EDE9FE", orientation: "landscape", model: "Premium", status: "active", userId: "u-5", userEmail: "hello@zenspa.com", userName: "Sarah Lin" },
  { id: "d-6", name: "Coffee Corner", businessName: "Corner Coffee Co.", template: "Sunset Blaze", templateColor1: "#EA580C", templateColor2: "#7C2D12", orientation: "portrait", model: "Classic", status: "archived", userId: "u-6", userEmail: "joe@cornercoffee.com", userName: "Joe Bean" },
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

  const openPreview = (design) => {
    setPreviewDesign({
      ...design,
      frontInstructions: design.frontInstructions || "Tap your phone here to share your experience",
      backInstructions: design.backInstructions || "Scan the QR code to leave us a Google review",
    });
  };

  const filtered = designs.filter((design) => {
    const query = search.toLowerCase();
    const matchSearch =
      design.name.toLowerCase().includes(query) ||
      design.businessName.toLowerCase().includes(query) ||
      design.userEmail.toLowerCase().includes(query) ||
      design.userName.toLowerCase().includes(query);
    const matchStatus = statusFilter === "all" || design.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: designs.length,
    active: designs.filter((design) => design.status === "active").length,
    users: new Set(designs.map((design) => design.userId)).size,
    flagged: designs.filter((design) => design.status === "flagged").length,
  };

  const handleFlag = (design) => {
    setDesigns(designs.map((item) => (
      item.id === design.id ? { ...item, status: "flagged" } : item
    )));
    toast({ title: "Design flagged", description: `"${design.name}" has been flagged for review.` });
  };

  const handleArchive = (design) => {
    setDesigns(designs.map((item) => (
      item.id === design.id ? { ...item, status: "archived" } : item
    )));
    toast({ title: "Design archived" });
  };

  const handleDelete = (design) => {
    setDesigns(designs.filter((item) => item.id !== design.id));
    toast({ title: "Design deleted", description: `"${design.name}" removed from platform.` });
  };

  return (
    <SuperAdminLayout title={t("designs.all_title")} subtitle={t("designs.all_subtitle")}>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Designs", value: stats.total, icon: Palette, color: "text-primary" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-400" },
            { label: "Unique Users", value: stats.users, icon: Users, color: "text-blue-400" },
            { label: "Flagged", value: stats.flagged, icon: Flag, color: "text-red-400" },
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
              placeholder="Search by name, business, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            {["all", "active", "draft", "flagged", "archived"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === status ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {status === "all" ? "All" : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Design</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Model</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((design) => (
                  <tr key={design.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-7 rounded-md shrink-0 cursor-pointer"
                          style={{ background: `linear-gradient(135deg, ${design.templateColor1}, ${design.templateColor2})` }}
                          onClick={() => openPreview(design)}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{design.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{design.businessName} · {design.template}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm truncate">{design.userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{design.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs">{design.model} · <span className="capitalize">{design.orientation}</span></span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_CONFIG[design.status].className}>{STATUS_CONFIG[design.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openPreview(design)}><Eye size={14} className="mr-2" />Preview</DropdownMenuItem>
                          {design.status !== "flagged" && (
                            <DropdownMenuItem onClick={() => handleFlag(design)}><Flag size={14} className="mr-2" />Flag Design</DropdownMenuItem>
                          )}
                          {design.status !== "archived" && (
                            <DropdownMenuItem onClick={() => handleArchive(design)}><Archive size={14} className="mr-2" />Archive</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(design)}><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
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

      <DesignDetailModal
        design={previewDesign}
        onClose={() => setPreviewDesign(null)}
        onEdit={null}
      />
    </SuperAdminLayout>
  );
};

export default AllDesigns;
