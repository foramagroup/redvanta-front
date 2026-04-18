"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import SharedCardPreview from "@/components/designs/SharedCardPreview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductGallery } from "@/components/ProductGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Globe, Package, Upload, X, Loader2, GripVertical, Images, Layers, CreditCard, Film, ImageIcon, Play, Youtube, Link as LinkIcon, Palette, Settings2, RectangleHorizontal, RectangleVertical, Square, Circle, Star, RotateCcw, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { PLATFORMS } from "@/data/cardTemplates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { get, post, put, remove } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const DEFAULT_LANGUAGES = ["en", "fr", "de", "es"];
const DEFAULT_LANG_LABELS = { en: "English", fr: "French", de: "German", es: "Spanish" };

const DEFAULT_CARD_TYPES = [
  { id: "classic", name: "Classic", color: "#6b7280", image: "/placeholder.svg", active: true },
  { id: "premium", name: "Premium", color: "#f59e0b", image: "/placeholder.svg", active: true },
  { id: "metal", name: "Metal", color: "#94a3b8", image: "/placeholder.svg", active: true },
  { id: "transparent", name: "Transparent", color: "#7dd3fc", image: "/placeholder.svg", active: true },
];

const DEFAULT_CARD_SETTINGS = {
  width: 85,
  height: 54,
  cornerRadiusEnabled: true,
  cornerRadius: 8,
  layouts: ["landscape"],
  reviewPlatform: "google",
  defaultTemplateId: "google-classic",
  availableTemplates: [],
};

const LAYOUT_OPTIONS = [
  { value: "landscape", label: "Landscape", icon: RectangleHorizontal },
  { value: "portrait", label: "Portrait", icon: RectangleVertical },
  { value: "square", label: "Square", icon: Square },
  { value: "circle", label: "Circle", icon: Circle },
];

const defaultPackageTiers = [
  { qty: 1, price: 29 },
  { qty: 10, price: 24 },
  { qty: 50, price: 19 },
  { qty: 100, price: 15 },
];

const defaultCardTypePrices = [
  { typeId: "classic", price: 0 },
  { typeId: "premium", price: 10 },
  { typeId: "metal", price: 25 },
  { typeId: "transparent", price: 15 },
];

