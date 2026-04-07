"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignDetailModal from "@/components/designs/DesignDetailModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Palette,
  CheckCircle2,
  Users,
  MoreVertical,
  Eye,
  Lock,
  Loader2,
  Flag,
  Archive,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { get } from "@/lib/api";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  validated: {
    label: "Validated",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  locked: {
    label: "Locked",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
};

function mapCardToDesign(card) {
  const summary = card?.designSummary;

  if (!summary?.id) return null;

  return {
    id: summary.id,
    uid: card.uid,
    name: card.productName || `Design #${summary.id}`,
    businessName: summary.businessName || card.company?.name || "Sans nom",
    template: card.productName || "Custom Design",
    templateColor1: summary.bgColor || "#111827",
    templateColor2: summary.accentColor || "#E10600",
    orientation: summary.orientation || "landscape",
    model: summary.cardModel || "classic",
    status: summary.status || "draft",
    userId: card.user?.id || null,
    userEmail: card.user?.email || "",
    userName: card.user?.name || "Utilisateur inconnu",
    linkedCard: card.uid,
    linkedCardsCount: 1,
    frontInstructions: "Tap your phone here to share your experience",
    backInstructions: "Scan the QR code to leave us a Google review",
  };
}

function aggregateDesigns(cards = []) {
  const map = new Map();

  cards.forEach((card) => {
    const design = mapCardToDesign(card);

    if (!design) return;

    if (!map.has(design.id)) {
      map.set(design.id, design);
      return;
    }

    const existing = map.get(design.id);
    existing.linkedCardsCount += 1;
    existing.linkedCard = `${existing.linkedCardsCount} card${existing.linkedCardsCount > 1 ? "s" : ""}`;
  });

  return Array.from(map.values());
}

const AllDesigns = () => {
  const { t } = useLanguage();
  const [designs, setDesigns] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewDesign, setPreviewDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDesigns = async () => {
      try {
        setLoading(true);
        const response = await get("/api/superadmin/nfc/cards", { limit: 100 });
        const apiCards = Array.isArray(response?.data) ? response.data : [];
        const nextDesigns = aggregateDesigns(apiCards);

        if (!mounted) return;
        setDesigns(nextDesigns);
      } catch (error) {
        if (!mounted) return;
        setDesigns([]);
        toast({
          title: "Chargement impossible",
          description: error?.error || "Impossible de charger les designs.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDesigns();

    return () => {
      mounted = false;
    };
  }, []);

  const openPreview = (design) => {
    setPreviewDesign(design);
  };

  const handleFlag = (design) => {
    setDesigns((current) => current.map((item) => (
      item.id === design.id ? { ...item, status: "draft" } : item
    )));
    toast({
      title: "Design flagged",
      description: `"${design.name}" has been flagged for review.`,
    });
  };

  const handleArchive = (design) => {
    setDesigns((current) => current.map((item) => (
      item.id === design.id ? { ...item, status: "locked" } : item
    )));
    toast({ title: "Design archived" });
  };

  const handleDelete = (design) => {
    setDesigns((current) => current.filter((item) => item.id !== design.id));
    if (previewDesign?.id === design.id) {
      setPreviewDesign(null);
    }
    toast({
      title: "Design deleted",
      description: `"${design.name}" removed from platform.`,
    });
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return designs.filter((design) => {
      const matchSearch =
        !query ||
        design.name.toLowerCase().includes(query) ||
        design.businessName.toLowerCase().includes(query) ||
        design.userEmail.toLowerCase().includes(query) ||
        design.userName.toLowerCase().includes(query);

      const matchStatus = statusFilter === "all" || design.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [designs, search, statusFilter]);

  const stats = useMemo(() => ({
    total: designs.length,
    validated: designs.filter((design) => design.status === "validated").length,
    users: new Set(designs.map((design) => design.userId).filter(Boolean)).size,
    locked: designs.filter((design) => design.status === "locked").length,
  }), [designs]);

  return (
    <SuperAdminLayout title={t("designs.all_title")} subtitle={t("designs.all_subtitle")}>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Designs", value: stats.total, icon: Palette, color: "text-primary" },
            { label: "Validated", value: stats.validated, icon: CheckCircle2, color: "text-green-400" },
            { label: "Unique Users", value: stats.users, icon: Users, color: "text-blue-400" },
            { label: "Locked", value: stats.locked, icon: Lock, color: "text-blue-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-gradient-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-2xl font-bold">{loading ? "..." : stat.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by design, business, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border/50 bg-secondary/50 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {["all", "draft", "validated", "locked"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {status === "all" ? "All" : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="overflow-hidden rounded-xl border border-border/50 bg-gradient-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Design</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">User</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <Loader2 size={28} className="mx-auto mb-3 animate-spin opacity-70" />
                      <p className="text-sm">Chargement des designs...</p>
                    </td>
                  </tr>
                ) : filtered.map((design) => (
                  <tr key={design.id} className="border-b border-border/30 transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-7 w-10 shrink-0 cursor-pointer rounded-md"
                          style={{
                            background: `linear-gradient(135deg, ${design.templateColor1}, ${design.templateColor2})`,
                          }}
                          onClick={() => openPreview(design)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{design.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {design.businessName} · {design.template}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="truncate text-sm">{design.userName}</p>
                      <p className="truncate text-xs text-muted-foreground">{design.userEmail || "—"}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-xs">
                        {design.model} · <span className="capitalize">{design.orientation}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_CONFIG[design.status]?.className || STATUS_CONFIG.draft.className}>
                        {STATUS_CONFIG[design.status]?.label || design.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg p-1.5 transition-colors hover:bg-secondary">
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openPreview(design)}>
                            <Eye size={14} className="mr-2" />
                            Preview
                          </DropdownMenuItem>
                          {design.status !== "locked" && (
                            <DropdownMenuItem onClick={() => handleFlag(design)}>
                              <Flag size={14} className="mr-2" />
                              Flag Design
                            </DropdownMenuItem>
                          )}
                          {design.status !== "locked" && (
                            <DropdownMenuItem onClick={() => handleArchive(design)}>
                              <Archive size={14} className="mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(design)}>
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
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
