"use client";

import { useMemo, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Plus, Copy, Trash2, Pencil, Star, Palette,
  Grid3X3, LayoutGrid, Square, Circle, Loader2
} from "lucide-react";
import { useCardTemplates } from "@/hooks/useCardTemplates";

const PLATFORMS = [
  { id: "google", label: "Google", icon: "🔍", color: "#4285F4" },
  { id: "facebook", label: "Facebook", icon: "📘", color: "#1877F2" },
   { id: "instagram", label: "Instagram Review", icon: "IG", color: "#E4405F" },
  { id: "tiktok", label: "TikTok Review", icon: "TT", color: "#000000" },
  { id: "yelp", label: "Yelp", icon: "⭐", color: "#D32323" },
  { id: "tripadvisor", label: "TripAdvisor", icon: "🦉", color: "#00AA6C" },
  { id: "trustpilot", label: "Trustpilot", icon: "⭐", color: "#00B67A" },
  { id: "booking", label: "Booking Review", icon: "B", color: "#003580" },
  { id: "airbnb", label: "Airbnb Review", icon: "AB", color: "#FF5A5F" },
  { id: "custom", label: "Custom Branding", icon: "C", color: "#6b7280" },
];

const PATTERN_OPTIONS = [
  "none", "dots", "grid", "wave", "noise", "glow", "mesh", "polygon",
  "memphis", "stripes", "chevron", "diagonal-lines", "checkerboard",
  "hexagon", "concentric", "radial", "scribble", "camo", "pixel",
];