const initialProducts = [
  { id: 1, slug: { en: "premium-table-stand" }, price: 39, active: true, image: "/placeholder.svg", gallery: [], title: { en: "Premium Table Stand", fr: "Support de Table Premium" }, seoTitle: { en: "Premium Table Stand - Opinoor" }, metaDescription: { en: "Elegant acrylic stand to display your card at reception or checkout counter." }, metaImage: { en: "/placeholder.svg" }, packageTiers: [], cardTypePrices: [], cardSettings: { ...DEFAULT_CARD_SETTINGS } },
  { id: 2, slug: { en: "qr-sticker-pack" }, price: 19, active: true, image: "/placeholder.svg", gallery: [], title: { en: "QR Sticker Pack (10x)", fr: "Pack Autocollants QR (10x)" }, seoTitle: { en: "QR Sticker Pack - Opinoor" }, metaDescription: { en: "Waterproof vinyl stickers with your unique QR code." }, metaImage: { en: "/placeholder.svg" }, packageTiers: [], cardTypePrices: [], cardSettings: { ...DEFAULT_CARD_SETTINGS } },
  { id: 3, slug: { en: "premium-card-upgrade" }, price: 20, active: true, image: "/placeholder.svg", gallery: [], title: { en: "Premium Card Upgrade", fr: "Carte Premium" }, seoTitle: { en: "Premium Card Upgrade - Opinoor" }, metaDescription: { en: "Upgrade to metallic finish and enhanced durability." }, metaImage: { en: "/placeholder.svg" }, packageTiers: defaultPackageTiers, cardTypePrices: defaultCardTypePrices, cardSettings: { ...DEFAULT_CARD_SETTINGS } },
  { id: 4, slug: { en: "duplicate-card" }, price: 24, active: true, image: "/placeholder.svg", gallery: [], title: { en: "Duplicate Card (Different Color)", fr: "Carte Dupliquée (Couleur Différente)" }, seoTitle: { en: "Duplicate Card - Opinoor" }, metaDescription: { en: "Create a color variant linked to the same location." }, metaImage: { en: "/placeholder.svg" }, packageTiers: [], cardTypePrices: [], cardSettings: { ...DEFAULT_CARD_SETTINGS } },
  { id: 5, slug: { en: "nfc-qr-bundle" }, price: 69, active: true, image: "/placeholder.svg", gallery: [], title: { en: "NFC + QR Bundle", fr: "Pack NFC + QR" }, seoTitle: { en: "NFC + QR Bundle - Opinoor" }, metaDescription: { en: "Smart Review Card + Table Stand + 10 QR Stickers at 20% off." }, metaImage: { en: "/placeholder.svg" }, packageTiers: defaultPackageTiers, cardTypePrices: defaultCardTypePrices, cardSettings: { ...DEFAULT_CARD_SETTINGS } },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_DIMENSION = 2000;
const COMPRESS_QUALITY = 0.8;
const MAX_GALLERY_ITEMS = 10;
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg"];

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/webp", COMPRESS_QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

async function processFile(file) {
  if (!file.type.startsWith("image/")) {
    toast({ title: "Invalid file", description: `"${file.name}" is not an image.`, variant: "destructive" });
    return null;
  }
  if (file.size > MAX_FILE_SIZE) {
    toast({ title: "File too large", description: `"${file.name}" exceeds ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB limit.`, variant: "destructive" });
    return null;
  }
  try {
    return await compressImage(file);
  } catch {
    toast({ title: "Compression failed", description: `Could not process "${file.name}".`, variant: "destructive" });
    return null;
  }
}

function isVideoFile(file) {
  return file.type.startsWith("video/") || VIDEO_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
}

function processVideoFile(file) {
  return new Promise((resolve) => {
    if (file.size > MAX_VIDEO_SIZE) {
      toast({ title: "Video too large", description: `"${file.name}" exceeds ${Math.round(MAX_VIDEO_SIZE / 1024 / 1024)}MB limit.`, variant: "destructive" });
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => { toast({ title: "Upload failed", description: `Could not read "${file.name}".`, variant: "destructive" }); resolve(null); };
    reader.readAsDataURL(file);
  });
}

async function processMediaFile(file) {
  if (isVideoFile(file)) {
    const url = await processVideoFile(file);
    return url ? { url, type: "video" } : null;
  }
  const url = await processFile(file);
  return url ? { url, type: "image" } : null;
}

function ImageDropZone({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file) => {
    setLoading(true);
    const result = await processFile(file);
    if (result) onChange(result);
    setLoading(false);
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInput = (e) => { const f = e.target.files?.[0]; if (f) handleFile(f); };
  const hasImage = value && value !== "/placeholder.svg";

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {hasImage ? (
        <div className="relative group rounded-lg border border-border overflow-hidden bg-secondary">
          <img src={value} alt="Preview" className="w-full h-28 object-contain" />
          <button onClick={() => onChange("/placeholder.svg")} className="absolute top-1.5 right-1.5 rounded-full bg-background/80 backdrop-blur p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"><X size={14} /></button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
          className={cn("flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed cursor-pointer h-28 transition-colors", dragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40 hover:bg-secondary/50")}>
          {loading ? <Loader2 size={18} className="text-muted-foreground animate-spin" /> : (
            <>
              <Upload size={18} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Drop image or click to upload</p>
              <p className="text-[10px] text-muted-foreground/60">Max 5MB · Auto-compressed</p>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInput} />
    </div>
  );
}

function extractYoutubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function GalleryUploader({ items, onChange, max = MAX_GALLERY_ITEMS }) {
  const inputRef = useRef(null);
  const posterInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [posterTarget, setPosterTarget] = useState(null);
  const dragItemRef = useRef(null);
  const dragOverRef = useRef(null);

  const handleFiles = async (files) => {
    const remaining = max - items.length;
    if (remaining <= 0) {
      toast({ title: "Gallery full", description: `Maximum ${max} items allowed.`, variant: "destructive" });
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    setLoading(true);
    const results = await Promise.all(selected.map(processMediaFile));
    const valid = results.filter(Boolean);
    if (valid.length > 0) {
      onChange([...items, ...valid]);
      const videoCount = valid.filter(v => v.type === "video").length;
      const imageCount = valid.length - videoCount;
      const parts = [];
      if (imageCount > 0) parts.push(`${imageCount} image${imageCount > 1 ? "s" : ""}`);
      if (videoCount > 0) parts.push(`${videoCount} video${videoCount > 1 ? "s" : ""}`);
      toast({ title: `${parts.join(" & ")} added`, description: `Gallery now has ${items.length + valid.length} of ${max} items.` });
    }
    setLoading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => { dragItemRef.current = index; };
  const handleDragEnter = (index) => { dragOverRef.current = index; };

  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverRef.current === null || dragItemRef.current === dragOverRef.current) {
      dragItemRef.current = null;
      dragOverRef.current = null;
      return;
    }
    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragItemRef.current, 1);
    newItems.splice(dragOverRef.current, 0, draggedItem);
    onChange(newItems);
    dragItemRef.current = null;
    dragOverRef.current = null;
  };

  const setAsPrimary = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    const [item] = newItems.splice(index, 1);
    newItems.unshift(item);
    onChange(newItems);
  };

  const handlePosterSelect = async (e) => {
    const file = e.target.files?.[0];
    if (posterTarget === null || !file) return;
    const result = await processFile(file);
    if (result) {
      const newItems = [...items];
      newItems[posterTarget] = { ...newItems[posterTarget], poster: result };
      onChange(newItems);
      toast({ title: "Poster set", description: "Video thumbnail updated." });
    }
    setPosterTarget(null);
    e.target.value = "";
  };

  const removePoster = (index) => {
    const newItems = [...items];
    const { poster: _, ...rest } = newItems[index];
    newItems[index] = rest;
    onChange(newItems);
  };

  const addYoutubeVideo = () => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) return;
    const videoId = extractYoutubeId(trimmed);
    if (!videoId) {
      toast({ title: "Invalid YouTube URL", description: "Please enter a valid YouTube video URL.", variant: "destructive" });
      return;
    }
    if (items.length >= max) {
      toast({ title: "Gallery full", description: `Maximum ${max} items allowed.`, variant: "destructive" });
      return;
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const poster = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    onChange([...items, { url: embedUrl, type: "youtube", poster }]);
    toast({ title: "YouTube video added", description: "Video embed has been added to the gallery." });
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  };

  const videoCount = items.filter(i => i.type === "video").length;
  const youtubeCount = items.filter(i => i.type === "youtube").length;
  const imageCount = items.length - videoCount - youtubeCount;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2"><Images size={14} /> Product Gallery</Label>
        <div className="flex items-center gap-2">
          {videoCount > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Film size={10} />{videoCount}</span>}
          {youtubeCount > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Youtube size={10} />{youtubeCount}</span>}
          {imageCount > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><ImageIcon size={10} />{imageCount}</span>}
          <span className="text-[10px] text-muted-foreground">{items.length}/{max}</span>
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {items.map((item, i) => (
            <div
              key={`${i}-${item.url.slice(-20)}`}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                "relative group rounded-lg border overflow-hidden bg-secondary aspect-square cursor-grab active:cursor-grabbing",
                i === 0 ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
              )}
            >
              {item.type === "youtube" ? (
                <>
                  <img src={item.poster || "/placeholder.svg"} alt={`YouTube ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Youtube size={8} /> YT
                  </div>
                </>
              ) : item.type === "video" ? (
                <>
                  {item.poster ? (
                    <img src={item.poster} alt={`Video poster ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Film size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-primary/90 text-primary-foreground text-[8px] font-medium px-1.5 py-0.5 rounded">
                    VIDEO
                  </div>
                  <div className="absolute bottom-0.5 left-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPosterTarget(i); posterInputRef.current?.click(); }}
                      className="rounded bg-background/80 backdrop-blur text-[7px] font-medium px-1.5 py-0.5 hover:bg-background"
                      title="Set poster image"
                    >
                      {item.poster ? "Change Poster" : "Add Poster"}
                    </button>
                    {item.poster && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removePoster(i); }}
                        className="rounded bg-destructive/80 text-destructive-foreground text-[7px] px-1 py-0.5 hover:bg-destructive"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <img src={item.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button onClick={() => removeItem(i)} className="rounded-full bg-destructive/90 text-destructive-foreground p-1 hover:bg-destructive"><X size={12} /></button>
                {i !== 0 && (
                  <button onClick={() => setAsPrimary(i)} className="rounded-full bg-primary/90 text-primary-foreground p-1 hover:bg-primary text-[8px] font-bold px-1.5">1st</button>
                )}
              </div>
              <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-70 transition-opacity">
                <GripVertical size={12} className="text-foreground" />
              </div>
              {i === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-primary/80 text-primary-foreground text-[8px] text-center py-0.5 font-medium">Primary</span>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length < max && (
        <div className="space-y-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed cursor-pointer py-4 transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40 hover:bg-secondary/50"
            )}
          >
            {loading ? (
              <Loader2 size={18} className="text-muted-foreground animate-spin" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-muted-foreground" />
                  <Film size={16} className="text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Drop images or videos, or click to upload</p>
                <p className="text-[10px] text-muted-foreground/60">Images: max 5MB · Videos: max 50MB · Up to {max - items.length} more · Drag to reorder</p>
              </>
            )}
          </div>

          {/* YouTube embed input */}
          {showYoutubeInput ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
                  className="pl-8 h-9 text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addYoutubeVideo(); } }}
                />
              </div>
              <Button size="sm" variant="default" onClick={addYoutubeVideo} className="h-9 px-3">
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowYoutubeInput(false); setYoutubeUrl(""); }} className="h-9 px-2">
                <X size={14} />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowYoutubeInput(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Youtube size={14} className="text-red-500" />
              Add YouTube video embed
            </button>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg" multiple className="hidden" onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }} />
      <input ref={posterInputRef} type="file" accept="image/*" className="hidden" onChange={handlePosterSelect} />
    </div>
  );
}

function titleToSlug(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function resolveAssetUrl(value) {
  if (!value || value === "/placeholder.svg") return "/placeholder.svg";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;
  if (value.startsWith("/uploads/")) return `${API_URL}${value}`;
  return value;
}

function normalizeCardType(cardType) {
  return {
    id: cardType.id,
    name: cardType.name,
    color: cardType.color || "#6b7280",
    image: resolveAssetUrl(cardType.image),
    active: Boolean(cardType.active),
  };
}

function normalizeProduct(product) {
  return {
    id: product.id,
    slug: product.slug || { en: "" },
    price: Number(product.price || 0),
    active: Boolean(product.active),
    image: resolveAssetUrl(product.image),
    gallery: Array.isArray(product.gallery)
      ? product.gallery.map((item) => ({
          ...item,
          url: resolveAssetUrl(item.url),
          poster: item.poster ? resolveAssetUrl(item.poster) : item.poster,
        }))
      : [],
    title: product.title || { en: "" },
    seoTitle: product.seoTitle || { en: "" },
    metaDescription: product.metaDescription || { en: "" },
    metaImage: Object.fromEntries(
      Object.entries(product.metaImage || { en: "/placeholder.svg" }).map(([key, value]) => [key, resolveAssetUrl(value)])
    ),
    packageTiers: Array.isArray(product.packageTiers) ? product.packageTiers : [],
    cardTypePrices: Array.isArray(product.cardTypePrices)
      ? product.cardTypePrices.map((item) => ({ typeId: item.typeId || item.cardTypeId, price: Number(item.price || 0) }))
      : [],
    cardSettings: { ...DEFAULT_CARD_SETTINGS, ...(product.cardSettings || {}) },
  };
}

const Products = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [cardTypes, setCardTypes] = useState([]);
  const [cardSettingTemplates, setCardSettingTemplates] = useState([]);
  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);
  const [langLabels, setLangLabels] = useState(DEFAULT_LANG_LABELS);
  const [languageRows, setLanguageRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardTypeDialogOpen, setCardTypeDialogOpen] = useState(false);
  const [editingCardType, setEditingCardType] = useState(null);
  const [cardTypeForm, setCardTypeForm] = useState({ id: "", name: "", color: "#6b7280", image: "/placeholder.svg", active: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeLang, setActiveLang] = useState("en");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [slugManualEdits, setSlugManualEdits] = useState({});
  const [previewProduct, setPreviewProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [previewSide, setPreviewSide] = useState("front");
  const [form, setForm] = useState({
    slug: { en: "" },
    price: 0, active: true, image: "/placeholder.svg",
    gallery: [],
    title: { en: "" },
    seoTitle: { en: "" },
    metaDescription: { en: "" },
    metaImage: { en: "/placeholder.svg" },
    packageTiers: [],
    cardTypePrices: [],
    cardSettings: { ...DEFAULT_CARD_SETTINGS },
  });

  const getApiTemplatesForPlatform = (platform) =>
    cardSettingTemplates.filter((t) => t.platform === platform);

  const findApiTemplateById = (id) =>
    cardSettingTemplates.find((t) => String(t.id) === String(id)) ?? null;

  const apiGradientCSS = (gradient) => {
    const g = Array.isArray(gradient) ? gradient : (typeof gradient === "string" ? JSON.parse(gradient) : ["#1a1a1a", "#1a1a1a"]);
    return `linear-gradient(135deg, ${g[0]} 0%, ${g[1]} 100%)`;
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        const [productsResponse, cardTypesResponse, languagesResponse, templatesResponse] = await Promise.all([
          get("/superadmin/products"),
          get("/superadmin/card-types"),
          get("/superadmin/language-settings", { page: 1, limit: 100 }),
          get("/superadmin/products/available-templates"),
        ]);

        if (cancelled) return;

        const loadedProducts = Array.isArray(productsResponse?.data)
          ? productsResponse.data.map(normalizeProduct)
          : [];
        const loadedCardTypes = Array.isArray(cardTypesResponse?.data)
          ? cardTypesResponse.data.map(normalizeCardType)
          : [];
        const languageRows = Array.isArray(languagesResponse?.data) ? languagesResponse.data : [];
        const loadedTemplates = Array.isArray(templatesResponse?.data) ? templatesResponse.data : [];

        setProducts(loadedProducts);
        setCardTypes(loadedCardTypes);
        setCardSettingTemplates(loadedTemplates);

        if (languageRows.length > 0) {
          const nextCodes = languageRows.map((lang) => lang.code);
          const nextLabels = languageRows.reduce((acc, lang) => {
            acc[lang.code] = lang.name || lang.native || lang.code.toUpperCase();
            return acc;
          }, {});
          setLanguageRows(languageRows);
          setLanguages(nextCodes);
          setLangLabels(nextLabels);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Products",
            description: error?.message || error?.error || "Unable to load product settings.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const buildTranslationsPayload = (productForm) => {
    return Object.keys(productForm.title)
      .filter((code) => productForm.title[code]?.trim())
      .map((code) => {
        const language = languageRows.find((entry) => entry.code === code);
        return {
          langId: language?.id ?? null,
          title: productForm.title[code] || "",
          slug: productForm.slug[code] || titleToSlug(productForm.title[code] || ""),
          seoTitle: productForm.seoTitle[code] || "",
          metaDescription: productForm.metaDescription[code] || "",
          metaImage: productForm.metaImage[code] || "/placeholder.svg",
        };
      })
      .filter((translation) => Number.isInteger(translation.langId) && translation.langId > 0);
  };

  const buildProductPayload = (productForm) => ({
    price: Number(productForm.price || 0),
    active: Boolean(productForm.active),
    image: productForm.image && productForm.image !== "/placeholder.svg" ? productForm.image : undefined,
    defaultTemplateId: productForm.cardSettings?.defaultTemplateId || null,
    availableTemplateIds: Array.isArray(productForm.cardSettings?.availableTemplates)
      ? productForm.cardSettings.availableTemplates
      : [],
    translations: buildTranslationsPayload(productForm),
    gallery: (productForm.gallery || []).map((item, index) => ({
      url: item.url,
      type: item.type,
      poster: item.poster,
      position: index,
    })),
    packageTiers: (productForm.packageTiers || []).map((tier) => ({
      qty: Number(tier.qty || 0),
      price: Number(tier.price || 0),
    })),
    cardTypePrices: (productForm.cardTypePrices || []).map((item) => ({
      cardTypeId: item.typeId,
      price: Number(item.price || 0),
    })),
      cardSettings: {
      width:               Number(productForm.cardSettings?.width)               || 85,
      height:              Number(productForm.cardSettings?.height)              || 54,
      cornerRadiusEnabled: Boolean(productForm.cardSettings?.cornerRadiusEnabled),
      cornerRadius:        Number(productForm.cardSettings?.cornerRadius)        || 0,
      layouts:             Array.isArray(productForm.cardSettings?.layouts)
        ? productForm.cardSettings.layouts
        : ["landscape"],
      reviewPlatform:      productForm.cardSettings?.reviewPlatform    || "google",
      defaultTemplateId:   productForm.cardSettings?.defaultTemplateId || "",
      availableTemplates:  Array.isArray(productForm.cardSettings?.availableTemplates)
        ? productForm.cardSettings.availableTemplates
        : [],
    },
  });

  const openCreate = () => {
    setEditing(null); setActiveLang("en"); setSlugManualEdits({}); setPreviewSide("front");
    const platformTemplates = getApiTemplatesForPlatform("google");
    setForm({ slug: { en: "" }, price: 0, active: true, image: "/placeholder.svg", gallery: [], title: { en: "" }, seoTitle: { en: "" }, metaDescription: { en: "" }, metaImage: { en: "/placeholder.svg" }, packageTiers: [], cardTypePrices: [], cardSettings: { ...DEFAULT_CARD_SETTINGS, availableTemplates: platformTemplates.map(t => t.id) } });
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p); setActiveLang("en"); setPreviewSide("front");
    const manualEdits = {};
    Object.keys(p.slug).forEach(l => { if (p.slug[l]) manualEdits[l] = true; });
    setSlugManualEdits(manualEdits);
    const platform = p.cardSettings.reviewPlatform || "google";
    const availableTemplates = p.cardSettings.availableTemplates?.length > 0
      ? p.cardSettings.availableTemplates
      : getApiTemplatesForPlatform(platform).map(t => t.id);

    const cs = {
    ...p.cardSettings,
    layouts:            [...(p.cardSettings.layouts || ["landscape"])],
    availableTemplates, // ← utiliser la valeur recalculée
    defaultTemplateId:  p.cardSettings.defaultTemplateId || "",
  };
  setForm({ ...form, slug: { ...p.slug }, price: p.price, active: p.active, image: p.image, gallery: [...p.gallery], title: { ...p.title }, seoTitle: { ...p.seoTitle }, metaDescription: { ...p.metaDescription }, metaImage: { ...p.metaImage }, packageTiers: [...p.packageTiers], cardTypePrices: [...p.cardTypePrices], cardSettings: cs });
  setDialogOpen(true);

  };

  const addLang = (lang) => {
    setForm(f => ({ ...f, slug: { ...f.slug, [lang]: "" }, title: { ...f.title, [lang]: "" }, seoTitle: { ...f.seoTitle, [lang]: "" }, metaDescription: { ...f.metaDescription, [lang]: "" }, metaImage: { ...f.metaImage, [lang]: f.metaImage.en || "/placeholder.svg" } }));
    setActiveLang(lang);
  };

  const save = async () => {
    // Validate unique tier quantities
    if (form.packageTiers.length > 0) {
      const qtys = form.packageTiers.map(t => t.qty);
      if (new Set(qtys).size !== qtys.length) {
        toast({ title: "Duplicate quantities", description: "Each package tier must have a unique quantity.", variant: "destructive" });
        return;
      }
    }

    const payload = buildProductPayload(form);
    if (!payload.translations.length) {
      toast({ title: "Products", description: "At least one valid language translation is required.", variant: "destructive" });
      return;
    }

    try {
      if (editing) {
        const response = await put(`/superadmin/products/${editing.id}`, payload);
        const nextProduct = { ...normalizeProduct(response?.data), cardSettings: { ...form.cardSettings } };
        setProducts(ps => ps.map(p => p.id === editing.id ? nextProduct : p));
      } else {
        const response = await post("/superadmin/products", payload);
        const nextProduct = { ...normalizeProduct(response?.data), cardSettings: { ...form.cardSettings } };
        setProducts(ps => [...ps, nextProduct]);
      }
      setDialogOpen(false);
      toast({ title: "Products", description: editing ? "Product updated." : "Product created." });
    } catch (error) {
      toast({
        title: "Products",
        description: error?.message || error?.error || "Unable to save product.",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id) => {
    try {
      await remove(`/superadmin/products/${id}`);
      setProducts(ps => ps.filter(p => p.id !== id));
      toast({ title: "Products", description: "Product deleted." });
    } catch (error) {
      toast({
        title: "Products",
        description: error?.message || error?.error || "Unable to delete product.",
        variant: "destructive",
      });
    }
  };

  // Card Type CRUD
  const openCreateCardType = () => {
    setEditingCardType(null);
    setCardTypeForm({ id: "", name: "", color: "#6b7280", image: "/placeholder.svg", active: true });
    setCardTypeDialogOpen(true);
  };

  const openEditCardType = (ct) => {
    setEditingCardType(ct);
    setCardTypeForm({ ...ct });
    setCardTypeDialogOpen(true);
  };

  const saveCardType = async () => {
    if (!cardTypeForm.name.trim()) {
      toast({ title: "Name required", description: "Card type name cannot be empty.", variant: "destructive" });
      return;
    }

    const payload = {
      name: cardTypeForm.name,
      color: cardTypeForm.color,
      image: cardTypeForm.image && cardTypeForm.image !== "/placeholder.svg" ? cardTypeForm.image : undefined,
      active: Boolean(cardTypeForm.active),
    };

    try {
      if (editingCardType) {
        const response = await put(`/superadmin/card-types/${editingCardType.id}`, payload);
        setCardTypes(cts => cts.map(ct => ct.id === editingCardType.id ? normalizeCardType(response?.data) : ct));
      } else {
        const response = await post("/superadmin/card-types", payload);
        setCardTypes(cts => [...cts, normalizeCardType(response?.data)]);
      }
      setCardTypeDialogOpen(false);
      toast({ title: "Card Types", description: editingCardType ? "Card type updated." : "Card type created." });
    } catch (error) {
      toast({
        title: "Card Types",
        description: error?.message || error?.error || "Unable to save card type.",
        variant: "destructive",
      });
    }
  };

  const deleteCardType = async (id) => {
    try {
      await remove(`/superadmin/card-types/${id}`);
      setCardTypes(cts => cts.filter(ct => ct.id !== id));
      setProducts(ps => ps.map(p => ({
        ...p,
        cardTypePrices: p.cardTypePrices.filter(ctp => ctp.typeId !== id)
      })));
      toast({ title: "Card Types", description: "Card type deleted." });
    } catch (error) {
      toast({
        title: "Card Types",
        description: error?.message || error?.error || "Unable to delete card type.",
        variant: "destructive",
      });
    }
  };

  return (
    <SuperAdminLayout title={t("sa.prod_title")} subtitle={t("sa.prod_subtitle")} headerAction={
      activeTab === "products"
        ? <Button onClick={openCreate}><Plus size={16} className="mr-1" /> {t("sa.prod_create")}</Button>
        : <Button onClick={openCreateCardType}><Plus size={16} className="mr-1" /> New Card Type</Button>
    }>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products" className="flex items-center gap-1.5"><Package size={14} /> Products</TabsTrigger>
          <TabsTrigger value="card-types" className="flex items-center gap-1.5"><Palette size={14} /> Card Types</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card className="border-border/50 bg-card">
            <CardContent className="p-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t("sa.prod_product")}</TableHead><TableHead>{t("sa.prod_slug")}</TableHead><TableHead>{t("sa.prod_price")}</TableHead><TableHead>{t("sa.prod_languages")}</TableHead><TableHead>{t("sa.prod_status")}</TableHead><TableHead className="w-12"></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                            {p.image && p.image !== "/placeholder.svg" ? (
                              <img src={p.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package size={16} className="text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium">{p.title.en}</span>
                            {p.gallery.length > 0 && (
                              <span className="ml-2 text-[10px] text-muted-foreground"><Images size={10} className="inline mr-0.5" />{p.gallery.length}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{p.slug.en || "—"}</TableCell>
                      <TableCell className="font-semibold">${p.price}</TableCell>
                      <TableCell><div className="flex gap-1">{Object.keys(p.title).map(l => <span key={l} className="text-xs bg-secondary px-1.5 py-0.5 rounded">{l.toUpperCase()}</span>)}</div></TableCell>
                      <TableCell><Badge variant={p.active ? "default" : "secondary"}>{p.active ? t("sa.prod_active") : t("sa.prod_inactive")}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(p)}><Pencil size={14} className="mr-2" /> {t("sa.prod_edit")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setPreviewProduct(p); setPreviewOpen(true); }}><Eye size={14} className="mr-2" /> {t("sa.prod_preview")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteProduct(p.id)} className="text-destructive"><Trash2 size={14} className="mr-2" /> {t("sa.prod_delete")}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="card-types">
          <Card className="border-border/50 bg-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cardTypes.map(ct => (
                  <div key={ct.id} className="relative group rounded-xl border border-border/50 bg-secondary/30 overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
                    {/* Card Image */}
                    <div className="aspect-[4/3] bg-secondary flex items-center justify-center overflow-hidden">
                      {ct.image && ct.image !== "/placeholder.svg" ? (
                        <img src={ct.image} alt={ct.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <CreditCard size={32} />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    {/* Color bar */}
                    <div className="h-1.5" style={{ backgroundColor: ct.color }} />
                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full border border-border shrink-0" style={{ backgroundColor: ct.color }} />
                          <span className="font-semibold text-sm">{ct.name}</span>
                        </div>
                        <Badge variant={ct.active ? "default" : "secondary"} className="text-[10px]">
                          {ct.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        ID: {ct.id}
                      </div>
                    </div>
                    {/* Actions overlay */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditCardType(ct)} className="rounded-full bg-background/80 backdrop-blur p-1.5 hover:bg-background transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => deleteCardType(ct.id)} className="rounded-full bg-background/80 backdrop-blur p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add new card */}
                <button
                  onClick={openCreateCardType}
                  className="aspect-[4/3] rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-secondary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Plus size={24} />
                  <span className="text-sm font-medium">Add Card Type</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t("sa.prod_edit_product") : t("sa.prod_create_product")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("sa.prod_price_label")}</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} /></div>
              <div className="flex items-end gap-3 pb-1"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><Label>{t("sa.prod_active")}</Label></div>
            </div>

            <ImageDropZone
              label={t("sa.prod_image_url") || "Product Image (Primary)"}
              value={form.image}
              onChange={(url) => setForm(f => ({ ...f, image: url }))}
            />

            <GalleryUploader
              items={form.gallery}
              onChange={(items) => setForm(f => ({ ...f, gallery: items }))}
            />

            {/* Card Settings */}
            <div className="space-y-4 rounded-lg border border-border/50 p-4 bg-secondary/20">
              <Label className="flex items-center gap-2 text-sm font-semibold"><Settings2 size={14} /> Card Settings</Label>

              <div className="grid grid-cols-2 gap-4">
                {/* Dimensions */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" min={1} value={form.cardSettings.width} onChange={e => {
                        let w = Math.max(1, parseInt(e.target.value) || 1);
                        setForm(f => {
                          const cs = { ...f.cardSettings, width: w };
                          if (cs.layouts.includes("circle")) { cs.height = w; cs.cornerRadius = Math.round(w / 2); }
                          if (cs.layouts.includes("square")) { cs.height = w; }
                          if (cs.layouts.includes("landscape") && w < cs.height) { cs.height = w; }
                          if (cs.layouts.includes("portrait") && w > cs.height) { cs.height = w; }
                          return { ...f, cardSettings: cs };
                        });
                      }} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" min={1} value={form.cardSettings.height} onChange={e => {
                        let h = Math.max(1, parseInt(e.target.value) || 1);
                        setForm(f => {
                          const cs = { ...f.cardSettings, height: h };
                          if (cs.layouts.includes("circle")) { cs.width = h; cs.cornerRadius = Math.round(h / 2); }
                          if (cs.layouts.includes("square")) { cs.width = h; }
                          if (cs.layouts.includes("landscape") && h > cs.width) { cs.width = h; }
                          if (cs.layouts.includes("portrait") && h < cs.width) { cs.width = h; }
                          return { ...f, cardSettings: cs };
                        });
                      }} className="h-8 text-sm" disabled={form.cardSettings.layouts.includes("circle")} />
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground bg-secondary/50 rounded px-2 py-1 font-mono">
                    Aspect Ratio: {(form.cardSettings.width / form.cardSettings.height).toFixed(2)} ({form.cardSettings.width}×{form.cardSettings.height})
                  </div>

                  {/* Corner Radius */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Corner Radius</Label>
                      <Switch
                        checked={form.cardSettings.cornerRadiusEnabled}
                        onCheckedChange={v => setForm(f => ({ ...f, cardSettings: { ...f.cardSettings, cornerRadiusEnabled: v, cornerRadius: v ? 8 : 0 } }))}
                        disabled={form.cardSettings.layouts.includes("circle")}
                      />
                    </div>
                    {form.cardSettings.cornerRadiusEnabled && (
                      <Input type="number" min={0} value={form.cardSettings.cornerRadius} onChange={e => {
                        const r = Math.max(0, parseInt(e.target.value) || 0);
                        setForm(f => ({ ...f, cardSettings: { ...f.cardSettings, cornerRadius: r } }));
                      }} className="h-8 text-sm" disabled={form.cardSettings.layouts.includes("circle")} />
                    )}
                  </div>

                  {/* Layout Types */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Layout Types</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {LAYOUT_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        const isActive = form.cardSettings.layouts.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setForm(f => {
                                let layouts = [...f.cardSettings.layouts];
                                let cs = { ...f.cardSettings };
                                if (isActive) {
                                  layouts = layouts.filter(l => l !== opt.value);
                                  if (layouts.length === 0) layouts = ["landscape"];
                                } else {
                                  layouts.push(opt.value);
                                }
                                cs.layouts = layouts;
                                if (opt.value === "circle" && !isActive) {
                                  const maxDim = Math.max(cs.width, cs.height);
                                  cs.width = maxDim;
                                  cs.height = maxDim;
                                  cs.cornerRadiusEnabled = true;
                                  cs.cornerRadius = Math.round(maxDim / 2);
                                }
                                if (opt.value === "landscape" && !isActive) {
                                  if (cs.height > cs.width) {
                                    const tmp = cs.width; cs.width = cs.height; cs.height = tmp;
                                  }
                                }
                                if (opt.value === "portrait" && !isActive) {
                                  if (cs.width > cs.height) {
                                    const tmp = cs.width; cs.width = cs.height; cs.height = tmp;
                                  }
                                }
                                if (opt.value === "square" && !isActive) {
                                  const maxDim = Math.max(cs.width, cs.height);
                                  cs.width = maxDim;
                                  cs.height = maxDim;
                                }
                                return { ...f, cardSettings: cs };
                              });
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors",
                              isActive ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/40"
                            )}
                          >
                            <Icon size={12} /> {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {form.cardSettings.layouts.includes("landscape") && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <RectangleHorizontal size={10} /> Landscape lock: width ≥ height enforced
                      </p>
                    )}
                    {form.cardSettings.layouts.includes("portrait") && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <RectangleVertical size={10} /> Portrait lock: height ≥ width enforced
                      </p>
                    )}
                  </div>

                  {/* Review Platform */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Review Platform</Label>
                    <Select value={form.cardSettings.reviewPlatform} 
                      onValueChange={(v) => {
                      const platformTemplates = getApiTemplatesForPlatform(v);
                      const firstId = platformTemplates[0]?.id || "";
                      setForm(f => ({
                        ...f,
                        cardSettings: {
                          ...f.cardSettings,
                          reviewPlatform:     v,
                          defaultTemplateId:  firstId,
                          availableTemplates: platformTemplates.map(t => t.id), // ✅ déjà correct
                        },
                      }));
                    }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                              {p.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1">
                       {PLATFORMS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              const platformTemplates = getApiTemplatesForPlatform(p.id);
                              const firstId = platformTemplates[0]?.id || "";
                              setForm(f => ({
                                ...f,
                                cardSettings: {
                                  ...f.cardSettings,
                                  reviewPlatform:     p.id,
                                  defaultTemplateId:  firstId,
                                  availableTemplates: platformTemplates.map(t => t.id), // ✅ déjà correct
                                },
                              }));
                            }}
                          />
                        ))}
                    </div>
                  </div>
                </div>

                {/* Card Templates */}
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs font-semibold flex items-center gap-2"><Palette size={12} /> Card Templates ({getApiTemplatesForPlatform(form.cardSettings.reviewPlatform).length} available)</Label>
                  <ScrollArea className="max-h-[180px]">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pr-2">
                      {getApiTemplatesForPlatform(form.cardSettings.reviewPlatform).map(tmpl => {
                        const isDefault = form.cardSettings.defaultTemplateId === tmpl.id;
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                             onClick={() => setForm(f => ({
                              ...f,
                              cardSettings: {
                                ...f.cardSettings,
                                defaultTemplateId:  tmpl.id,
                                availableTemplates: getApiTemplatesForPlatform(
                                  f.cardSettings.reviewPlatform
                                ).map(t => t.id),
                              },
                            }))}
                            className={cn(
                              "relative rounded-lg overflow-hidden border-2 transition-all aspect-[3/2]",
                              isDefault ? "border-primary ring-2 ring-primary/30 scale-[1.02]" : "border-border/40 hover:border-primary/40"
                            )}
                          >
                            <div className="absolute inset-0" style={{ background: apiGradientCSS(tmpl.gradient) }} />
                            {tmpl.bandColor1 && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: tmpl.bandColor1 }} />}
                            {tmpl.bandColor2 && <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: tmpl.bandColor2 }} />}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-10 p-2">
                              <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={8} fill={tmpl.starsColor || "#FBBF24"} color={tmpl.starsColor || "#FBBF24"} />)}</div>
                              <span className="text-[8px] font-semibold text-center px-1 truncate max-w-full leading-tight" style={{ color: tmpl.textColor }}>{tmpl.name}</span>
                              <span className="text-[7px] px-1.5 py-0.5 rounded-full border border-white/20 bg-white/10 text-white leading-none">{PLATFORMS.find(p => p.id === tmpl.platform)?.icon} {PLATFORMS.find(p => p.id === tmpl.platform)?.label}</span>
                            </div>
                            {isDefault && (
                              <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground rounded-full p-0.5 z-20">
                                <Check size={8} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Live Preview with Front/Back toggle */}
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Live Preview</Label>
                    <div className="flex items-center gap-1.5 bg-secondary rounded-md p-0.5">
                      {["front", "back"].map(side => (
                        <button
                          key={side}
                          type="button"
                          onClick={() => setPreviewSide(side)}
                          className={cn(
                            "px-2.5 py-1 rounded text-[10px] font-medium transition-colors capitalize",
                            previewSide === side ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {side}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    {(() => {
                      const { defaultTemplateId } = form.cardSettings;
                      const template = findApiTemplateById(defaultTemplateId);

                      if (!template) {
                        return (
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-[120px]">
                            <span className="text-sm">No template selected</span>
                          </div>
                        );
                      }

                      const gradient = Array.isArray(template.gradient) ? template.gradient : JSON.parse(template.gradient || '["#1a1a1a","#1a1a1a"]');
                      const offsets = template?.elementOffsets?.[template.orientation]?.[previewSide] || {};

                      return (
                        <div className="w-full max-w-[380px] mx-auto">
                          <SharedCardPreview
                            design={{
                              businessName: template.businessName || "Business Name",
                              slogan: template.slogan,
                              textColor: template.textColor || "#fff",
                              cta: template.cta,
                              logoUrl: template.logoUrl,
                              qrColor: template.qrColor || "#000000",
                            }}
                            orientation={template.orientation || "landscape"}
                            side={previewSide}
                            frontLine1={template.frontLine1}
                            frontLine2={template.frontLine2}
                            backLine1={template.backLine1}
                            backLine2={template.backLine2}
                            gradient1={gradient[0]}
                            gradient2={gradient[1]}
                            accentBand1={template.bandColor1}
                            accentBand2={template.bandColor2}
                            pattern={template.pattern}
                            bandPosition={template.bandPosition}
                            colorMode={template.colorMode}
                            nameFont={template.nameFont}
                            sloganFont={template.sloganFont}
                            nameFontSize={template.nameFontSize}
                            sloganFontSize={template.sloganFontSize}
                            nameLetterSpacing={template.nameLetterSpacing}
                            sloganLetterSpacing={template.sloganLetterSpacing}
                            nameTextTransform={template.nameTextTransform}
                            sloganTextTransform={template.sloganTextTransform}
                            nameLineHeight={template.nameLineHeight}
                            sloganLineHeight={template.sloganLineHeight}
                            nameTextAlign={template.nameTextAlign}
                            sloganTextAlign={template.sloganTextAlign}
                            qrPosition={template.qrPosition}
                            logoPosition={template.logoPosition}
                            logoSize={template.logoSize}
                            qrSize={template.qrSize}
                            instructionFont={template.instructionFont}
                            instructionFontSize={template.instructionFontSize}
                            instructionLetterSpacing={template.instructionLetterSpacing}
                            instructionLineHeight={template.instructionLineHeight}
                            instructionTextAlign={template.instructionTextAlign}
                            nameFontWeight={template.nameFontWeight}
                            sloganFontWeight={template.sloganFontWeight}
                            instructionFontWeight={template.instructionFontWeight}
                            checkStrokeWidth={template.checkStrokeWidth}
                            starsColor={template.starsColor}
                            iconsColor={template.iconsColor}
                            nfcIconSize={template.nfcIconSize}
                            showNfcIcon={template.showNfcIcon}
                            showGoogleIcon={template.showGoogleIcon}
                            frontBandHeight={template.frontBandHeight}
                            backBandHeight={template.backBandHeight}
                            textShadow={template.textShadow}
                            ctaPaddingTop={template.ctaPaddingTop}
                            googleIconSize={template.googleIconSize}
                            dragMode={false}
                            elementOffsets={offsets}
                            onElementDrag={() => {}}
                          />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center space-y-0.5">
                    <p>{form.cardSettings.width}×{form.cardSettings.height}mm · Ratio {(form.cardSettings.width / form.cardSettings.height).toFixed(2)}</p>
                    <p>Radius: {form.cardSettings.cornerRadiusEnabled ? `${form.cardSettings.cornerRadius}mm` : "Sharp"} · {PLATFORMS.find(p => p.id === form.cardSettings.reviewPlatform)?.label}</p>
                    <p className="font-medium">{findApiTemplateById(form.cardSettings.defaultTemplateId)?.name || "No template"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/50 p-4 bg-secondary/20">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-semibold"><Layers size={14} /> Package Pricing (Quantity Tiers)</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const maxQty = form.packageTiers.length > 0 ? Math.max(...form.packageTiers.map(t => t.qty)) : 0;
                  setForm(f => ({ ...f, packageTiers: [...f.packageTiers, { qty: maxQty > 0 ? maxQty * 2 : 1, price: 0 }].sort((a, b) => a.qty - b.qty) }));
                }}>
                  <Plus size={12} className="mr-1" /> Add Tier
                </Button>
              </div>
              {form.packageTiers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No package tiers defined. Base price will be used. Click "Add Tier" to create quantity-based pricing.</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                    <span>Quantity (cards)</span><span>Price per card ($)</span><span></span>
                  </div>
                  {form.packageTiers.map((tier, i) => {
                    const isDuplicate = form.packageTiers.some((t, j) => j !== i && t.qty === tier.qty);
                    return (
                      <div key={i} className={cn("grid grid-cols-[1fr_1fr_40px] gap-2 items-center", isDuplicate && "ring-1 ring-destructive/50 rounded-md p-1 -mx-1")}>
                        <div className="space-y-0.5">
                          <Input type="number" min={1} value={tier.qty} onChange={e => {
                            const tiers = [...form.packageTiers];
                            tiers[i] = { ...tiers[i], qty: parseInt(e.target.value) || 1 };
                            tiers.sort((a, b) => a.qty - b.qty);
                            setForm(f => ({ ...f, packageTiers: tiers }));
                          }} className={cn("h-8 text-sm", isDuplicate && "border-destructive")} />
                          {isDuplicate && <p className="text-[9px] text-destructive">Duplicate quantity</p>}
                        </div>
                        <Input type="number" min={0} step={0.01} value={tier.price} onChange={e => {
                          const tiers = [...form.packageTiers];
                          tiers[i] = { ...tiers[i], price: parseFloat(e.target.value) || 0 };
                          setForm(f => ({ ...f, packageTiers: tiers }));
                        }} className="h-8 text-sm" />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                          setForm(f => ({ ...f, packageTiers: f.packageTiers.filter((_, j) => j !== i) }));
                        }}><X size={14} /></Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card Type Pricing */}
            <div className="space-y-3 rounded-lg border border-border/50 p-4 bg-secondary/20">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-semibold"><CreditCard size={14} /> Card Type Pricing</Label>
                {form.cardTypePrices.length === 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, cardTypePrices: cardTypes.filter(ct => ct.active).map(ct => ({ typeId: ct.id, price: 0 })) }))}>
                    <Plus size={12} className="mr-1" /> Enable Card Types
                  </Button>
                )}
              </div>
              {form.cardTypePrices.length === 0 ? (
                <p className="text-xs text-muted-foreground">No card type pricing. Click "Enable Card Types" to define prices per card type.</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                    <span>Card Type</span><span>Additional Price ($)</span><span></span>
                  </div>
                  {form.cardTypePrices.map((ct, i) => {
                    const typeConfig = cardTypes.find(c => c.id === ct.typeId);
                    return (
                      <div key={ct.typeId} className="grid grid-cols-[1fr_1fr_40px] gap-2 items-center">
                        <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-input bg-background text-sm">
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: typeConfig?.color || "#6b7280" }} />
                          {typeConfig?.name || ct.typeId}
                        </div>
                        <Input type="number" min={0} step={0.01} value={ct.price} onChange={e => {
                          const prices = [...form.cardTypePrices];
                          prices[i] = { ...prices[i], price: parseFloat(e.target.value) || 0 };
                          setForm(f => ({ ...f, cardTypePrices: prices }));
                        }} className="h-8 text-sm" />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                          setForm(f => ({ ...f, cardTypePrices: f.cardTypePrices.filter((_, j) => j !== i) }));
                        }}><X size={14} /></Button>
                      </div>
                    );
                  })}
                  {form.cardTypePrices.length < cardTypes.filter(ct => ct.active).length && (
                    <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => {
                      const existing = form.cardTypePrices.map(c => c.typeId);
                      const next = cardTypes.find(ct => ct.active && !existing.includes(ct.id));
                      if (next) setForm(f => ({ ...f, cardTypePrices: [...f.cardTypePrices, { typeId: next.id, price: 0 }] }));
                    }}><Plus size={12} className="mr-1" /> Add Type</Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="flex items-center gap-2"><Globe size={14} /> {t("sa.prod_lang_versions")}</Label>
              <select onChange={e => { if (e.target.value) addLang(e.target.value); e.target.value = ""; }} className="text-xs bg-secondary border border-border rounded px-2 py-1">
                <option value="">{t("sa.prod_add_lang")}</option>
                {languages.filter(l => !form.title[l] && form.title[l] !== "").map(l => <option key={l} value={l}>{langLabels[l]}</option>)}
              </select>
            </div>

            <Tabs value={activeLang} onValueChange={setActiveLang}>
              <TabsList>{Object.keys(form.title).map(l => <TabsTrigger key={l} value={l} className="text-xs">{langLabels[l] || l.toUpperCase()}</TabsTrigger>)}</TabsList>
              {Object.keys(form.title).map(l => (
                <TabsContent key={l} value={l} className="space-y-3">
                  <div><Label>{t("sa.prod_title_label")} ({langLabels[l]})</Label><Input value={form.title[l] || ""} onChange={e => {
                    const newTitle = e.target.value;
                    setForm(f => ({
                      ...f,
                      title: { ...f.title, [l]: newTitle },
                      slug: slugManualEdits[l] ? f.slug : { ...f.slug, [l]: titleToSlug(newTitle) },
                    }));
                  }} /></div>
                  <div>
                    <Label>{t("sa.prod_slug")} ({langLabels[l]})</Label>
                    <Input
                      value={form.slug[l] || ""}
                      onChange={e => {
                        const val = e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                        setSlugManualEdits(prev => ({ ...prev, [l]: true }));
                        setForm(f => ({ ...f, slug: { ...f.slug, [l]: val } }));
                      }}
                      className="font-mono text-sm"
                      placeholder={t("sa.prod_slug_placeholder") || "auto-generated-from-title"}
                    />
                    {!slugManualEdits[l] && <p className="text-[10px] text-muted-foreground mt-0.5">Auto-generated from title</p>}
                  </div>
                  <div><Label>{t("sa.prod_seo_title")} ({langLabels[l]})</Label><Input value={form.seoTitle[l] || ""} onChange={e => setForm(f => ({ ...f, seoTitle: { ...f.seoTitle, [l]: e.target.value } }))} /></div>
                  <div><Label>{t("sa.prod_meta_desc")} ({langLabels[l]})</Label><Textarea value={form.metaDescription[l] || ""} onChange={e => setForm(f => ({ ...f, metaDescription: { ...f.metaDescription, [l]: e.target.value } }))} rows={3} /></div>
                  <ImageDropZone
                    label={`${t("sa.prod_meta_image") || "Meta Image"} (${langLabels[l]})`}
                    value={form.metaImage[l] || "/placeholder.svg"}
                    onChange={(url) => setForm(f => ({ ...f, metaImage: { ...f.metaImage, [l]: url } }))}
                  />
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("sa.prod_cancel")}</Button>
              <Button onClick={save}>{editing ? t("sa.prod_update") : t("sa.prod_create")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          {previewProduct && (
            <div className="space-y-6">
              <ProductGallery
                images={[
                  previewProduct.image !== "/placeholder.svg" ? previewProduct.image : null,
                  ...previewProduct.gallery.map(g => ({ url: g.url, type: g.type, poster: g.poster }))
                ].filter(Boolean)}
                productName={previewProduct.title.en}
                variant="compact"
              />
              <div>
                <h2 className="font-display text-2xl font-bold">{previewProduct.title.en}</h2>
                <p className="mt-2 text-muted-foreground">{previewProduct.metaDescription.en}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="font-display text-3xl font-bold">${previewProduct.price}</span>
                  <Badge variant={previewProduct.active ? "default" : "secondary"}>{previewProduct.active ? t("sa.prod_active") : t("sa.prod_inactive")}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Card Type Create/Edit Dialog */}
      <Dialog open={cardTypeDialogOpen} onOpenChange={setCardTypeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCardType ? "Edit Card Type" : "Create Card Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={cardTypeForm.name} onChange={e => setCardTypeForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Gold" />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="relative">
                  <input
                    type="color"
                    value={cardTypeForm.color}
                    onChange={e => setCardTypeForm(f => ({ ...f, color: e.target.value }))}
                    className="h-10 w-10 rounded-lg border border-input cursor-pointer bg-transparent p-0.5"
                  />
                </div>
                <Input
                  value={cardTypeForm.color}
                  onChange={e => setCardTypeForm(f => ({ ...f, color: e.target.value }))}
                  className="font-mono text-sm flex-1"
                  placeholder="#6b7280"
                />
                <div className="h-10 w-20 rounded-lg border border-border" style={{ backgroundColor: cardTypeForm.color }} />
              </div>
            </div>

            <ImageDropZone
              label="Card Type Image"
              value={cardTypeForm.image}
              onChange={(url) => setCardTypeForm(f => ({ ...f, image: url }))}
            />

            <div className="flex items-center gap-3">
              <Switch checked={cardTypeForm.active} onCheckedChange={v => setCardTypeForm(f => ({ ...f, active: v }))} />
              <Label>Active</Label>
            </div>

            {editingCardType && (
              <div className="text-xs text-muted-foreground font-mono bg-secondary/50 rounded-md px-3 py-2">
                ID: {editingCardType.id}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setCardTypeDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveCardType}>{editingCardType ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default Products;

