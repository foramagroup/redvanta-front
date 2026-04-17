"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import SharedCardPreview from "@/components/designs/SharedCardPreview";
import { useCardTemplates } from "@/hooks/useCardTemplates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Copy, Image as ImageIcon, LayoutGrid, Loader2, MoreHorizontal, Palette, Pencil, Plus, QrCode, RotateCcw, Search, Smartphone, Star, Trash2, Type, Upload } from "lucide-react";

const PLATFORMS = [
  { id: "google", label: "Google", icon: "G", color: "#4285F4" },
  { id: "facebook", label: "Facebook", icon: "f", color: "#1877F2" },
  { id: "instagram", label: "Instagram", icon: "IG", color: "#E4405F" },
  { id: "tiktok", label: "TikTok", icon: "TT", color: "#000000" },
  { id: "yelp", label: "Yelp", icon: "Y", color: "#D32323" },
  { id: "tripadvisor", label: "TripAdvisor", icon: "TA", color: "#00AA6C" },
  { id: "trustpilot", label: "Trustpilot", icon: "TP", color: "#00B67A" },
  { id: "booking", label: "Booking", icon: "B", color: "#003580" },
  { id: "airbnb", label: "Airbnb", icon: "AB", color: "#FF5A5F" },
  { id: "custom", label: "Custom", icon: "C", color: "#6B7280" },
];