function gradientCSS(gradient) {
  if (!Array.isArray(gradient) || gradient.length === 0) {
    return "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)";
  }
  if (gradient.length === 2) {
    return `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
  }
  if (gradient.length === 3) {
    return `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 50%, ${gradient[2]} 100%)`;
  }
  return `linear-gradient(135deg, ${gradient.join(", ")})`;
}

function patternToCSS(pattern, accent) {
  const a = `${accent}15`;
  const b = `${accent}20`;

  switch (pattern) {
    case "none": return "none";
    case "dots": return `radial-gradient(circle, ${a} 1px, transparent 1px)`;
    case "grid": return `linear-gradient(0deg, ${a} 1px, transparent 1px), linear-gradient(90deg, ${a} 1px, transparent 1px)`;
    case "wave": return `repeating-linear-gradient(45deg, transparent, transparent 8px, ${a} 8px, ${a} 10px)`;
    case "noise": return `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`;
    case "glow": return `radial-gradient(circle at 50% 50%, ${b} 0%, transparent 60%)`;
    case "mesh": return `linear-gradient(60deg, ${a} 25%, transparent 25%), linear-gradient(-60deg, ${a} 25%, transparent 25%)`;
    case "polygon": return `linear-gradient(60deg, ${a} 25%, transparent 25%), linear-gradient(-60deg, ${a} 25%, transparent 25%)`;
    case "memphis": return `repeating-linear-gradient(45deg, ${a} 0px, ${a} 3px, transparent 3px, transparent 10px)`;
    case "stripes": return `repeating-linear-gradient(90deg, ${a} 0px, ${a} 2px, transparent 2px, transparent 10px)`;
    case "chevron": return `linear-gradient(135deg, ${a} 25%, transparent 25%) -50px 0, linear-gradient(225deg, ${a} 25%, transparent 25%) -50px 0`;
    case "diagonal-lines": return `repeating-linear-gradient(45deg, transparent, transparent 5px, ${a} 5px, ${a} 7px)`;
    case "checkerboard": return `repeating-conic-gradient(${a} 0% 25%, transparent 0% 50%)`;
    case "hexagon": return `radial-gradient(circle, ${a} 2px, transparent 2px)`;
    case "concentric": return `repeating-radial-gradient(circle, transparent, transparent 8px, ${a} 8px, ${a} 10px)`;
    case "radial": return `radial-gradient(ellipse at 30% 70%, ${b} 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, ${a} 0%, transparent 50%)`;
    case "scribble": return `repeating-linear-gradient(60deg, ${a} 0px, ${a} 1px, transparent 1px, transparent 6px), repeating-linear-gradient(-60deg, ${a} 0px, ${a} 1px, transparent 1px, transparent 8px)`;
    case "camo": return `radial-gradient(ellipse at 20% 50%, ${a} 0%, transparent 40%), radial-gradient(ellipse at 80% 30%, ${b} 0%, transparent 35%), radial-gradient(ellipse at 50% 80%, ${a} 0%, transparent 45%)`;
    case "pixel": return `repeating-conic-gradient(${a} 0% 25%, transparent 0% 50%)`;
    default: return "none";
  }
}

function patternBgSize(pattern) {
  switch (pattern) {
    case "dots": return "12px 12px";
    case "grid": return "20px 20px";
    case "checkerboard": return "16px 16px";
    case "hexagon": return "16px 16px";
    case "pixel": return "8px 8px";
    default: return undefined;
  }
}

const EMPTY_FORM = {
  name: "",
  platform: "google",
  gradient: ["#FFFFFF", "#F1F5F9"],
  accentColor: "#4285F4",
  pattern: "none",
  textColor: "#1a1a1a",
  isActive: true,
  isDefault: false,
  bandColor1: "#4285F4",
  bandColor2: "#E8F0FE",
  qrColor: "#4285F4",
  starsColor: "#FBBF24",
  iconsColor: "#4285F4",
};

const ColorField = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-border/50">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <div className="h-full w-full" style={{ background: value }} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[10px] text-muted-foreground">{label}</p>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 h-7 font-mono text-xs" />
    </div>
  </div>
);

const PreviewCard = ({ template, previewLayout }) => {
  const dims = {
    landscape: { w: 240, h: 150 },
    portrait: { w: 150, h: 240 },
    square: { w: 180, h: 180 },
    circle: { w: 180, h: 180 },
  }[previewLayout];

  const platform = PLATFORMS.find((item) => item.id === template.platform);
  const patternCSS = patternToCSS(template.pattern, template.accentColor);
  const bgSize = patternBgSize(template.pattern);

  return (
    <div
      className="relative mx-auto overflow-hidden shadow-lg"
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: previewLayout === "circle" ? "50%" : "12px",
        background: gradientCSS(template.gradient),
      }}
    >
      {patternCSS !== "none" && (
        <div
          className="absolute inset-0"
          style={{ background: patternCSS, backgroundSize: bgSize, opacity: 0.6 }}
        />
      )}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background: template.bandColor1 }} />
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: template.bandColor2 }} />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 p-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: platform?.color || "#666", color: "#fff" }}
        >
          {platform?.icon || "?"}
        </div>
        <p className="text-center text-[10px] font-bold" style={{ color: template.textColor }}>
          {template.name || "Template Name"}
        </p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((index) => (
            <Star key={index} size={10} fill={template.starsColor} color={template.starsColor} />
          ))}
        </div>
        <div
          className="flex h-8 w-8 items-center justify-center rounded border-2"
          style={{ borderColor: template.qrColor }}
        >
          <Grid3X3 size={14} style={{ color: template.qrColor }} />
        </div>
      </div>
    </div>
  );
};

const TemplateManager = () => {
  const {
    templates,
    stats,
    loading,
    filters,
    updateFilters,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    toggleTemplate,
  } = useCardTemplates();

  const [editModal, setEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteModal, setDeleteModal] = useState(null);
  const [previewLayout, setPreviewLayout] = useState("landscape");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let list = templates;

    if (filters.platform !== "all") {
      list = list.filter((item) => item.platform === filters.platform);
    }

    if (filters.isActive === "active") {
      list = list.filter((item) => item.isActive);
    } else if (filters.isActive === "inactive") {
      list = list.filter((item) => !item.isActive);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.platform.includes(query)
      );
    }

    return list;
  }, [templates, filters]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setEditModal(true);
  };

  const openEdit = (template) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      platform: template.platform,
      gradient: [...template.gradient],
      accentColor: template.accentColor,
      pattern: template.pattern,
      textColor: template.textColor,
      isActive: template.isActive,
      isDefault: template.isDefault,
      bandColor1: template.bandColor1,
      bandColor2: template.bandColor2,
      qrColor: template.qrColor,
      starsColor: template.starsColor,
      iconsColor: template.iconsColor,
    });
    setEditModal(true);
  };

  const handleDuplicate = async (template) => {
    try {
      await duplicateTemplate(template.id);
    } catch (error) {
      console.error('Duplicate error:', error);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateTemplate(editingId, form);
      } else {
        await createTemplate(form);
      }

      setEditModal(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      await deleteTemplate(deleteModal.id);
      setDeleteModal(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleTemplate(id);
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  if (loading) {
    return (
      <SuperAdminLayout
        title="Template Manager"
        subtitle="Create and manage NFC card design templates"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout
      title="Template Manager"
      subtitle="Create and manage NFC card design templates"
      headerAction={
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> Create Template
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filtres */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select value={filters.platform} onValueChange={(value) => updateFilters({ platform: value })}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {PLATFORMS.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.icon} {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.isActive} onValueChange={(value) => updateFilters({ isActive: value })}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Templates", value: stats.total, color: "text-foreground" },
              { label: "Active", value: stats.active, color: "text-green-500" },
              { label: "Inactive", value: stats.inactive, color: "text-muted-foreground" },
              { label: "Platforms", value: stats.platforms, color: "text-primary" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Grid de templates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => {
            const platform = PLATFORMS.find((item) => item.id === template.platform);
            const patternCSS = patternToCSS(template.pattern, template.accentColor);
            const bgSize = patternBgSize(template.pattern);

            return (
              <div
                key={template.id}
                className={`overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg ${
                  template.isActive ? "border-border/50" : "border-border/30 opacity-60"
                }`}
              >
                <div className="relative h-32 overflow-hidden" style={{ background: gradientCSS(template.gradient) }}>
                  {patternCSS !== "none" && (
                    <div className="absolute inset-0" style={{ background: patternCSS, backgroundSize: bgSize, opacity: 0.5 }} />
                  )}
                  <div className="absolute left-0 right-0 top-0 h-1" style={{ background: template.bandColor1 }} />
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: template.bandColor2 }} />
                  <div className="relative z-10 flex h-full items-center justify-center">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <Star key={index} size={12} fill={template.starsColor} color={template.starsColor} />
                      ))}
                    </div>
                  </div>
                  <div className="absolute right-2 top-2 z-10">
                    <Badge variant={template.isActive ? "default" : "outline"} className="text-[9px]">
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">{template.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <span style={{ color: platform?.color }}>{platform?.icon}</span>
                      {platform?.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{template.pattern}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {template.gradient.map((color, index) => (
                      <div key={index} className="h-5 w-5 rounded border border-border/50" style={{ background: color }} title={color} />
                    ))}
                    <div className="h-5 w-5 rounded border border-border/50" style={{ background: template.accentColor }} title="Accent" />
                    <div className="h-5 w-5 rounded border border-border/50" style={{ background: template.qrColor }} title="QR" />
                  </div>
                  <div className="flex items-center gap-1 border-t border-border/30 pt-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(template)} className="h-7 flex-1 gap-1 text-xs">
                      <Pencil size={12} /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDuplicate(template)} className="h-7 flex-1 gap-1 text-xs">
                      <Copy size={12} /> Clone
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteModal(template)}
                      className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                      disabled={template.isDefault}
                    >
                      <Trash2 size={12} />
                    </Button>
                    <Switch 
                      checked={template.isActive} 
                      onCheckedChange={() => handleToggleActive(template.id)} 
                      className="ml-auto scale-75" 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Palette size={48} className="mx-auto mb-4 opacity-30" />
            <p>No templates found</p>
          </div>
        )}
      </div>

      {/* Modal Edit/Create */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>Configure colors, patterns, and preview the card in real time.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="-mx-6 flex-1 px-6">
            <div className="grid grid-cols-1 gap-6 py-4 lg:grid-cols-2">
              <div className="space-y-5">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Basic Info</h3>
                  <div>
                    <label className="text-xs text-muted-foreground">Template Name</label>
                    <Input value={form.name} onChange={(e) => updateForm({ name: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Platform</label>
                    <Select value={form.platform} onValueChange={(value) => updateForm({ platform: value })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>{platform.icon} {platform.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Pattern</label>
                    <Select value={form.pattern} onValueChange={(value) => updateForm({ pattern: value })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PATTERN_OPTIONS.map((pattern) => (
                          <SelectItem key={pattern} value={pattern} className="capitalize">{pattern}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.isActive} onCheckedChange={(value) => updateForm({ isActive: value })} />
                    <span className="text-sm">Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.isDefault} onCheckedChange={(value) => updateForm({ isDefault: value })} />
                    <span className="text-sm">Set as Default</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Colors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField label="Gradient Start" value={form.gradient[0]} onChange={(value) => updateForm({ gradient: [value, form.gradient[1] || value] })} />
                    <ColorField label="Gradient End" value={form.gradient[1] || form.gradient[0]} onChange={(value) => updateForm({ gradient: [form.gradient[0], value] })} />
                    <ColorField label="Band Color 1" value={form.bandColor1} onChange={(value) => updateForm({ bandColor1: value })} />
                    <ColorField label="Band Color 2" value={form.bandColor2} onChange={(value) => updateForm({ bandColor2: value })} />
                    <ColorField label="Text Color" value={form.textColor} onChange={(value) => updateForm({ textColor: value })} />
                    <ColorField label="QR Code Color" value={form.qrColor} onChange={(value) => updateForm({ qrColor: value })} />
                    <ColorField label="Stars Color" value={form.starsColor} onChange={(value) => updateForm({ starsColor: value })} />
                    <ColorField label="Icons Color" value={form.iconsColor} onChange={(value) => updateForm({ iconsColor: value })} />
                    <ColorField label="Accent Color" value={form.accentColor} onChange={(value) => updateForm({ accentColor: value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Live Preview</h3>
                <Tabs value={previewLayout} onValueChange={setPreviewLayout}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="landscape" className="gap-1 text-xs">
                      <LayoutGrid size={12} /> Landscape
                    </TabsTrigger>
                    <TabsTrigger value="portrait" className="gap-1 text-xs">
                      <LayoutGrid size={12} className="rotate-90" /> Portrait
                    </TabsTrigger>
                    <TabsTrigger value="square" className="gap-1 text-xs">
                      <Square size={12} /> Square
                    </TabsTrigger>
                    <TabsTrigger value="circle" className="gap-1 text-xs">
                      <Circle size={12} /> Circle
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-muted/30 p-8">
                  <PreviewCard template={form} previewLayout={previewLayout} />
                </div>

                <div className="rounded-lg border border-border/50 bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Pattern:</span> {form.pattern} ·
                    <span className="ml-2 font-medium text-foreground">Platform:</span> {PLATFORMS.find((item) => item.id === form.platform)?.label}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-border/50 pt-4">
            <Button variant="outline" onClick={() => setEditModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingId ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Delete */}
      <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Permanently delete <span className="font-bold">"{deleteModal?.name}"</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default TemplateManager;