const PATTERNS = ["none", "dots", "grid", "diagonal-lines", "stripes", "glow"];
const MODEL_LABELS = { classic: "Classic", premium: "Premium", metal: "Metal", transparent: "Transparent" };
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "classic", label: "Classic" },
  { id: "premium", label: "Premium" },
  { id: "elegant", label: "Elegant" },
  { id: "tech", label: "Tech" },
];
const QUICK_TEMPLATES = [
  { id: "crimson-noir", label: "Crimson Noir", gradient1: "#B91C1C", gradient2: "#0D0D0D", accentBand1: "#FFFFFF", accentBand2: "#1A1A1A", textColor: "#FFFFFF", qrColor: "#FBBF24", starsColor: "#FBBF24", iconsColor: "#22C55E", pattern: "none", category: "classic" },
  { id: "midnight-gold", label: "Midnight Gold", gradient1: "#1E1B4B", gradient2: "#0F172A", accentBand1: "#FBBF24", accentBand2: "#1A1A1A", textColor: "#FFFFFF", qrColor: "#FBBF24", starsColor: "#FBBF24", iconsColor: "#22C55E", pattern: "none", category: "classic" },
  { id: "glass-frost", label: "Frosted Glass", gradient1: "#6366F1", gradient2: "#312E81", accentBand1: "#E0E7FF", accentBand2: "#818CF8", textColor: "#FFFFFF", qrColor: "#C7D2FE", starsColor: "#FBBF24", iconsColor: "#22C55E", pattern: "glow", category: "premium" },
  { id: "metal-gold", label: "Brushed Gold", gradient1: "#D4A574", gradient2: "#78350F", accentBand1: "#FDE68A", accentBand2: "#451A03", textColor: "#FFFBEB", qrColor: "#FDE68A", starsColor: "#FBBF24", iconsColor: "#22C55E", pattern: "stripes", category: "premium" },
  { id: "dot-luxe", label: "Luxe Dots", gradient1: "#292524", gradient2: "#0C0A09", accentBand1: "#D4A574", accentBand2: "#292524", textColor: "#FAFAF9", qrColor: "#D4A574", starsColor: "#FBBF24", iconsColor: "#22C55E", pattern: "dots", category: "elegant" },
  { id: "diamond-sapphire", label: "Sapphire Diamond", gradient1: "#1D4ED8", gradient2: "#1E1B4B", accentBand1: "#60A5FA", accentBand2: "#312E81", textColor: "#FFFFFF", qrColor: "#93C5FD", starsColor: "#FBBF24", iconsColor: "#22C55E", pattern: "grid", category: "elegant" },
  { id: "hex-cyber", label: "Cyber Hex", gradient1: "#0E7490", gradient2: "#042F2E", accentBand1: "#22D3EE", accentBand2: "#134E4A", textColor: "#ECFEFF", qrColor: "#67E8F9", starsColor: "#FBBF24", iconsColor: "#22C55E", pattern: "grid", category: "tech" },
  { id: "circuit-neon", label: "Neon Circuit", gradient1: "#14532D", gradient2: "#052E16", accentBand1: "#4ADE80", accentBand2: "#14532D", textColor: "#F0FDF4", qrColor: "#4ADE80", starsColor: "#FBBF24", iconsColor: "#22C55E", pattern: "diagonal-lines", category: "tech" },
];
const SINGLE_COLOR_PRESETS = [
  { bg: "#0D0D0D", text: "#FFFFFF", qr: "#E10600", label: "Noir" },
  { bg: "#1E1B4B", text: "#FFFFFF", qr: "#FBBF24", label: "Navy" },
  { bg: "#FFFFFF", text: "#0D0D0D", qr: "#E10600", label: "Clean" },
  { bg: "#064E3B", text: "#FFFFFF", qr: "#34D399", label: "Forest" },
  { bg: "#7C2D12", text: "#FFFFFF", qr: "#FDE68A", label: "Espresso" },
  { bg: "#18181B", text: "#F4F4F5", qr: "#F59E0B", label: "Charcoal" },
];
const FONTS = [
  { id: "space-grotesk", label: "Space Grotesk", family: "'Space Grotesk', sans-serif" },
  { id: "inter", label: "Inter", family: "'Inter', sans-serif" },
  { id: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif" },
  { id: "playfair", label: "Playfair Display", family: "'Playfair Display', serif" },
];
const WEIGHTS = [{ id: "400", label: "Regular" }, { id: "700", label: "Bold" }, { id: "800", label: "Extra Bold" }];
const ALIGNS = ["left", "center", "right"];
const SPACINGS = ["tight", "normal", "wide", "wider"];
const TRANSFORMS = ["none", "uppercase", "capitalize"];
const LINE_HEIGHTS = ["1", "1.2", "1.4", "1.6"];
const LOGO_SIZES = [24, 32, 40, 48, 56];
const QR_SIZES = [48, 64, 80, 96];
const TEXT_SIZES = [10, 12, 14, 16, 18, 20, 24];
const INSTR_SIZES = [8, 9, 10, 11, 12, 14];
const BANDS = [8, 12, 16, 20, 22, 28, 35];
const PADDINGS = [0, 4, 8, 12, 16, 20, 24];
const ICON_SIZES = [16, 20, 24, 28, 32, 36];
const TEXT_SHADOWS = ["none", "subtle", "medium", "strong", "outline"];
const OFFSETS = { businessInfo:{x:0,y:0}, instructions:{x:0,y:0}, nfcIcon:{x:0,y:0}, googleIcon:{x:0,y:0}, logo:{x:0,y:0}, qrCode:{x:0,y:0}, cta:{x:0,y:0} };
const buildOffsets = () => ({ landscape:{ front:{...OFFSETS}, back:{...OFFSETS} }, portrait:{ front:{...OFFSETS}, back:{...OFFSETS} }, square:{ front:{...OFFSETS}, back:{...OFFSETS} }, circle:{ front:{...OFFSETS}, back:{...OFFSETS} } });
const EMPTY_FORM = {
  name:"", platform:"google", gradient:["#FFFFFF","#F1F5F9"], accentColor:"#4285F4", pattern:"none", textColor:"#1A1A1A", isActive:true, isDefault:false,
  bandColor1:"#4285F4", bandColor2:"#E8F0FE", qrColor:"#4285F4", starsColor:"#FBBF24", iconsColor:"#22C55E", businessName:"", slogan:"", cta:"Powered by RedVanta",
  logoUrl:null, orientation:"landscape", bandPosition:"bottom", frontBandHeight:22, backBandHeight:12, logoPosition:"left", logoSize:32, qrPosition:"right", qrSize:80,
  nameFont:FONTS[0].family, sloganFont:FONTS[0].family, instructionFont:FONTS[0].family, nameFontSize:16, sloganFontSize:12, instructionFontSize:10,
  nameFontWeight:"700", sloganFontWeight:"400", instructionFontWeight:"400", nameLetterSpacing:"normal", sloganLetterSpacing:"normal", instructionLetterSpacing:"normal",
  nameTextTransform:"none", sloganTextTransform:"none", nameLineHeight:"1.2", sloganLineHeight:"1.4", instructionLineHeight:"1.4", nameTextAlign:"left", sloganTextAlign:"left",
  instructionTextAlign:"left", frontLine1:"Approach your phone to the card", frontLine2:"Tap to leave a review", backLine1:"Scan the QR code with your camera", backLine2:"Write a review on our profile page",
  checkStrokeWidth:3.5, nfcIconSize:24, googleIconSize:20, showNfcIcon:true, showGoogleIcon:true, textShadow:"none", ctaPaddingTop:8, model:"classic", colorMode:"template", elementOffsets:buildOffsets(),
};

const patternCss = (pattern, color) => {
  const soft = `${color}18`;
  if (pattern === "dots") return `radial-gradient(circle, ${soft} 1px, transparent 1px)`;
  if (pattern === "grid") return `linear-gradient(0deg, ${soft} 1px, transparent 1px), linear-gradient(90deg, ${soft} 1px, transparent 1px)`;
  if (pattern === "diagonal-lines") return `repeating-linear-gradient(45deg, transparent, transparent 6px, ${soft} 6px, ${soft} 8px)`;
  if (pattern === "stripes") return `repeating-linear-gradient(90deg, ${soft} 0px, ${soft} 2px, transparent 2px, transparent 12px)`;
  if (pattern === "glow") return `radial-gradient(circle at 50% 50%, ${color}22 0%, transparent 60%)`;
  return "none";
};

const ColorField = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-border/50">
      <input type="color" value={value} onChange={(e)=>onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0"/>
      <div className="h-full w-full" style={{ background:value }}/>
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[10px] text-muted-foreground">{label}</p>
      <Input value={value} onChange={(e)=>onChange(e.target.value)} className="mt-0.5 h-7 font-mono text-xs"/>
    </div>
  </div>
);

const Presets = ({ values, active, onSelect, suffix="" }) => (
  <div className="mt-2 flex flex-wrap gap-1">
    {values.map((v)=><button key={`${suffix}-${v}`} type="button" onClick={()=>onSelect(v)} className={`rounded-md border px-2 py-1 text-[11px] ${active===v ? "border-primary/50 bg-primary/10 text-primary":"border-border/50 text-muted-foreground"}`}>{v}{suffix}</button>)}
  </div>
);

const Section = ({ icon:Icon, title, children }) => (
  <div className="space-y-3 rounded-xl border border-border/50 bg-card/40 p-4">
    <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon size={14} className="text-primary"/>{title}</h3>
    {children}
  </div>
);

const TemplateTile = ({ template }) => {
  const platform = PLATFORMS.find((item) => item.id === template.platform);
  const background = `linear-gradient(135deg, ${template.gradient[0]} 0%, ${template.gradient[1]} 100%)`;
  return (
    <div className="relative h-32 overflow-hidden rounded-xl" style={{ background }}>
      {patternCss(template.pattern, template.accentColor) !== "none" && <div className="absolute inset-0 opacity-50" style={{ background:patternCss(template.pattern, template.accentColor), backgroundSize: template.pattern === "dots" ? "12px 12px" : template.pattern === "grid" ? "20px 20px" : undefined }}/>}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background:template.bandColor1 }}/>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background:template.bandColor2 }}/>
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 p-4">
        <div className="flex gap-0.5">{[1,2,3,4,5].map((i)=><Star key={i} size={12} fill={template.starsColor} color={template.starsColor}/>)}</div>
        <div className="text-center text-sm font-semibold" style={{ color:template.textColor }}>{template.name}</div>
        <Badge variant="outline" className="gap-1 border-white/20 bg-white/10 text-[10px] text-white">{platform?.icon} {platform?.label}</Badge>
      </div>
    </div>
  );
};

export default function TemplateManager() {
  const { templates, stats, loading, filters, updateFilters, getTemplateById, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate, toggleTemplate, toggleCardSetting } = useCardTemplates();
  const [editModal, setEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteModal, setDeleteModal] = useState(null);
  const [previewLayout, setPreviewLayout] = useState("landscape");
  const [previewSide, setPreviewSide] = useState("front");
  const [dragMode, setDragMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateFilter, setTemplateFilter] = useState("all");
  const logoInputRef = useRef(null);
  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const handleElementDrag = (key, x, y) => {
    setForm((prev) => ({
      ...prev,
      elementOffsets: {
        ...prev.elementOffsets,
        [prev.orientation]: {
          ...prev.elementOffsets[prev.orientation],
          [previewSide]: {
            ...prev.elementOffsets[prev.orientation][previewSide],
            [key]: { x, y },
          },
        },
      },
    }));
  };
  const resetPositions = () => {
    setForm((prev) => ({
      ...prev,
      elementOffsets: {
        ...prev.elementOffsets,
        [prev.orientation]: {
          ...prev.elementOffsets[prev.orientation],
          [previewSide]: { ...OFFSETS },
        },
      },
    }));
  };
  const applyTemplate = (template) => {
    updateForm({
      colorMode: "template",
      gradient: [template.gradient1, template.gradient2],
      bandColor1: template.accentBand1,
      bandColor2: template.accentBand2,
      textColor: template.textColor,
      qrColor: template.qrColor,
      starsColor: template.starsColor,
      iconsColor: template.iconsColor,
      pattern: template.pattern,
    });
  };

  const filtered = useMemo(() => {
    let list = templates;
    if (filters.platform !== "all") list = list.filter((item) => item.platform === filters.platform);
    if (filters.isActive === "active") list = list.filter((item) => item.isActive);
    else if (filters.isActive === "inactive") list = list.filter((item) => !item.isActive);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q) || item.platform.includes(q));
    }
    return list;
  }, [filters, templates]);

  const previewDesign = useMemo(() => ({
    businessName: form.businessName || form.name || "Template Name",
    slogan: form.slogan,
    cta: form.cta,
    logoUrl: form.logoUrl,
    bgColor: form.gradient[0],
    textColor: form.textColor,
    qrColor: form.qrColor,
    model: form.model,
    status: form.isActive ? "validated" : "draft",
  }), [form]);

  const currentPlatform = PLATFORMS.find((item) => item.id === form.platform);
  const resetForm = () => ({ ...EMPTY_FORM, elementOffsets: buildOffsets() });

  const openCreate = () => {
    setEditingId(null);
    setForm(resetForm());
    setTemplateFilter("all");
    setPreviewLayout("landscape");
    setPreviewSide("front");
    setDragMode(false);
    setEditModal(true);
  };

  const openEdit = async (template) => {
    setEditingId(template.id);
    let t = template;
    try { t = await getTemplateById(template.id); } catch {}
    setForm({
      ...resetForm(),
      // Basic
      name: t.name,
      platform: t.platform,
      pattern: t.pattern,
      isActive: t.isActive,
      isDefault: t.isDefault,
      // Content
      businessName: t.businessName ?? t.name,
      slogan: t.slogan ?? "",
      cta: t.cta ?? "Powered by RedVanta",
      logoUrl: t.logoUrl ?? null,
      // Layout
      orientation: t.orientation ?? "landscape",
      bandPosition: t.bandPosition ?? "bottom",
      frontBandHeight: t.frontBandHeight ?? 22,
      backBandHeight: t.backBandHeight ?? 12,
      // Logo and QR
      logoPosition: t.logoPosition ?? "left",
      logoSize: t.logoSize ?? 32,
      qrPosition: t.qrPosition ?? "right",
      qrSize: t.qrSize ?? 80,
      // Colors
      gradient: Array.isArray(t.gradient) ? [...t.gradient] : ["#FFFFFF", "#F1F5F9"],
      accentColor: t.accentColor ?? "#4285F4",
      textColor: t.textColor ?? "#1A1A1A",
      bandColor1: t.bandColor1 ?? "#4285F4",
      bandColor2: t.bandColor2 ?? "#E8F0FE",
      qrColor: t.qrColor ?? "#4285F4",
      starsColor: t.starsColor ?? "#FBBF24",
      iconsColor: t.iconsColor ?? "#22C55E",
      colorMode: t.colorMode ?? "template",
      // Typography - Name
      nameFont: t.nameFont ?? FONTS[0].family,
      nameFontSize: t.nameFontSize ?? 16,
      nameFontWeight: t.nameFontWeight ?? "700",
      nameLetterSpacing: t.nameLetterSpacing ?? "normal",
      nameTextTransform: t.nameTextTransform ?? "none",
      nameLineHeight: t.nameLineHeight ?? "1.2",
      nameTextAlign: t.nameTextAlign ?? "left",
      // Typography - Slogan
      sloganFont: t.sloganFont ?? FONTS[0].family,
      sloganFontSize: t.sloganFontSize ?? 12,
      sloganFontWeight: t.sloganFontWeight ?? "400",
      sloganLetterSpacing: t.sloganLetterSpacing ?? "normal",
      sloganTextTransform: t.sloganTextTransform ?? "none",
      sloganLineHeight: t.sloganLineHeight ?? "1.4",
      sloganTextAlign: t.sloganTextAlign ?? "left",
      // Typography - Instructions
      instructionFont: t.instructionFont ?? FONTS[0].family,
      instructionFontSize: t.instructionFontSize ?? 10,
      instructionFontWeight: t.instructionFontWeight ?? "400",
      instructionLetterSpacing: t.instructionLetterSpacing ?? "normal",
      instructionLineHeight: t.instructionLineHeight ?? "1.4",
      instructionTextAlign: t.instructionTextAlign ?? "left",
      // Instructions text
      frontLine1: t.frontLine1 ?? "Approach your phone to the card",
      frontLine2: t.frontLine2 ?? "Tap to leave a review",
      backLine1: t.backLine1 ?? "Scan the QR code with your camera",
      backLine2: t.backLine2 ?? "Write a review on our profile page",
      // Icons
      checkStrokeWidth: t.checkStrokeWidth ?? 3.5,
      nfcIconSize: t.nfcIconSize ?? 24,
      googleIconSize: t.googleIconSize ?? 20,
      showNfcIcon: t.showNfcIcon ?? true,
      showGoogleIcon: t.showGoogleIcon ?? true,
      // Visual
      textShadow: t.textShadow ?? "none",
      ctaPaddingTop: t.ctaPaddingTop ?? 8,
      // Model
      model: t.model ?? "classic",
      // Element offsets
      elementOffsets: t.elementOffsets ?? buildOffsets(),
    });
    setPreviewLayout(t.orientation ?? "landscape");
    setPreviewSide("front");
    setDragMode(false);
    setTemplateFilter("all");
    setEditModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      if (editingId) await updateTemplate(editingId, form);
      else await createTemplate(form);
      setEditModal(false);
    } catch (error) {
      console.error("Save error:", error);
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
      console.error("Delete error:", error);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateForm({ logoUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <SuperAdminLayout title="Template Manager" subtitle="Create and manage NFC card design templates"><div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div></SuperAdminLayout>;
  }

  return <SuperAdminLayout title="Template Manager" subtitle="Create and manage NFC card design templates" headerAction={<Button onClick={openCreate} className="gap-2"><Plus size={16}/>Create Template</Button>}>
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input placeholder="Search templates..." value={filters.search} onChange={(e)=>updateFilters({ search:e.target.value })} className="pl-9"/></div>
        <Select value={filters.platform} onValueChange={(value)=>updateFilters({ platform:value })}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Platforms"/></SelectTrigger><SelectContent><SelectItem value="all">All Platforms</SelectItem>{PLATFORMS.map((platform)=><SelectItem key={platform.id} value={platform.id}>{platform.icon} {platform.label}</SelectItem>)}</SelectContent></Select>
        <Select value={filters.isActive} onValueChange={(value)=>updateFilters({ isActive:value })}><SelectTrigger className="w-full sm:w-36"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
      </div>


      {stats && <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[{ label:"Total Templates", value:stats.total, color:"text-foreground" }, { label:"Active", value:stats.active, color:"text-green-500" }, { label:"Inactive", value:stats.inactive, color:"text-muted-foreground" }, { label:"Platforms", value:stats.platforms, color:"text-primary" }].map((stat)=><div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4"><p className="text-xs text-muted-foreground">{stat.label}</p><p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p></div>)}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((template) => {
          const platform = PLATFORMS.find((item) => item.id === template.platform);
          return <div key={template.id} className={`overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg ${template.isActive ? "border-border/50" : "border-border/30 opacity-60"}`}>
            <TemplateTile template={template}/>
            <div className="space-y-2 p-3">
              <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium">{template.name}</p><Badge variant={template.isActive ? "default" : "outline"} className="text-[9px]">{template.isActive ? "Active" : "Inactive"}</Badge></div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1 text-[10px]"><span style={{ color:platform?.color }}>{platform?.icon}</span>{platform?.label}</Badge>
                <Badge variant="outline" className="text-[10px]">{template.pattern}</Badge>
{template.isCardSetting && <Badge className="border-blue-500/30 bg-blue-500/15 text-[10px] text-blue-400">Card Setting</Badge>}
              </div>
              <div className="flex gap-1">{template.gradient.map((color, index)=><div key={`${template.id}-${index}`} className="h-5 w-5 rounded border border-border/50" style={{ background:color }}/>)}</div>
              <div className="flex items-center gap-2 border-t border-border/30 pt-1">
                <Switch checked={template.isActive} onCheckedChange={()=>toggleTemplate(template.id)} className="scale-75"/>
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
<DropdownMenuItem onClick={()=>toggleCardSetting(template.id)}>
                        <CheckCircle2 size={14} className={`mr-2 ${template.isCardSetting ? "text-blue-400" : ""}`} />
                        {template.isCardSetting ? "Remove card setting" : "Add card setting"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={()=>openEdit(template)}>
                        <Pencil size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={()=>duplicateTemplate(template.id)}>
                        <Copy size={14} className="mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={()=>setDeleteModal(template)} disabled={template.isDefault} className="text-destructive focus:text-destructive">
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>;
        })}
      </div>

      {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground"><Palette size={48} className="mx-auto mb-4 opacity-30"/><p>No templates found</p></div>}
    </div>

    <Dialog open={editModal} onOpenChange={setEditModal}>
      <DialogContent className="flex h-[92vh] max-h-[92vh] max-w-7xl flex-col overflow-hidden">
        <DialogHeader><DialogTitle>{editingId ? "Edit Template" : "Create Template"}</DialogTitle><DialogDescription>Modal aligned with Customize for template construction and live preview.</DialogDescription></DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <ScrollArea className="h-full border-r border-border/30">
          <div className="space-y-5 px-6 py-4">
              <Section icon={Palette} title="Basic Info">
                <div className="grid gap-3 md:grid-cols-2">
                  <div><label className="text-xs text-muted-foreground">Template Name</label><Input value={form.name} onChange={(e)=>updateForm({ name:e.target.value, businessName:e.target.value })} className="mt-1"/></div>
                  <div><label className="text-xs text-muted-foreground">Platform</label><Select value={form.platform} onValueChange={(value)=>updateForm({ platform:value, accentColor: PLATFORMS.find((item)=>item.id===value)?.color || form.accentColor })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{PLATFORMS.map((platform)=><SelectItem key={platform.id} value={platform.id}>{platform.icon} {platform.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Pattern</label><Select value={form.pattern} onValueChange={(value)=>updateForm({ pattern:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{PATTERNS.map((pattern)=><SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>)}</SelectContent></Select></div>
                  <div className="flex flex-col justify-end gap-2"><div className="flex items-center gap-3"><Switch checked={form.isActive} onCheckedChange={(value)=>updateForm({ isActive:value })}/><span className="text-sm">Active</span></div><div className="flex items-center gap-3"><Switch checked={form.isDefault} onCheckedChange={(value)=>updateForm({ isDefault:value })}/><span className="text-sm">Set as default</span></div></div>
                </div>
              </Section>

              <Section icon={Type} title="Card Content">
                <div className="grid gap-3 md:grid-cols-2">
                  <div><label className="text-xs text-muted-foreground">Business Name</label><Input value={form.businessName} onChange={(e)=>updateForm({ businessName:e.target.value })} className="mt-1"/></div>
                  <div><label className="text-xs text-muted-foreground">Slogan</label><Input value={form.slogan} onChange={(e)=>updateForm({ slogan:e.target.value })} className="mt-1"/></div>
                  <div className="md:col-span-2"><label className="text-xs text-muted-foreground">CTA</label><Input value={form.cta} onChange={(e)=>updateForm({ cta:e.target.value })} className="mt-1"/></div>
                </div>
              </Section>

              <Section icon={RotateCcw} title="Layout">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground">Orientation / Layout</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { id:"landscape", cls:"h-[18px] w-[30px] rounded-[3px]" },
                        { id:"portrait",  cls:"h-[30px] w-[18px] rounded-[3px]" },
                        { id:"square",    cls:"h-[22px] w-[22px] rounded-[3px]" },
                        { id:"circle",    cls:"h-[22px] w-[22px] rounded-full"  },
                      ].map(({ id, cls })=>{
                        const mappedOrientation = id === "portrait" ? "portrait" : "landscape";
                        const selected = previewLayout === id;
                        return (
                        <button key={id} type="button"
                          onClick={()=>{ setPreviewLayout(id); updateForm({ orientation:mappedOrientation, qrPosition: mappedOrientation==="portrait"?"top":"right", logoPosition: mappedOrientation==="portrait"?"top-center":"left" }); }}
                          className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium capitalize transition-all ${selected ? "border-primary/50 bg-primary/10 text-primary":"border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
                          <div className={`border-2 ${cls} ${selected ? "border-current opacity-100" : "border-current opacity-40"}`}/>
                          {id}
                        </button>
                      )})}
                    </div>
                  </div>
                  <div><label className="text-xs text-muted-foreground">Band Position</label><div className="mt-2 grid grid-cols-3 gap-2">{["top","bottom","hidden"].map((position)=><button key={position} type="button" onClick={()=>updateForm({ bandPosition:position })} className={`rounded-lg border px-3 py-2 text-xs font-medium ${form.bandPosition===position ? "border-primary/50 bg-primary/10 text-primary":"border-border/50"}`}>{position}</button>)}</div></div>
                  <div><label className="text-xs text-muted-foreground">Front Band Height ({form.frontBandHeight}%)</label><Presets values={BANDS} active={form.frontBandHeight} onSelect={(value)=>updateForm({ frontBandHeight:value })} suffix="%"/></div>
                  <div><label className="text-xs text-muted-foreground">Back Band Height ({form.backBandHeight}%)</label><Presets values={BANDS} active={form.backBandHeight} onSelect={(value)=>updateForm({ backBandHeight:value })} suffix="%"/></div>
                  <div><label className="text-xs text-muted-foreground">QR Position</label><div className="mt-2 grid grid-cols-2 gap-2">{(form.orientation==="landscape" ? ["left","right"] : ["top","bottom"]).map((position)=><button key={position} type="button" onClick={()=>updateForm({ qrPosition:position })} className={`rounded-lg border px-3 py-2 text-xs font-medium ${form.qrPosition===position ? "border-primary/50 bg-primary/10 text-primary":"border-border/50"}`}>{position}</button>)}</div></div>
                  <div><label className="text-xs text-muted-foreground">QR Size ({form.qrSize}px)</label><Presets values={QR_SIZES} active={form.qrSize} onSelect={(value)=>updateForm({ qrSize:value })}/></div>
                </div>
              </Section>

              <Section icon={ImageIcon} title="Logo And Icons">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-secondary/30">{form.logoUrl ? <img src={form.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain"/> : <ImageIcon size={18} className="text-muted-foreground"/>}</div>
                  <div className="flex-1 space-y-3">
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload}/>
                    <div className="flex gap-2"><Button type="button" variant="outline" className="gap-2 border-border/50" onClick={()=>logoInputRef.current?.click()}><Upload size={14}/>Upload logo</Button>{form.logoUrl && <Button type="button" variant="ghost" onClick={()=>updateForm({ logoUrl:null })}>Remove</Button>}</div>
                    <div><label className="text-xs text-muted-foreground">Logo Position</label><div className="mt-2 grid grid-cols-2 gap-2">{(form.orientation==="landscape" ? ["left","right"] : ["top-center","bottom-center"]).map((position)=><button key={position} type="button" onClick={()=>updateForm({ logoPosition:position })} className={`rounded-lg border px-3 py-2 text-xs font-medium ${form.logoPosition===position ? "border-primary/50 bg-primary/10 text-primary":"border-border/50"}`}>{position}</button>)}</div></div>
                    <div><label className="text-xs text-muted-foreground">Logo Size ({form.logoSize}px)</label><Presets values={LOGO_SIZES} active={form.logoSize} onSelect={(value)=>updateForm({ logoSize:value })}/></div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"><span className="text-xs font-medium">NFC icon</span><Switch checked={form.showNfcIcon} onCheckedChange={(value)=>updateForm({ showNfcIcon:value })}/></div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"><span className="text-xs font-medium">Platform icon</span><Switch checked={form.showGoogleIcon} onCheckedChange={(value)=>updateForm({ showGoogleIcon:value })}/></div>
                  <div><label className="text-xs text-muted-foreground">NFC Size ({form.nfcIconSize}px)</label><Presets values={ICON_SIZES} active={form.nfcIconSize} onSelect={(value)=>updateForm({ nfcIconSize:value })}/></div>
                  <div><label className="text-xs text-muted-foreground">Platform Icon Size ({form.googleIconSize}px)</label><Presets values={ICON_SIZES} active={form.googleIconSize} onSelect={(value)=>updateForm({ googleIconSize:value })}/></div>
                </div>
              </Section>

              <Section icon={Palette} title="Colors">
                <Tabs value={form.colorMode} onValueChange={(value)=>updateForm({ colorMode:value })} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Single Color</TabsTrigger>
                    <TabsTrigger value="template">From Template</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="space-y-4 pt-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Quick Presets</label>
                      <div className="mt-2 grid grid-cols-3 gap-2 md:grid-cols-6">
                        {SINGLE_COLOR_PRESETS.map((preset)=>(
                          <button
                            key={preset.label}
                            type="button"
                            onClick={()=>updateForm({ colorMode:"single", gradient:[preset.bg, preset.bg], textColor:preset.text, qrColor:preset.qr, iconsColor:"#22C55E", starsColor:preset.qr })}
                            className={`rounded-lg border p-2 text-center transition-all ${form.gradient[0]===preset.bg && form.gradient[1]===preset.bg && form.textColor===preset.text && form.qrColor===preset.qr ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30":"border-border/50 hover:border-border"}`}
                          >
                            <div className="mx-auto h-6 w-6 rounded-full border border-border/30" style={{ background:preset.bg }}/>
                            <span className="mt-1 block text-[10px] text-muted-foreground">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <ColorField label="Background" value={form.gradient[0]} onChange={(value)=>updateForm({ gradient:[value, value] })}/>
                      <ColorField label="Text Color" value={form.textColor} onChange={(value)=>updateForm({ textColor:value })}/>
                      <ColorField label="QR Color" value={form.qrColor} onChange={(value)=>updateForm({ qrColor:value })}/>
                      <ColorField label="Stars Color" value={form.starsColor} onChange={(value)=>updateForm({ starsColor:value })}/>
                      <ColorField label="Icons Color" value={form.iconsColor} onChange={(value)=>updateForm({ iconsColor:value })}/>
                      <ColorField label="Accent Color" value={form.accentColor} onChange={(value)=>updateForm({ accentColor:value })}/>
                    </div>
                  </TabsContent>

                  <TabsContent value="template" className="space-y-4 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {TEMPLATE_CATEGORIES.map((category)=>(
                        <button
                          key={category.id}
                          type="button"
                          onClick={()=>setTemplateFilter(category.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${templateFilter===category.id ? "bg-primary text-primary-foreground":"bg-secondary text-secondary-foreground hover:bg-muted"}`}
                        >
                          {category.label}
                          <span className="ml-1.5 opacity-60">
                            {category.id === "all" ? QUICK_TEMPLATES.length : QUICK_TEMPLATES.filter((item)=>item.category===category.id).length}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {QUICK_TEMPLATES.filter((item)=>templateFilter==="all" || item.category===templateFilter).map((template)=>(
                        <button
                          key={template.id}
                          type="button"
                          onClick={()=>applyTemplate(template)}
                          className={`rounded-lg border p-3 text-left transition-all ${form.gradient[0]===template.gradient1 && form.gradient[1]===template.gradient2 && form.pattern===template.pattern ? "border-primary/50 bg-primary/10":"border-border/50 hover:border-border"}`}
                        >
                          <div className="relative mb-2 aspect-[1.6/1] overflow-hidden rounded-md" style={{ background:`linear-gradient(160deg, ${template.gradient1} 0%, ${template.gradient2} 70%)` }}>
                            <div className="absolute inset-x-0 bottom-0 h-[22%]" style={{ background:`linear-gradient(90deg, ${template.accentBand1} 0%, ${template.accentBand2} 100%)`, opacity:0.9 }}/>
                            <div className="relative z-10 p-2">
                              <div className="h-1.5 w-10 rounded bg-white/60"/>
                              <div className="mt-1 h-1 w-6 rounded bg-white/30"/>
                            </div>
                          </div>
                          <span className="text-xs font-medium">{template.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <ColorField label="Gradient Start" value={form.gradient[0]} onChange={(value)=>updateForm({ gradient:[value, form.gradient[1] || value] })}/>
                      <ColorField label="Gradient End" value={form.gradient[1] || form.gradient[0]} onChange={(value)=>updateForm({ gradient:[form.gradient[0], value] })}/>
                      <ColorField label="Band Color 1" value={form.bandColor1} onChange={(value)=>updateForm({ bandColor1:value })}/>
                      <ColorField label="Band Color 2" value={form.bandColor2} onChange={(value)=>updateForm({ bandColor2:value })}/>
                      <ColorField label="Text Color" value={form.textColor} onChange={(value)=>updateForm({ textColor:value })}/>
                      <ColorField label="QR Color" value={form.qrColor} onChange={(value)=>updateForm({ qrColor:value })}/>
                      <ColorField label="Stars Color" value={form.starsColor} onChange={(value)=>updateForm({ starsColor:value })}/>
                      <ColorField label="Icons Color" value={form.iconsColor} onChange={(value)=>updateForm({ iconsColor:value })}/>
                    </div>
                  </TabsContent>
                </Tabs>
              </Section>

              <Section icon={Type} title="Typography">
                <div className="grid gap-3 md:grid-cols-2">
                  <div><label className="text-xs text-muted-foreground">Business Font</label><Select value={form.nameFont} onValueChange={(value)=>updateForm({ nameFont:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{FONTS.map((font)=><SelectItem key={font.id} value={font.family}>{font.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Slogan Font</label><Select value={form.sloganFont} onValueChange={(value)=>updateForm({ sloganFont:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{FONTS.map((font)=><SelectItem key={font.id} value={font.family}>{font.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Business Size ({form.nameFontSize}px)</label><Presets values={TEXT_SIZES} active={form.nameFontSize} onSelect={(value)=>updateForm({ nameFontSize:value })}/></div>
                  <div><label className="text-xs text-muted-foreground">Slogan Size ({form.sloganFontSize}px)</label><Presets values={TEXT_SIZES} active={form.sloganFontSize} onSelect={(value)=>updateForm({ sloganFontSize:value })}/></div>
                  <div><label className="text-xs text-muted-foreground">Business Weight</label><Select value={form.nameFontWeight} onValueChange={(value)=>updateForm({ nameFontWeight:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{WEIGHTS.map((option)=><SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Slogan Weight</label><Select value={form.sloganFontWeight} onValueChange={(value)=>updateForm({ sloganFontWeight:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{WEIGHTS.map((option)=><SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Business Align</label><Select value={form.nameTextAlign} onValueChange={(value)=>updateForm({ nameTextAlign:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{ALIGNS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Slogan Align</label><Select value={form.sloganTextAlign} onValueChange={(value)=>updateForm({ sloganTextAlign:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{ALIGNS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Business Spacing</label><Select value={form.nameLetterSpacing} onValueChange={(value)=>updateForm({ nameLetterSpacing:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{SPACINGS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Slogan Spacing</label><Select value={form.sloganLetterSpacing} onValueChange={(value)=>updateForm({ sloganLetterSpacing:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{SPACINGS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Business Transform</label><Select value={form.nameTextTransform} onValueChange={(value)=>updateForm({ nameTextTransform:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{TRANSFORMS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Slogan Transform</label><Select value={form.sloganTextTransform} onValueChange={(value)=>updateForm({ sloganTextTransform:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{TRANSFORMS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Business Line Height</label><Select value={form.nameLineHeight} onValueChange={(value)=>updateForm({ nameLineHeight:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{LINE_HEIGHTS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Slogan Line Height</label><Select value={form.sloganLineHeight} onValueChange={(value)=>updateForm({ sloganLineHeight:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{LINE_HEIGHTS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Text Shadow</label><div className="mt-2 flex flex-wrap gap-2">{TEXT_SHADOWS.map((shadow)=><button key={shadow} type="button" onClick={()=>updateForm({ textShadow:shadow })} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${form.textShadow===shadow ? "border-primary/50 bg-primary/10 text-primary":"border-border/50 text-muted-foreground hover:border-border"}`}>{shadow}</button>)}</div></div>
                </div>
              </Section>

              <Section icon={QrCode} title="Instructions And CTA">
                <div className="grid gap-3 md:grid-cols-2">
                  <div><label className="text-xs text-muted-foreground">Front Line 1</label><Input value={form.frontLine1} onChange={(e)=>updateForm({ frontLine1:e.target.value })} className="mt-1"/></div>
                  <div><label className="text-xs text-muted-foreground">Front Line 2</label><Input value={form.frontLine2} onChange={(e)=>updateForm({ frontLine2:e.target.value })} className="mt-1"/></div>
                  <div><label className="text-xs text-muted-foreground">Back Line 1</label><Input value={form.backLine1} onChange={(e)=>updateForm({ backLine1:e.target.value })} className="mt-1"/></div>
                  <div><label className="text-xs text-muted-foreground">Back Line 2</label><Input value={form.backLine2} onChange={(e)=>updateForm({ backLine2:e.target.value })} className="mt-1"/></div>
                  <div><label className="text-xs text-muted-foreground">Instruction Font</label><Select value={form.instructionFont} onValueChange={(value)=>updateForm({ instructionFont:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{FONTS.map((font)=><SelectItem key={font.id} value={font.family}>{font.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Instruction Size ({form.instructionFontSize}px)</label><Presets values={INSTR_SIZES} active={form.instructionFontSize} onSelect={(value)=>updateForm({ instructionFontSize:value })}/></div>
                  <div><label className="text-xs text-muted-foreground">Instruction Weight</label><Select value={form.instructionFontWeight} onValueChange={(value)=>updateForm({ instructionFontWeight:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{WEIGHTS.map((option)=><SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Instruction Align</label><Select value={form.instructionTextAlign} onValueChange={(value)=>updateForm({ instructionTextAlign:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{ALIGNS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Instruction Spacing</label><Select value={form.instructionLetterSpacing} onValueChange={(value)=>updateForm({ instructionLetterSpacing:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{SPACINGS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Instruction Line Height</label><Select value={form.instructionLineHeight} onValueChange={(value)=>updateForm({ instructionLineHeight:value })}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{LINE_HEIGHTS.map((option)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs text-muted-foreground">Check Stroke ({form.checkStrokeWidth})</label><Input type="range" min={1} max={5} step={0.5} value={form.checkStrokeWidth} onChange={(e)=>updateForm({ checkStrokeWidth:Number(e.target.value) })} className="mt-2"/></div>
                  <div><label className="text-xs text-muted-foreground">CTA Padding ({form.ctaPaddingTop}px)</label><Presets values={PADDINGS} active={form.ctaPaddingTop} onSelect={(value)=>updateForm({ ctaPaddingTop:value })}/></div>
                  <div><label className="text-xs text-muted-foreground">Google Icon Size ({form.googleIconSize}px)</label><Presets values={ICON_SIZES} active={form.googleIconSize} onSelect={(value)=>updateForm({ googleIconSize:value })}/></div>
                </div>
              </Section>

            </div>
          </ScrollArea>

            <div className="hidden xl:flex xl:flex-col overflow-y-auto px-6 py-4">
              <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: currentPlatform?.color || "#666" }}>
                      {currentPlatform?.icon || "?"}
                    </div>
                    <h3 className="font-display text-lg font-semibold">Live Preview</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={()=>setDragMode((prev)=>!prev)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${dragMode ? "bg-primary text-primary-foreground shadow-sm" : "border border-border/50 bg-secondary text-muted-foreground hover:text-foreground"}`}>
                      <Smartphone size={12}/> Move
                    </button>
                    {dragMode && <button type="button" onClick={resetPositions} className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground"><RotateCcw size={12}/> Reset</button>}
                    <div className="flex overflow-hidden rounded-lg border border-border/50">
                      <button type="button" onClick={()=>setPreviewSide("front")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${previewSide==="front" ? "bg-primary text-primary-foreground":"bg-secondary text-muted-foreground hover:text-foreground"}`}>Front</button>
                      <button type="button" onClick={()=>setPreviewSide("back")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${previewSide==="back" ? "bg-primary text-primary-foreground":"bg-secondary text-muted-foreground hover:text-foreground"}`}>Back</button>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <SharedCardPreview design={previewDesign} orientation={form.orientation} side={previewSide} frontLine1={form.frontLine1} frontLine2={form.frontLine2} backLine1={form.backLine1} backLine2={form.backLine2} gradient1={form.gradient[0]} gradient2={form.gradient[1]} accentBand1={form.bandColor1} accentBand2={form.bandColor2} pattern={form.pattern} bandPosition={form.bandPosition} colorMode={form.colorMode} nameFont={form.nameFont} sloganFont={form.sloganFont} nameFontSize={form.nameFontSize} sloganFontSize={form.sloganFontSize} nameLetterSpacing={form.nameLetterSpacing} sloganLetterSpacing={form.sloganLetterSpacing} nameTextTransform={form.nameTextTransform} sloganTextTransform={form.sloganTextTransform} nameLineHeight={form.nameLineHeight} sloganLineHeight={form.sloganLineHeight} nameTextAlign={form.nameTextAlign} sloganTextAlign={form.sloganTextAlign} qrPosition={form.qrPosition} logoPosition={form.logoPosition} logoSize={form.logoSize} qrSize={form.qrSize} instructionFont={form.instructionFont} instructionFontSize={form.instructionFontSize} instructionLetterSpacing={form.instructionLetterSpacing} instructionLineHeight={form.instructionLineHeight} instructionTextAlign={form.instructionTextAlign} nameFontWeight={form.nameFontWeight} sloganFontWeight={form.sloganFontWeight} instructionFontWeight={form.instructionFontWeight} checkStrokeWidth={form.checkStrokeWidth} starsColor={form.starsColor} iconsColor={form.iconsColor} nfcIconSize={form.nfcIconSize} showNfcIcon={form.showNfcIcon} showGoogleIcon={form.showGoogleIcon} frontBandHeight={form.frontBandHeight} backBandHeight={form.backBandHeight} textShadow={form.textShadow} ctaPaddingTop={form.ctaPaddingTop} googleIconSize={form.googleIconSize} dragMode={dragMode} elementOffsets={form.elementOffsets?.[form.orientation]?.[previewSide] || OFFSETS} onElementDrag={handleElementDrag}/>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1 text-xs" style={{ borderColor: `${currentPlatform?.color || "#666"}40`, color: currentPlatform?.color || "#666" }}>
                      <span className="text-[10px]">{currentPlatform?.icon || "?"}</span> {currentPlatform?.label || "Platform"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{MODEL_LABELS[form.model] || form.model}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{form.orientation}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{previewSide}</Badge>
                  </div>
                  <Badge className={form.isActive ? "border-green-500/30 bg-green-500/20 text-green-400" : "border-yellow-500/30 bg-yellow-500/20 text-yellow-400"}>
                    {form.isActive ? "Validated" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t border-border/50 pt-4"><Button variant="outline" onClick={()=>setEditModal(false)} disabled={saving}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{editingId ? "Update Template" : "Create Template"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
      <DialogContent><DialogHeader><DialogTitle>Delete Template</DialogTitle><DialogDescription>Permanently delete <span className="font-bold">"{deleteModal?.name}"</span>? This cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={()=>setDeleteModal(null)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter></DialogContent>
    </Dialog>
  </SuperAdminLayout>;
}
